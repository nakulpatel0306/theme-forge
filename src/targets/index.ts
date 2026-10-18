import { alacritty } from './alacritty'
import { bat } from './bat'
import { btop } from './btop'
import { delta } from './delta'
import { fzf } from './fzf'
import { ghostty } from './ghostty'
import { helix } from './helix'
import { iterm2 } from './iterm2'
import { kitty } from './kitty'
import { lazygit } from './lazygit'
import { neovim } from './neovim'
import { starship } from './starship'
import { tmux } from './tmux'
import type { Target } from './types'
import { vscode } from './vscode'
import { warp } from './warp'
import { wezterm } from './wezterm'
import { zed } from './zed'

export type { Target } from './types'

// Adding a tool means writing one file next to these and listing it here
export const TARGETS: Target[] = [
  ghostty,
  kitty,
  alacritty,
  wezterm,
  iterm2,
  warp,
  neovim,
  vscode,
  zed,
  helix,
  bat,
  delta,
  tmux,
  starship,
  lazygit,
  fzf,
  btop,
]
