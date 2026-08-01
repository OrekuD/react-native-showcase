import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { installItem } from '../src/installItem.mjs';

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'rn-showcase-cli-'));
  const projectDirectory = join(root, 'project');
  const registryDirectory = join(root, 'registry');
  const itemDirectory = join(registryDirectory, 'button');

  await mkdir(projectDirectory, { recursive: true });
  await mkdir(itemDirectory, { recursive: true });
  await writeFile(join(projectDirectory, 'package.json'), '{"name":"fixture"}');
  await writeFile(join(projectDirectory, 'pnpm-lock.yaml'), 'lockfileVersion: 9');
  await writeFile(join(itemDirectory, 'Button.tsx'), 'export const Button = {};\n');
  await writeFile(
    join(itemDirectory, 'registry.json'),
    JSON.stringify({
      dependencies: ['react-native-fast-squircle'],
      expoDependencies: ['expo-haptics', 'react-native-reanimated'],
      files: [{ source: 'Button.tsx', target: 'Button.tsx' }],
      name: 'button',
      requiresPrebuild: true,
    }),
  );

  return { projectDirectory, registryDirectory };
}

test('copies an item and installs dependencies with the detected package manager', async () => {
  const fixture = await createFixture();
  const commands = [];

  const result = await installItem({
    cwd: fixture.projectDirectory,
    itemName: 'button',
    overwrite: false,
    registryDirectory: fixture.registryDirectory,
    runCommand: async (command, args) => {
      commands.push([command, args]);
    },
    skipDependencies: false,
    targetPath: 'components/ui',
  });

  assert.equal(
    await readFile(
      join(fixture.projectDirectory, 'components/ui/Button.tsx'),
      'utf8',
    ),
    'export const Button = {};\n',
  );
  assert.deepEqual(commands, [
    [
      'pnpm',
      ['exec', 'expo', 'install', 'expo-haptics', 'react-native-reanimated'],
    ],
    ['pnpm', ['add', 'react-native-fast-squircle']],
  ]);
  assert.deepEqual(result, {
    files: ['components/ui/Button.tsx'],
    packageManager: 'pnpm',
    requiresPrebuild: true,
  });
});

test('does not run dependency commands when they are skipped', async () => {
  const fixture = await createFixture();
  let commandCount = 0;

  await installItem({
    cwd: fixture.projectDirectory,
    itemName: 'button',
    overwrite: false,
    registryDirectory: fixture.registryDirectory,
    runCommand: async () => {
      commandCount += 1;
    },
    skipDependencies: true,
    targetPath: 'src/components/ui',
  });

  assert.equal(commandCount, 0);
  assert.equal(
    await readFile(
      join(fixture.projectDirectory, 'src/components/ui/Button.tsx'),
      'utf8',
    ),
    'export const Button = {};\n',
  );
});

test('refuses to overwrite an existing source file by default', async () => {
  const fixture = await createFixture();
  const destination = join(fixture.projectDirectory, 'components/ui');
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, 'Button.tsx'), 'existing\n');

  await assert.rejects(
    installItem({
      cwd: fixture.projectDirectory,
      itemName: 'button',
      overwrite: false,
      registryDirectory: fixture.registryDirectory,
      runCommand: async () => {},
      skipDependencies: true,
      targetPath: 'components/ui',
    }),
    /Refusing to overwrite components\/ui\/Button\.tsx/,
  );

  assert.equal(
    await readFile(join(destination, 'Button.tsx'), 'utf8'),
    'existing\n',
  );
});

test('lists available entries when an item is unknown', async () => {
  const fixture = await createFixture();

  await assert.rejects(
    installItem({
      cwd: fixture.projectDirectory,
      itemName: 'missing',
      overwrite: false,
      registryDirectory: fixture.registryDirectory,
      runCommand: async () => {},
      skipDependencies: true,
      targetPath: 'components/ui',
    }),
    /Unknown registry item "missing"\. Available items: button/,
  );
});
