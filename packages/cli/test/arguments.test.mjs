import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArguments, UsageError } from '../src/arguments.mjs';

test('parses the default add command', () => {
  assert.deepEqual(parseArguments(['add', 'button']), {
    command: 'add',
    cwd: process.cwd(),
    itemName: 'button',
    overwrite: false,
    skipDependencies: false,
    targetPath: 'components/ui',
  });
});

test('parses supported add options', () => {
  assert.deepEqual(
    parseArguments([
      'add',
      'button',
      '--cwd',
      '/tmp/example',
      '--path',
      'src/ui',
      '--overwrite',
      '--skip-dependencies',
    ]),
    {
      command: 'add',
      cwd: '/tmp/example',
      itemName: 'button',
      overwrite: true,
      skipDependencies: true,
      targetPath: 'src/ui',
    },
  );
});

test('rejects an incomplete command', () => {
  assert.throws(
    () => parseArguments(['add']),
    (error) =>
      error instanceof UsageError &&
      error.message.includes('Usage: rn-showcase add <name>'),
  );
});

test('rejects unsupported options', () => {
  assert.throws(
    () => parseArguments(['add', 'button', '--force']),
    (error) =>
      error instanceof UsageError &&
      error.message === 'Unknown option: --force',
  );
});

test('rejects a destination outside the project', () => {
  assert.throws(
    () => parseArguments(['add', 'button', '--path', '../outside']),
    (error) =>
      error instanceof UsageError &&
      error.message === '--path must stay inside the project directory.',
  );
});
