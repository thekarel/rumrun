import {Command, Args} from '@oclif/core'
import {fuzzySelect} from '../terminal/fuzzySelect.js'
import {getWorkspaceScripts} from '../workspace/getWorkspaceScripts.js'
import {Effect} from 'effect'
import {getPackageManager} from '../workspace/getPackageManager.js'
import {executeCommand} from '../terminal/executeCommand.js'
import {dbug} from '../dbug.js'
import {getCache, writeCache} from '../workspace/cache.js'
import chalk from 'chalk'

const d = dbug('cmd')

const path = 'package.json'
const cacheSubDir = '.rumrun'

interface Workspace {
  packageManager: string
  scripts: [string, string][]
}

export default class Rum extends Command {
  static args = {
    command: Args.string({
      name: 'command',
      required: false,
      description: 'The command to run',
    }),
  }

  public async run(): Promise<void> {
    d('start')
    const {args} = await this.parse(Rum)
    d('parsed args')

    let packageManager = getCache<string>({pwd: process.cwd(), cacheSubDir})

    if (!packageManager) {
      packageManager = await Effect.runPromise(getPackageManager)

      writeCache({cacheSubDir, pwd: process.cwd(), data: packageManager})
    }

    d('got package manager')
    this.debug(`Using ${packageManager} as package manager...`)

    const scripts = Effect.runSync(getWorkspaceScripts({pwd: process.cwd(), packageJsonPath: path}))
    d('got scripts')
    this.debug(`Found scripts: ${scripts}`)

    const scriptOptions = scripts.map(([name, value]) => ({target: name, extra: value}))
    const command = await fuzzySelect({
      initialInput: args.command,
      inputPrefix: `> ${packageManager} run `,
      options: scriptOptions,
    })


    this.log(chalk.bold(`${packageManager} ${command}`))
    executeCommand({command, packageManager})
  }
}

Rum.description = 'Run scripts from your package.json'
