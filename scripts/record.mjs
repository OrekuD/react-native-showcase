import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const recordingRoot = resolve(root, 'apps/showcase/.maestro/recordings');

function findRecordFlows(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) return findRecordFlows(entryPath);
    if (!entry.isFile() || !entry.name.endsWith('-record.yaml')) return [];

    const name = entry.name.replace(/-record\.yaml$/, '');
    const relativeDirectory = relative(recordingRoot, directory);
    const key = [relativeDirectory, name].filter(Boolean).join('/');
    const optionsPath = join(directory, `${name}-record.json`);
    const options = existsSync(optionsPath)
      ? JSON.parse(readFileSync(optionsPath, 'utf8'))
      : {};

    return [{ directory, flow: entryPath, key, name, options }];
  });
}

function resolveTargets(requestedNames) {
  const available = findRecordFlows(recordingRoot).sort((left, right) =>
    left.key.localeCompare(right.key),
  );

  if (requestedNames.length === 0) return available;

  return requestedNames.flatMap((requestedName) => {
    const normalizedName = requestedName
      .replace(/\.yaml$/, '')
      .replace(/-record$/, '')
      .replace(/^recordings[\\/]/, '')
      .split(sep)
      .join('/');
    const matches = available.filter(
      (target) => target.key === normalizedName || target.name === normalizedName,
    );

    if (matches.length === 0) {
      throw new Error(
        `No recording flow named "${requestedName}". Available flows: ${available
          .map((target) => target.key)
          .join(', ')}`,
      );
    }

    if (matches.length > 1) {
      throw new Error(
        `Recording name "${requestedName}" is ambiguous. Use one of: ${matches
          .map((target) => target.key)
          .join(', ')}`,
      );
    }

    return matches;
  });
}

function runMaestro(flow) {
  const result = spawnSync(
    'maestro',
    ['test', '--no-reinstall-driver', flow],
    { cwd: root, stdio: 'inherit' },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Maestro failed with status ${result.status ?? 'unknown'}`);
  }
}

function startSimulatorRecorder(temporaryVideo) {
  return spawn(
    'xcrun',
    ['simctl', 'io', 'booted', 'recordVideo', '--codec=h264', temporaryVideo],
    { stdio: 'inherit' },
  );
}

function runRecordedMaestro(flow, temporaryVideo, flowName) {
  return new Promise((resolveFlow, rejectFlow) => {
    const maestro = spawn(
      'maestro',
      ['test', '--no-reinstall-driver', flow],
      { cwd: root, stdio: ['inherit', 'pipe', 'pipe'] },
    );
    let recorder;
    let recorderStartedAtMs;
    let output = '';

    const forwardOutput = (stream, chunk) => {
      const text = chunk.toString();
      stream.write(text);
      output += text;

      if (!recorder && output.includes(`> Flow ${flowName}`)) {
        recorder = startSimulatorRecorder(temporaryVideo);
        recorderStartedAtMs = Date.now();
      }
    };

    maestro.stdout.on('data', (chunk) => forwardOutput(process.stdout, chunk));
    maestro.stderr.on('data', (chunk) => forwardOutput(process.stderr, chunk));
    maestro.once('error', rejectFlow);
    maestro.once('close', async (status) => {
      const flowDurationMs = recorderStartedAtMs
        ? Date.now() - recorderStartedAtMs
        : undefined;

      try {
        if (recorder) await stopRecorder(recorder);
        if (status !== 0) {
          rejectFlow(
            new Error(`Maestro failed with status ${status ?? 'unknown'}`),
          );
          return;
        }

        resolveFlow(flowDurationMs);
      } catch (error) {
        rejectFlow(error);
      }
    });
  });
}

function normalizeVideo(source, destination, durationMs, options = {}) {
  const durationSeconds = Math.max(0.5, durationMs / 1000 + 0.25);
  const segmentFilter = options.segments
    ?.map(
      ({ startMs, endMs }, index) =>
        `[0:v]trim=start=${startMs / 1000}:end=${endMs / 1000},setpts=PTS-STARTPTS[v${index}]`,
    )
    .join(';');
  const videoFilters = options.segments?.length
    ? [
        '-filter_complex',
        `${segmentFilter};${options.segments
          .map((_, index) => `[v${index}]`)
          .join('')}concat=n=${options.segments.length}:v=1:a=0,fps=30,format=yuv420p[v]`,
        '-map',
        '[v]',
      ]
    : [
        '-t',
        durationSeconds.toFixed(3),
        '-vf',
        'fps=30,format=yuv420p',
      ];
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-i',
      source,
      '-an',
      ...videoFilters,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '18',
      '-movflags',
      '+faststart',
      destination,
    ],
    { cwd: root, stdio: 'inherit' },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed with status ${result.status ?? 'unknown'}`);
  }
}

function waitForExit(child) {
  return new Promise((resolveExit, reject) => {
    if (child.exitCode !== null) {
      resolveExit(child.exitCode);
      return;
    }

    child.once('error', reject);
    child.once('close', resolveExit);
  });
}

async function stopRecorder(recorder) {
  if (recorder.exitCode !== null) return;

  recorder.kill('SIGINT');

  await Promise.race([
    waitForExit(recorder),
    new Promise((resolveExit) => {
      setTimeout(() => {
        if (recorder.exitCode === null) recorder.kill('SIGTERM');
        resolveExit();
      }, 10000);
    }),
  ]);
}

async function recordTarget(target) {
  const setupFlow = join(target.directory, `${target.name}-setup.yaml`);
  if (!existsSync(setupFlow)) {
    throw new Error(`Missing setup flow for ${target.key}: ${setupFlow}`);
  }

  console.log(`Preparing ${target.key}`);
  runMaestro(setupFlow);

  const temporaryDirectory = mkdtempSync(
    join(tmpdir(), `rn-showcase-${target.name}-`),
  );
  const temporaryVideo = join(temporaryDirectory, `${target.name}.mp4`);
  const normalizedVideo = join(
    temporaryDirectory,
    `${target.name}-normalized.mp4`,
  );
  const destination = resolve(
    root,
    'apps/docs/public/videos',
    relative(recordingRoot, target.directory),
    `${target.name}.mp4`,
  );

  try {
    const durationMs = await runRecordedMaestro(
      target.flow,
      temporaryVideo,
      target.name,
    );
    if (!durationMs) {
      throw new Error(`Recorder did not start for ${target.key}`);
    }
    const normalizedDurationMs = target.options.maxDurationMs
      ? Math.min(durationMs, target.options.maxDurationMs)
      : durationMs;
    normalizeVideo(
      temporaryVideo,
      normalizedVideo,
      normalizedDurationMs,
      target.options,
    );
  } catch (error) {
    rmSync(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  if (!existsSync(temporaryVideo)) {
    throw new Error(`Recorder did not create ${temporaryVideo}`);
  }
  if (!existsSync(normalizedVideo)) {
    throw new Error(`ffmpeg did not create ${normalizedVideo}`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(normalizedVideo, destination);
  rmSync(temporaryDirectory, { force: true, recursive: true });
  console.log(`Wrote ${destination}`);
}

const targets = resolveTargets(process.argv.slice(2));
if (targets.length === 0) {
  throw new Error(`No recording flows found under ${recordingRoot}`);
}

for (const target of targets) {
  await recordTarget(target);
}
