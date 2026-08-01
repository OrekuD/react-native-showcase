import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const PACKAGE_MANAGERS = ['pnpm', 'yarn', 'bun', 'npm'];

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function detectPackageManager(cwd) {
  try {
    const packageJson = JSON.parse(
      await readFile(join(cwd, 'package.json'), 'utf8'),
    );
    const configuredManager = packageJson.packageManager?.split('@')[0];
    if (PACKAGE_MANAGERS.includes(configuredManager)) {
      return configuredManager;
    }
  } catch {
    // Project validation reports malformed or missing package.json separately.
  }

  const lockfiles = [
    ['pnpm', 'pnpm-lock.yaml'],
    ['yarn', 'yarn.lock'],
    ['bun', 'bun.lock'],
    ['bun', 'bun.lockb'],
    ['npm', 'package-lock.json'],
  ];

  for (const [packageManager, lockfile] of lockfiles) {
    if (await fileExists(join(cwd, lockfile))) return packageManager;
  }

  return 'npm';
}

export function getDependencyCommands(packageManager, manifest) {
  const commands = [];

  if (manifest.expoDependencies.length > 0) {
    const expoCommands = {
      bun: ['bun', ['x', 'expo', 'install']],
      npm: ['npx', ['expo', 'install']],
      pnpm: ['pnpm', ['exec', 'expo', 'install']],
      yarn: ['yarn', ['expo', 'install']],
    };
    const [command, args] = expoCommands[packageManager];
    commands.push([command, [...args, ...manifest.expoDependencies]]);
  }

  if (manifest.dependencies.length > 0) {
    const addCommands = {
      bun: ['bun', ['add']],
      npm: ['npm', ['install']],
      pnpm: ['pnpm', ['add']],
      yarn: ['yarn', ['add']],
    };
    const [command, args] = addCommands[packageManager];
    commands.push([command, [...args, ...manifest.dependencies]]);
  }

  return commands;
}
