import { afterAll, expect, test } from 'bun:test'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const home = await mkdtemp(join(tmpdir(), 'theme-forge-'))
afterAll(() => rm(home, { recursive: true, force: true }))

const run = (...args: string[]) => {
  const proc = Bun.spawnSync(['bun', 'cli/index.ts', ...args, '--home', home])
  return { code: proc.exitCode, out: proc.stdout.toString(), err: proc.stderr.toString() }
}

test('apply is a dry run without --yes', async () => {
  const { code, out } = run('apply', 'nord', '--only', 'ghostty')
  expect(code).toBe(0)
  expect(out).toContain('Dry run')
  expect(await readdir(home)).toEqual([])
})

test('apply --yes writes, then backs up on change', async () => {
  expect(run('apply', 'nord', '--only', 'ghostty', '--yes').code).toBe(0)
  const dir = join(home, '.config/ghostty/themes')
  expect(await readdir(dir)).toEqual(['nord'])

  const tweaked = join(home, 'nord.json')
  const { PRESETS } = await import('../src/core/presets')
  const nord = PRESETS.find((p) => p.name === 'Nord')!
  await Bun.write(tweaked, JSON.stringify({ ...nord, colors: { ...nord.colors, red: '#ff0000' } }))

  expect(run('apply', tweaked, '--only', 'ghostty', '--yes').code).toBe(0)
  const files = (await readdir(dir)).sort()
  expect(files).toHaveLength(2)
  expect(files[1]).toStartWith('nord.bak-')
  expect(await Bun.file(join(dir, 'nord')).text()).toContain('#ff0000')
})

test('unknown theme fails with the list of options', () => {
  const { code, err } = run('preview', 'no-such-theme')
  expect(code).toBe(1)
  expect(err).toContain('kanagawa-dragon')
})
