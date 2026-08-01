import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const bundledRegistry = resolve(moduleDirectory, 'registry');
const workspaceRegistry = resolve(moduleDirectory, '../../registry/items');

export const registryDirectory = existsSync(bundledRegistry)
  ? bundledRegistry
  : workspaceRegistry;
