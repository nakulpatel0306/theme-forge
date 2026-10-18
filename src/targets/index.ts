import { alacritty } from './alacritty'
import { bat } from './bat'
import { delta } from './delta'
import { ghostty } from './ghostty'
import { kitty } from './kitty'
import { neovim } from './neovim'
import type { Target } from './types'
import { wezterm } from './wezterm'

export type { Target } from './types'

// Adding a tool means writing one file next to these and listing it here
export const TARGETS: Target[] = [ghostty, kitty, alacritty, wezterm, neovim, bat, delta]
