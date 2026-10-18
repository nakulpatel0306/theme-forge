import { SLOTS } from '../core/palette'
import { header, type Target } from './types'

export const starship: Target = {
  id: 'starship',
  name: 'Starship',
  kind: 'tool',
  path: (slug) => `.config/starship/palettes/${slug}.toml`,
  // Starship only reads palettes from starship.toml itself, so this one is a paste
  setup: () => 'Paste this file into ~/.config/starship.toml (palettes must live in that file)',
  render(palette, slug) {
    // Naming entries red/green/blue overrides Starship's built-in colors, so
    // every module that says `style = "bold blue"` picks up the theme for free
    return [
      header(palette),
      `palette = "${slug}"`,
      '',
      `[palettes.${slug}]`,
      ...SLOTS.map((slot) => `${slot} = "${palette.colors[slot]}"`),
      `purple = "${palette.colors.magenta}"`,
      '',
    ].join('\n')
  },
}
