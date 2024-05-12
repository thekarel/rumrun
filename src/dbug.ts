import Debug from 'debug'

export const dbug = (name: string) => Debug(`rum:${name}`)
