import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const recordingRoot = resolve(root, 'apps/showcase/.maestro/recordings');
const SUPPORTED_PLATFORMS = ['ios', 'android'];

function readJavaMajor(javaHome) {
  if (!javaHome) return undefined;

  const java = join(javaHome, 'bin', 'java');
  if (!existsSync(java)) return undefined;

  const result = spawnSync(java, ['-version'], { encoding: 'utf8' });
  const match = `${result.stdout}${result.stderr}`.match(/version "(\d+)/);

  return match ? Number(match[1]) : undefined;
}

function resolveMaestroEnvironment() {
  const candidates = [
    process.env.RN_SHOWCASE_JAVA_HOME,
    process.env.JAVA_HOME,
    '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    '/Volumes/1TB/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
  ].filter(Boolean);
  const javaHome = candidates.find((candidate) =>
    [17, 21].includes(readJavaMajor(candidate)),
  );

  if (!javaHome) return process.env;

  return {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${join(javaHome, 'bin')}${delimiter}${process.env.PATH ?? ''}`,
  };
}

const maestroEnvironment = resolveMaestroEnvironment();

function parseArguments(args) {
  const requestedNames = [];
  let requestedPlatform = 'all';

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--platform' || argument === '-p') {
      requestedPlatform = args[index + 1];
      index += 1;
      continue;
    }

    if (argument.startsWith('--platform=')) {
      requestedPlatform = argument.slice('--platform='.length);
      continue;
    }

    requestedNames.push(argument);
  }

  if (
    requestedPlatform !== 'all' &&
    !SUPPORTED_PLATFORMS.includes(requestedPlatform)
  ) {
    throw new Error(
      `Unsupported platform "${requestedPlatform}". Use ios, android, or all.`,
    );
  }

  return {
    platforms:
      requestedPlatform === 'all'
        ? SUPPORTED_PLATFORMS
        : [requestedPlatform],
    requestedNames,
  };
}

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

function createMaestroArguments(flow, platform, deviceId) {
  return [
    'test',
    '--no-reinstall-driver',
    '--platform',
    platform,
    '--udid',
    deviceId,
    flow,
  ];
}

function runMaestro(flow, platform, deviceId) {
  const result = spawnSync(
    'maestro',
    createMaestroArguments(flow, platform, deviceId),
    { cwd: root, env: maestroEnvironment, stdio: 'inherit' },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Maestro failed with status ${result.status ?? 'unknown'}`);
  }
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} failed with status ${result.status ?? 'unknown'}: ${result.stderr.trim()}`,
    );
  }

  return result.stdout;
}

function resolveDeviceId(platform) {
  if (platform === 'ios') {
    if (process.env.RN_SHOWCASE_IOS_UDID) {
      return process.env.RN_SHOWCASE_IOS_UDID;
    }

    const devices = JSON.parse(
      runCommand('xcrun', ['simctl', 'list', 'devices', 'booted', '--json']),
    ).devices;
    const device = Object.values(devices)
      .flat()
      .find((candidate) => candidate.state === 'Booted' && candidate.isAvailable);

    if (!device) {
      throw new Error(
        'No booted iOS Simulator found. Start one or set RN_SHOWCASE_IOS_UDID.',
      );
    }

    return device.udid;
  }

  if (process.env.RN_SHOWCASE_ANDROID_UDID) {
    return process.env.RN_SHOWCASE_ANDROID_UDID;
  }

  const device = runCommand('adb', ['devices'])
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .find(([, status]) => status === 'device');

  if (!device) {
    throw new Error(
      'No connected Android Emulator found. Start one or set RN_SHOWCASE_ANDROID_UDID.',
    );
  }

  return device[0];
}

function hasAndroidPackage(deviceId, packageName) {
  const result = spawnSync(
    'adb',
    ['-s', deviceId, 'shell', 'pm', 'path', packageName],
    { cwd: root, encoding: 'utf8' },
  );

  return result.status === 0 && result.stdout.includes('package:');
}

function installAndroidMaestroDriver(deviceId) {
  const packages = [
    { archiveEntry: 'maestro-app.apk', packageName: 'dev.mobile.maestro' },
    {
      archiveEntry: 'maestro-server.apk',
      packageName: 'dev.mobile.maestro.test',
    },
  ];

  if (
    packages.every(({ packageName }) =>
      hasAndroidPackage(deviceId, packageName),
    )
  ) {
    return;
  }

  const maestroExecutable = runCommand('which', ['maestro']).trim();
  const clientArchive = resolve(
    dirname(maestroExecutable),
    '..',
    'lib',
    'maestro-client.jar',
  );
  const temporaryDirectory = mkdtempSync(
    join(tmpdir(), 'rn-showcase-maestro-android-'),
  );

  try {
    for (const { archiveEntry } of packages) {
      const extraction = spawnSync(
        'unzip',
        ['-p', clientArchive, archiveEntry],
        { cwd: root, encoding: null, maxBuffer: 32 * 1024 * 1024 },
      );

      if (extraction.error) throw extraction.error;
      if (extraction.status !== 0) {
        throw new Error(`Could not extract ${archiveEntry} from Maestro.`);
      }

      const apkPath = join(temporaryDirectory, archiveEntry);
      writeFileSync(apkPath, extraction.stdout);
      runCommand('adb', ['-s', deviceId, 'install', '-r', '-g', apkPath]);
    }
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }
}

function delay(durationMs) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, durationMs));
}

async function startAndroidMaestroDriver(deviceId) {
  installAndroidMaestroDriver(deviceId);
  spawnSync(
    'adb',
    ['-s', deviceId, 'shell', 'am', 'force-stop', 'dev.mobile.maestro'],
    { cwd: root, stdio: 'ignore' },
  );

  const child = spawn(
    'adb',
    [
      '-s',
      deviceId,
      'shell',
      'am',
      'instrument',
      '-w',
      '-r',
      'dev.mobile.maestro.test/androidx.test.runner.AndroidJUnitRunner',
    ],
    { cwd: root, stdio: 'ignore' },
  );

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error('Maestro Android driver exited before it became ready.');
    }

    const process = spawnSync(
      'adb',
      ['-s', deviceId, 'shell', 'pidof', 'dev.mobile.maestro'],
      { cwd: root, encoding: 'utf8' },
    );
    if (process.status === 0 && process.stdout.trim()) {
      await delay(750);
      return child;
    }

    await delay(250);
  }

  child.kill('SIGTERM');
  throw new Error('Timed out while starting the Maestro Android driver.');
}

async function stopAndroidMaestroDriver(deviceId, child) {
  spawnSync(
    'adb',
    ['-s', deviceId, 'shell', 'am', 'force-stop', 'dev.mobile.maestro'],
    { cwd: root, stdio: 'ignore' },
  );
  await stopChildRecorder(child);
}

function startRecorder(platform, deviceId, temporaryVideo) {
  if (platform === 'ios') {
    return {
      child: spawn(
        'xcrun',
        [
          'simctl',
          'io',
          deviceId,
          'recordVideo',
          '--codec=h264',
          temporaryVideo,
        ],
        { stdio: 'inherit' },
      ),
      deviceId,
      platform,
      temporaryVideo,
    };
  }

  const remoteVideo = `/sdcard/rn-showcase-${Date.now()}.mp4`;
  runCommand('adb', ['-s', deviceId, 'shell', 'rm', '-f', remoteVideo]);

  return {
    child: spawn(
      'adb',
      [
        '-s',
        deviceId,
        'shell',
        'screenrecord',
        '--bit-rate',
        '12000000',
        '--time-limit',
        '180',
        remoteVideo,
      ],
      { stdio: 'inherit' },
    ),
    deviceId,
    platform,
    remoteVideo,
    temporaryVideo,
  };
}

function runRecordedMaestro(
  flow,
  temporaryVideo,
  flowName,
  platform,
  deviceId,
) {
  return new Promise((resolveFlow, rejectFlow) => {
    const maestro = spawn(
      'maestro',
      createMaestroArguments(flow, platform, deviceId),
      {
        cwd: root,
        env: maestroEnvironment,
        stdio: ['inherit', 'pipe', 'pipe'],
      },
    );
    let recorder;
    let recorderStartedAtMs;
    let output = '';

    const forwardOutput = (stream, chunk) => {
      const text = chunk.toString();
      stream.write(text);
      output += text;

      if (!recorder && output.includes(`> Flow ${flowName}`)) {
        recorder = startRecorder(platform, deviceId, temporaryVideo);
        recorderStartedAtMs = Date.now();
      }
    };

    maestro.stdout.on('data', (chunk) => forwardOutput(process.stdout, chunk));
    maestro.stderr.on('data', (chunk) => forwardOutput(process.stderr, chunk));
    maestro.once('error', rejectFlow);
    maestro.once('close', async (status) => {
      try {
        let recordedDurationMs;
        if (recorder && recorderStartedAtMs) {
          const elapsedMs = Date.now() - recorderStartedAtMs;
          if (elapsedMs < 1500) await delay(1500 - elapsedMs);
          recordedDurationMs = Math.max(elapsedMs, 1500);
          await stopRecorder(recorder);
        }
        if (status !== 0) {
          rejectFlow(
            new Error(`Maestro failed with status ${status ?? 'unknown'}`),
          );
          return;
        }

        resolveFlow(recordedDurationMs);
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

async function stopChildRecorder(child) {
  if (child.exitCode !== null) return;

  child.kill('SIGINT');
  const forceStopTimeout = setTimeout(() => {
    if (child.exitCode === null) child.kill('SIGTERM');
  }, 10000);

  try {
    await waitForExit(child);
  } finally {
    clearTimeout(forceStopTimeout);
  }
}

async function waitForChildRecorder(child) {
  if (child.exitCode !== null) return;

  const forceStopTimeout = setTimeout(() => {
    if (child.exitCode === null) child.kill('SIGTERM');
  }, 10000);

  try {
    await waitForExit(child);
  } finally {
    clearTimeout(forceStopTimeout);
  }
}

async function stopRecorder(recorder) {
  if (recorder.platform === 'ios') {
    await stopChildRecorder(recorder.child);
    return;
  }

  const screenrecordPids = spawnSync(
    'adb',
    ['-s', recorder.deviceId, 'shell', 'pidof', 'screenrecord'],
    { cwd: root, encoding: 'utf8' },
  ).stdout.trim();
  for (const pid of screenrecordPids.split(/\s+/).filter(Boolean)) {
    spawnSync(
      'adb',
      ['-s', recorder.deviceId, 'shell', 'kill', '-2', pid],
      { cwd: root, stdio: 'ignore' },
    );
  }
  await waitForChildRecorder(recorder.child);
  runCommand('adb', [
    '-s',
    recorder.deviceId,
    'pull',
    recorder.remoteVideo,
    recorder.temporaryVideo,
  ]);
  runCommand('adb', [
    '-s',
    recorder.deviceId,
    'shell',
    'rm',
    '-f',
    recorder.remoteVideo,
  ]);
}

async function recordTarget(target, platform, deviceId) {
  const setupFlow = join(target.directory, `${target.name}-setup.yaml`);
  const platformFlow = join(
    target.directory,
    `${target.name}-record-${platform}.yaml`,
  );
  const recordFlow = existsSync(platformFlow) ? platformFlow : target.flow;
  if (!existsSync(setupFlow)) {
    throw new Error(`Missing setup flow for ${target.key}: ${setupFlow}`);
  }

  console.log(`Preparing ${target.key} on ${platform}`);
  runMaestro(setupFlow, platform, deviceId);

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
    `${target.name}-${platform}.mp4`,
  );

  try {
    const durationMs = await runRecordedMaestro(
      recordFlow,
      temporaryVideo,
      target.name,
      platform,
      deviceId,
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

const { platforms, requestedNames } = parseArguments(process.argv.slice(2));
const targets = resolveTargets(requestedNames);
if (targets.length === 0) {
  throw new Error(`No recording flows found under ${recordingRoot}`);
}

for (const platform of platforms) {
  const deviceId = resolveDeviceId(platform);
  const androidDriver =
    platform === 'android'
      ? await startAndroidMaestroDriver(deviceId)
      : undefined;
  console.log(`Recording ${platform} on ${deviceId}`);

  try {
    for (const target of targets) {
      await recordTarget(target, platform, deviceId);
    }
  } finally {
    if (androidDriver) {
      await stopAndroidMaestroDriver(deviceId, androidDriver);
    }
  }
}
