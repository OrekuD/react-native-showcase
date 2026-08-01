import {
  chmodSync,
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);
const workspaceRoot = resolve(packageDirectory, '../..');
const sourceDirectory = join(packageDirectory, 'src');
const outputDirectory = join(packageDirectory, 'dist');
const registryDirectory = join(workspaceRoot, 'packages/registry/items');

rmSync(outputDirectory, { force: true, recursive: true });
cpSync(sourceDirectory, outputDirectory, { recursive: true });

for (const entry of readdirSync(registryDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const itemDirectory = join(registryDirectory, entry.name);
  const outputItemDirectory = join(outputDirectory, 'registry', entry.name);
  const manifest = JSON.parse(
    readFileSync(join(itemDirectory, 'registry.json'), 'utf8'),
  );
  const bundledManifest = {
    ...manifest,
    files: manifest.files.map((file) => ({
      source: file.target,
      target: file.target,
    })),
  };

  mkdirSync(outputItemDirectory, { recursive: true });
  for (const file of manifest.files) {
    cpSync(
      resolve(itemDirectory, file.source),
      join(outputItemDirectory, file.target),
    );
  }
  writeFileSync(
    join(outputItemDirectory, 'registry.json'),
    `${JSON.stringify(bundledManifest, null, 2)}\n`,
  );
}

chmodSync(join(outputDirectory, 'index.mjs'), 0o755);
