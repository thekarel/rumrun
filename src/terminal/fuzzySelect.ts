import colors from '@colors/colors'
import Table from 'cli-table3'
import {stripIndents} from 'common-tags'
import cliWidth from 'cli-width'

import {createPrompt, isDownKey, isEnterKey, isNumberKey, isUpKey, useKeypress, useMemo, useState} from '@inquirer/core'
import fuzzysort from 'fuzzysort'
import chalk from 'chalk'
import ansiEscapes from 'ansi-escapes'

interface Option {
  /**
   * Target is the value that is displayed and returned on selection
   */
  target: string
  /**
   * Any extra information that is displayed after the option
   */
  extra?: string
}

interface FuzzyConfig {
  options: Option[]
  initialInput?: string
  inputPrefix?: string
}

const paddingForRowNumber = 2

export const fuzzySelect = createPrompt<string, FuzzyConfig>((config, done) => {
  const [input, setInput] = useState(config.initialInput ?? '')
  const [rowIndex, setRowIndex] = useState(0)
  const terminalWidth = useMemo(() => cliWidth({defaultWidth: 80}), [])
  const longestTarget = useMemo(() => Math.max(...config.options.map((o) => o.target.length)), [config.options])

  const results = useMemo(
    () =>
      fuzzysort.go(input, config.options, {
        keys: ['target', 'extra'],
        all: true,
        threshold: -300,
      }),
    [input, config.options],
  )

  useKeypress((key, rl) => {
    // Enter
    if (isEnterKey(key)) {
      done(results[rowIndex].obj.target)

      // Up
    } else if (isUpKey(key)) {
      setRowIndex(Math.max(rowIndex - 1, 0))

      // Down
    } else if (isDownKey(key)) {
      setRowIndex(Math.min(rowIndex + 1, results.length - 1))

      // 1-9
    } else if (isNumberKey(key)) {
      const i = Math.max(Number(key.name) - 1, 0)
      if (results[i]) {
        done(results[i].obj.target)
      }

      // ESC
    } else if (key.name === 'escape') {
      setInput('')
      rl.clearLine(0)

      // Tab is ignored
    } else if (key.name === 'tab') {
      // Do nothing
      {
      }
      // any other key...
    } else {
      setRowIndex(0)
      setInput(rl.line)
    }
  })

  const selectedCommand = useMemo(() => {
    if (!results?.[rowIndex]) {
      return ''
    }

    return results[rowIndex].obj.target
  }, [results, rowIndex])

  const targetColWidth = longestTarget * 2 + paddingForRowNumber
  const extrasColWidth = terminalWidth - targetColWidth - 10

  const table = new Table({
    wordWrap: true,
    colWidths: [targetColWidth, extrasColWidth],
    chars: {
      top: '-',
      bottom: '-',
      left: '|',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '|',
      'right-mid': '',
      middle: '|',
    },
  })

  results.forEach((result, idx) => {
    const color = idx === rowIndex ? chalk.bgGreen : chalk.visible

    const optionNumber = idx < 9 ? `${idx + 1}` : ' '

    const optionDisplay = input.length
      ? (fuzzysort.highlight(result[0], (m) => chalk.greenBright(chalk.bold(m))) ?? [result.obj.target]).join('')
      : result.obj.target

    const extraDisplay = input.length
      ? (fuzzysort.highlight(result[1], (m) => chalk.greenBright(m)) ?? [result.obj.extra]).join('')
      : result.obj.extra ?? ''

    table.push([color(`${optionNumber} ${optionDisplay}`), colors.dim(extraDisplay)])
  })

  const selection = results.length
    ? `${table.toString()}${ansiEscapes.cursorHide}`
    : `Nothing for ${input}\n${chalk.dim('ESC to clear')}`

  return stripIndents`${chalk.blueBright(config.inputPrefix ?? '> ')}${selectedCommand}
    ${selection}`
})
