import { alacritty } from './alacritty'
import { ghostty } from './ghostty'
import { kitty } from './kitty'
import type { Target } from './types'
import { wezterm } from './wezterm'

export type { Target } from './types'

// Adding a tool means writing one file next to these and listing it here
export const TARGETS: Target[] = [ghostty, kitty, alacritty, wezterm]
