import { parsePalette, type Palette } from '../core/palette'

// Every JSON file in themes/ is bundled at build time; tests/community.test.ts
// guarantees each one parses, so a bad file can't reach here through CI
const files = import.meta.glob<unknown>('../../themes/*.json', { eager: true, import: 'default' })

export const COMMUNITY: Palette[] = Object.values(files)
  .map((raw) => parsePalette(raw))
  .sort((a, b) => a.name.localeCompare(b.name))
