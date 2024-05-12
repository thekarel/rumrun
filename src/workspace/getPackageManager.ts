import {Effect} from 'effect'
import {detect as detectPM} from 'detect-package-manager'

export const getPackageManager = Effect.gen(function* () {
  return yield* Effect.tryPromise({
    try: () => detectPM(),
    catch: () => Effect.fail('Unable to detect package manager'),
  })
})
