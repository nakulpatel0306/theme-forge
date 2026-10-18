# theme-forge

Pick twelve colors once. Get matching themes for your terminal, editor, and
command-line tools.

**[Try it in your browser](https://nakulpatel0306.github.io/theme-forge/)**

![theme-forge editing Kanagawa Dragon, with a live Neovim and shell preview](docs/screenshot.png)

Making every tool match by hand means editing a dozen config files, each in a
different format. theme-forge gives you one palette, a live preview of a real
looking tmux + Neovim + shell session, and an export for each tool.

## Supported tools

| Kind      | Tools                                     |
| --------- | ----------------------------------------- |
| Terminals | Ghostty, Kitty, Alacritty, WezTerm        |
| Editors   | Neovim                                    |
| CLI tools | bat, delta, tmux, Starship, lazygit, fzf  |

Every export is a standalone theme file. theme-forge never edits your main
config, so switching a theme on is always a single line you add yourself.

## Use the web app

```sh
bun install
bun dev
```

- Start from a preset or open a `palette.json`.
- Click a swatch or type a hex value; the whole app, preview included, repaints
  as you go. The number next to each color is its contrast against the
  background, red when it drops below 3:1.
- Rename the theme by editing the big title.
- **Use it** shows the file for each tool, where it goes, and the line that
  turns it on. Download one, or all of them as a zip.
- The URL always holds the current palette, so copying it shares your theme.

## Use the CLI

```sh
bun cli/index.ts list                              # presets and tools
bun cli/index.ts preview kanagawa-dragon           # print the palette
bun cli/index.ts export my-theme.json --out ./out  # write every file to a folder
bun cli/index.ts apply my-theme.json               # show what would be installed
bun cli/index.ts apply my-theme.json --yes         # install into ~/.config
```

`bun run cli <command>` works too, e.g. `bun run cli list`.

`apply` is a dry run unless you pass `--yes`. If a theme file already exists
and its contents changed, the old one is kept next to it as `<name>.bak-<time>`.
Limit any command to some tools with `--only ghostty,neovim,tmux`.

## How the palette works

| Slot       | Used for                         |
| ---------- | -------------------------------- |
| Background | Behind everything                |
| Surface    | Status bars, tab bars, panels    |
| Overlay    | Selections, borders              |
| Muted      | Comments, line numbers           |
| Text       | Default foreground               |
| Red        | Errors, deletions                |
| Orange     | Numbers, constants               |
| Yellow     | Types, warnings                  |
| Green      | Strings, additions               |
| Cyan       | Operators, info                  |
| Blue       | Functions, links, focus          |
| Magenta    | Keywords                         |

The remaining colors a tool needs, like bright ANSI variants, diff
backgrounds, and the cursor line, are derived from these twelve in
[`src/core/palette.ts`](src/core/palette.ts). Which syntax token gets which
color lives in one map, [`src/core/syntax.ts`](src/core/syntax.ts), shared by
the preview and the editor exports, so the preview shows what you'll get.

## Add a tool

Each tool is one small file in [`src/targets`](src/targets). See
[CONTRIBUTING.md](CONTRIBUTING.md); a new target is usually about 30 lines.

## Development

```sh
bun test         # unit tests, snapshot tests for every target, CLI tests
bun run build    # typecheck and production build
bun run lint
```

## License

[MIT](LICENSE)
