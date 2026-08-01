#!/usr/bin/env node

import { parseArguments, USAGE, UsageError } from './arguments.mjs';
import { installItem } from './installItem.mjs';
import { registryDirectory } from './registryDirectory.mjs';
import { runCommand } from './runCommand.mjs';

function getPrebuildCommand(packageManager) {
  const commands = {
    bun: 'bun x expo prebuild',
    npm: 'npx expo prebuild',
    pnpm: 'pnpm exec expo prebuild',
    yarn: 'yarn expo prebuild',
  };

  return commands[packageManager];
}

async function main() {
  const parsed = parseArguments(process.argv.slice(2));
  if (parsed.command === 'help') {
    console.log(USAGE);
    return;
  }

  const result = await installItem({
    ...parsed,
    registryDirectory,
    runCommand,
  });

  console.log(`\nAdded ${parsed.itemName}:`);
  for (const file of result.files) console.log(`  ${file}`);

  if (parsed.skipDependencies) {
    console.log('\nDependencies were skipped. See the component documentation.');
  }

  if (result.requiresPrebuild) {
    console.log(
      `\nThis component includes native dependencies. Run ${getPrebuildCommand(result.packageManager)} before rebuilding the app.`,
    );
  }
}

main().catch((error) => {
  if (error instanceof UsageError) {
    console.error(error.message);
  } else {
    console.error(`Unable to add component: ${error.message}`);
  }

  process.exitCode = 1;
});
