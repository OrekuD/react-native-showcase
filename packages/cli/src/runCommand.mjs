import { spawn } from 'node:child_process';

export function runCommand(command, args, options) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: 'inherit',
    });

    child.once('error', rejectCommand);
    child.once('close', (status) => {
      if (status === 0) {
        resolveCommand();
        return;
      }

      rejectCommand(
        new Error(
          `${command} ${args.join(' ')} failed with status ${status ?? 'unknown'}.`,
        ),
      );
    });
  });
}
