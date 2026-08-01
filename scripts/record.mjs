import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
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

    return [{ directory, flow: entryPath, key, name }];
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
    let output = '';

    const forwardOutput = (stream, chunk) => {
      const text = chunk.toString();
      stream.write(text);
      output += text;

      if (!recorder && output.includes(`> Flow ${flowName}`)) {
        recorder = startSimulatorRecorder(temporaryVideo);
      }
    };

    maestro.stdout.on('data', (chunk) => forwardOutput(process.stdout, chunk));
    maestro.stderr.on('data', (chunk) => forwardOutput(process.stderr, chunk));
    maestro.once('error', rejectFlow);
    maestro.once('close', async (status) => {
      try {
        if (recorder) await stopRecorder(recorder);
        if (status !== 0) {
          rejectFlow(
            new Error(`Maestro failed with status ${status ?? 'unknown'}`),
          );
          return;
        }

        resolveFlow();
      } catch (error) {
        rejectFlow(error);
      }
    });
  });
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
  const destination = resolve(
    root,
    'apps/docs/public/videos',
    relative(recordingRoot, target.directory),
    `${target.name}.mp4`,
  );

  try {
    await runRecordedMaestro(target.flow, temporaryVideo, target.name);
  } catch (error) {
    rmSync(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  if (!existsSync(temporaryVideo)) {
    throw new Error(`Recorder did not create ${temporaryVideo}`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(temporaryVideo, destination);
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
