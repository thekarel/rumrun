import {createHash} from 'crypto'
import os from 'os'
import path from 'path'
import fs from 'fs'
import {dbug} from '../dbug.js'

const d = dbug('cache')

export const writeCache = ({cacheSubDir, pwd, data}: {pwd: string; data: any; cacheSubDir: string}) => {
  const homeDir = os.homedir()
  const pwdHash = hashString(pwd)
  const cacheDir = path.join(homeDir, cacheSubDir)
  // Ensure the cache directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir)
  }
  const cacheFilePath = path.join(homeDir, cacheSubDir, pwdHash)
  d('write to cacheFilePath', cacheFilePath)

  fs.writeFileSync(cacheFilePath, JSON.stringify(data), 'utf-8')
}

export const getCache = <T>({cacheSubDir, pwd}: {pwd: string; cacheSubDir: string}): T | undefined => {
  const homeDir = os.homedir()
  const pwdHash = hashString(pwd)
  const cacheFilePath = path.join(homeDir, cacheSubDir, pwdHash)
  d('read cacheFilePath', cacheFilePath)

  if (!fs.existsSync(cacheFilePath)) {
    d('Miss')
    return undefined
  }

  const data = fs.readFileSync(cacheFilePath, 'utf-8')
  d('Hit')

  return JSON.parse(data)
}

const hashString = (input: string) => {
  const hash = createHash('sha256')
  hash.update(input)

  return hash.digest('hex')
}
