import { isAbsolute, relative, resolve, sep } from 'node:path';

export const USAGE = `Usage: rn-showcase add <name> [options]

Options:
  --path <path>           Destination directory (default: components/ui)
  --cwd <path>            Project directory (default: current directory)
  --overwrite             Replace existing component files
  --skip-dependencies     Copy source without installing dependencies
  --help                  Show this help message`;

export class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}

function readOptionValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new UsageError(`${option} requires a value.`);
  }

  return value;
}

function validateTargetPath(targetPath) {
  const normalizedPath = relative('.', targetPath);
  if (
    isAbsolute(targetPath) ||
    normalizedPath === '..' ||
    normalizedPath.startsWith(`..${sep}`)
  ) {
    throw new UsageError('--path must stay inside the project directory.');
  }
}

export function parseArguments(args) {
  if (args.length === 0 || args.includes('--help')) {
    return { command: 'help' };
  }

  const [command, itemName, ...options] = args;
  if (command !== 'add') {
    throw new UsageError(`Unknown command: ${command}\n\n${USAGE}`);
  }

  if (!itemName || itemName.startsWith('--')) {
    throw new UsageError(USAGE);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(itemName)) {
    throw new UsageError(`Invalid registry item name: ${itemName}`);
  }

  const parsed = {
    command: 'add',
    cwd: process.cwd(),
    itemName,
    overwrite: false,
    skipDependencies: false,
    targetPath: 'components/ui',
  };

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];

    if (option === '--overwrite') {
      parsed.overwrite = true;
      continue;
    }

    if (option === '--skip-dependencies') {
      parsed.skipDependencies = true;
      continue;
    }

    if (option === '--cwd') {
      parsed.cwd = resolve(readOptionValue(options, index, option));
      index += 1;
      continue;
    }

    if (option === '--path') {
      parsed.targetPath = readOptionValue(options, index, option);
      validateTargetPath(parsed.targetPath);
      index += 1;
      continue;
    }

    throw new UsageError(`Unknown option: ${option}`);
  }

  return parsed;
}
