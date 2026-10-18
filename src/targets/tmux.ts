import { derived } from '../core/palette'
import { header, type Target } from './types'

export const tmux: Target = {
  id: 'tmux',
  name: 'tmux',
  kind: 'tool',
  path: (slug) => `.config/tmux/themes/${slug}.conf`,
  setup: (slug) => `Add \`source-file ~/.config/tmux/themes/${slug}.conf\` to ~/.config/tmux/tmux.conf`,
  render(palette) {
    const { colors: c } = palette
    const d = derived(palette)
    // Styles only, no status-left/right formats, so your own bar layout survives
    return [
      header(palette),
      `set -g status-style "bg=${c.surface},fg=${c.muted}"`,
      `set -g status-left-style "bg=${c.green},fg=${c.bg},bold"`,
      `set -g status-right-style "bg=${c.surface},fg=${c.muted}"`,
      `set -g window-status-style "bg=${c.surface},fg=${c.muted}"`,
      `set -g window-status-current-style "bg=${c.surface},fg=${c.fg},bold"`,
      `set -g window-status-activity-style "bg=${c.surface},fg=${c.yellow}"`,
      `set -g window-status-bell-style "bg=${c.surface},fg=${c.red},bold"`,
      `set -g pane-border-style "fg=${d.border}"`,
      `set -g pane-active-border-style "fg=${c.blue}"`,
      `set -g message-style "bg=${c.surface},fg=${c.fg}"`,
      `set -g message-command-style "bg=${c.surface},fg=${c.yellow}"`,
      `set -g mode-style "bg=${d.selection},fg=${c.fg}"`,
      `set -g display-panes-active-colour "${c.blue}"`,
      `set -g display-panes-colour "${c.muted}"`,
      `set -g clock-mode-colour "${c.blue}"`,
      '',
    ].join('\n')
  },
}
