import path from 'path'
import fs from 'fs'
import {Data, Effect} from 'effect'

class JSONParseError extends Data.TaggedError('JSONParseError')<{originalError: unknown}> {
}

class FileAccessError extends Data.TaggedError('FileAccessError')<{filePath: string; originalError: unknown}> {
}

const readFile = (path: string) =>
  Effect.try({
    try: () => fs.readFileSync(path, 'utf-8'),
    catch: (error) => new FileAccessError({filePath: path, originalError: error}),
  })

const parseJson = (jsonString: string) =>
  Effect.try({
    try: () => JSON.parse(jsonString),
    catch: (error) => new JSONParseError({originalError: error}),
  })

export const getWorkspaceScripts = ({pwd, packageJsonPath}: {packageJsonPath: string; pwd: string}) =>
  Effect.gen(function* () {
    const pathToFile = path.join(pwd, packageJsonPath)
    const packageJsonString = yield* readFile(pathToFile)
    const packageJson = yield* parseJson(packageJsonString)

    return Object.entries(packageJson.scripts ?? {}) as [string, string][]
  }).pipe(
    Effect.catchTags({
      JSONParseError: (e) => Effect.fail(`Failed to parse JSON at ${path}: ${e.originalError}`),
      FileAccessError: (e) => Effect.fail(`Failed to read file: ${e.filePath}`),
    }),
  )
