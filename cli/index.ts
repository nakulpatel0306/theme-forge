#!/usr/bin/env bun
import { homedir } from 'node:os'
import { parseArgs } from 'node:util'
import { apply, exportTo, list, preview } from './commands'
import { resolvePalette, resolveTargets } from './resolve'

const HELP = `theme-forge: one palette, every tool

Usage
  themeforge list                          Show presets and supported tools
  themeforge preview <theme>               Print a palette's colors
  themeforge export <theme> [--out dir]    Write all theme files to a folder
  themeforge apply <theme> [--yes]         Install theme files into ~/.config

<theme> is a preset name (see list) or a palette.json from the web app.

Options
  --only <ids>   Comma-separated targets, e.g. --only ghostty,neovim
  --out <dir>    Folder for export (default: ./<theme-name>)
  --home <dir>   Install root for apply (default: your home directory)
  --yes          Actually write files; apply is a dry run without it
`

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      only: { type: 'string' },
      out: { type: 'string' },
      home: { type: 'string' },
      yes: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  const [command, theme] = positionals

  if (values.help || !command) return console.log(HELP)
  if (command === 'list') return list()

  const palette = await resolvePalette(theme)
  const targets = resolveTargets(values.only)

  switch (command) {
    case 'preview':
      return preview(palette)
    case 'export':
      return exportTo(palette, targets, values.out)
    case 'apply':
      return apply(palette, targets, { home: values.home ?? homedir(), yes: values.yes })
    default:
      throw new Error(`Unknown command "${command}". Run \`themeforge --help\`.`)
  }
}

main().catch((e: Error) => {
  console.error(`error: ${e.message}`)
  process.exit(1)
})
