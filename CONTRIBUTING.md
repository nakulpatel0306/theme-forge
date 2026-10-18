# Contributing

The most useful contribution is a new target: support for a tool theme-forge
doesn't cover yet.

## Adding a target

1. Create `src/targets/<tool>.ts`. Copy the closest existing target; for a
   terminal, [`kitty.ts`](src/targets/kitty.ts) is a good start.

   ```ts
   import { ansi, derived } from '../core/palette'
   import { header, type Target } from './types'

   export const footty: Target = {
     id: 'footty',
     name: 'Footty',
     kind: 'terminal', // 'terminal' | 'editor' | 'tool'
     path: (slug) => `.config/footty/themes/${slug}.conf`,
     setup: (slug) => `Add \`theme = ${slug}\` to ~/.config/footty/config`,
     render(palette) {
       const { colors: c } = palette
       const { normal, bright } = ansi(palette)
       return [header(palette), `background = ${c.bg}`, /* ... */ ''].join('\n')
     },
   }
   ```

2. Add it to the `TARGETS` list in [`src/targets/index.ts`](src/targets/index.ts).
   The web app, zip download, and CLI all pick it up from there.

3. Run `bun test`. The shared target tests check that every preset renders and
   the install path is sane, and record a snapshot of your output. Commit the
   new snapshot.

4. If you have the tool installed, load the generated file in it before
   opening a PR, and say in the PR that you did.

## Rules for targets

- **Write a standalone theme file, never the tool's main config.** `path` must
  stay under `.config/`. If the tool can only read colors from its main config
  (Starship is one), say so in `setup` and let the user paste it.
- **Use the palette, don't invent colors.** Use the twelve slots, `ansi()`, and
  `derived()`. If you need a new derived color that other targets would want
  too, add it to `derived()` in `src/core/palette.ts`.
- **Editors follow `styleOf(palette)`.** It returns the token colors and
  italics for the palette (see `src/core/syntax.ts`), including any the user
  changed in the Syntax editor, so exports match the preview.
- **Handle light themes.** Check your output with Catppuccin Latte. Use
  `isLight()` from `src/core/color.ts` where the tool wants a dark/light flag.

## Sharing a theme

1. Make it in the app and click **Download palette.json**.
2. Add an `"author"` field and save it as `themes/<theme-name>.json`, where the
   file name is the theme name in lowercase with dashes (`Quiet Harbor` becomes
   `quiet-harbor.json`).
3. Run `bun test tests/community.test.ts`. It checks the file loads, the name
   matches, text has at least 4.5:1 contrast, and no other theme has the name.

If you're porting someone else's theme, credit them as the author.

## Other changes

The built-in presets in [`src/core/presets.ts`](src/core/presets.ts) stay
small on purpose; new themes belong in `themes/`. For anything larger, open
an issue first so we can agree on the approach.
