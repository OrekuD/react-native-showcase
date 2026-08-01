import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
} from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

import {
  detectPackageManager,
  getDependencyCommands,
} from './packageManager.mjs';

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listRegistryItems(registryDirectory) {
  const entries = await readdir(registryDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function toPortablePath(path) {
  return path.split(sep).join('/');
}

function resolveProjectPath(cwd, targetPath) {
  const destination = resolve(cwd, targetPath);
  const projectRelativePath = relative(cwd, destination);

  if (
    isAbsolute(projectRelativePath) ||
    projectRelativePath === '..' ||
    projectRelativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`Destination must stay inside the project: ${targetPath}`);
  }

  return destination;
}

async function readManifest(registryDirectory, itemName) {
  const itemDirectory = join(registryDirectory, itemName);
  const manifestPath = join(itemDirectory, 'registry.json');

  if (!(await pathExists(manifestPath))) {
    const items = await listRegistryItems(registryDirectory);
    throw new Error(
      `Unknown registry item "${itemName}". Available items: ${items.join(', ')}`,
    );
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  return { itemDirectory, manifest };
}

export async function installItem({
  cwd,
  itemName,
  overwrite,
  registryDirectory,
  runCommand,
  skipDependencies,
  targetPath,
}) {
  const packageJsonPath = join(cwd, 'package.json');
  if (!(await pathExists(packageJsonPath))) {
    throw new Error(`No package.json found in ${cwd}.`);
  }

  const { itemDirectory, manifest } = await readManifest(
    registryDirectory,
    itemName,
  );
  const destinationDirectory = resolveProjectPath(cwd, targetPath);
  const files = manifest.files.map((file) => {
    const destination = join(destinationDirectory, file.target);
    return {
      destination,
      relativeDestination: toPortablePath(relative(cwd, destination)),
      source: resolve(itemDirectory, file.source),
    };
  });

  if (!overwrite) {
    for (const file of files) {
      if (await pathExists(file.destination)) {
        throw new Error(
          `Refusing to overwrite ${file.relativeDestination}. Run again with --overwrite to replace it.`,
        );
      }
    }
  }

  const packageManager = await detectPackageManager(cwd);
  if (!skipDependencies) {
    const commands = getDependencyCommands(packageManager, manifest);
    for (const [command, args] of commands) {
      await runCommand(command, args, { cwd });
    }
  }

  await mkdir(destinationDirectory, { recursive: true });
  for (const file of files) {
    await copyFile(file.source, file.destination);
  }

  return {
    files: files.map((file) => file.relativeDestination),
    packageManager,
    requiresPrebuild: Boolean(manifest.requiresPrebuild),
  };
}
