import { expect, test } from 'bun:test'
import { highlight } from '../src/ui/preview/highlight'

test('classifies the token kinds the preview colors', () => {
  const kinds = (line: string) =>
    highlight(line)
      .filter((t) => t.text.trim())
      .map((t) => `${t.kind}:${t.text}`)

  expect(kinds(`export function mix(a: string) {`)).toEqual([
    'keyword:export',
    'keyword:function',
    'function:mix',
    'punctuation:(',
    'variable:a',
    'operator::',
    'variable:string',
    'punctuation:)',
    'punctuation:{',
  ])
  expect(kinds(`throw new RangeError('bad', 0.5) // why`)).toEqual([
    'keyword:throw',
    'keyword:new',
    'type:RangeError',
    'punctuation:(',
    "string:'bad'",
    'punctuation:,',
    'number:0.5',
    'punctuation:)',
    'comment:// why',
  ])
})

test('never drops characters', () => {
  const line = `  const [x, y] = [hexToRgb(a), hexToRgb(b)] @ #`
  expect(highlight(line).map((t) => t.text).join('')).toBe(line)
})
