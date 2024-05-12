import {spawn} from 'node:child_process'
import chalk from 'chalk'

export const executeCommand = ({command, packageManager}: {command: string; packageManager: string}) => {

  const runner = spawn(packageManager, ['run', command], {
    // stdio inherit required for the colours come through
    stdio: 'inherit',
  })

  runner.stdout?.on('data', (data) => console.log(`${data}`))
  runner.stderr?.on('data', (data) => console.error(`${data}`))
}
