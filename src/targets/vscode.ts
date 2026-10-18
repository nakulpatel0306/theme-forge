import { strToU8, zipSync } from 'fflate'
import { isLight, mix, withAlphaHex } from '../core/color'
import { ansi, derived, type Palette } from '../core/palette'
import { tokenRules } from './textmate'
import type { Target } from './types'

const ANSI_NAMES = ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White']

function workbench(palette: Palette): Record<string, string> {
  const { colors: c } = palette
  const d = derived(palette)
  const { normal, bright } = ansi(palette)
  const terminal = Object.fromEntries([
    ...normal.map((hex, i) => [`terminal.ansi${ANSI_NAMES[i]}`, hex]),
    ...bright.map((hex, i) => [`terminal.ansiBright${ANSI_NAMES[i]}`, hex]),
  ])

  return {
    focusBorder: withAlphaHex(c.blue, 0.6),
    foreground: c.fg,
    descriptionForeground: c.muted,
    errorForeground: c.red,
    'widget.border': c.overlay,
    'selection.background': withAlphaHex(c.blue, 0.3),

    'editor.background': c.bg,
    'editor.foreground': c.fg,
    'editorCursor.foreground': d.cursor,
    'editor.selectionBackground': c.overlay,
    'editor.inactiveSelectionBackground': withAlphaHex(c.overlay, 0.6),
    'editor.lineHighlightBackground': d.lineHighlight,
    'editor.findMatchBackground': withAlphaHex(c.orange, 0.4),
    'editor.findMatchHighlightBackground': withAlphaHex(c.yellow, 0.25),
    'editor.wordHighlightBackground': withAlphaHex(c.overlay, 0.7),
    'editorLineNumber.foreground': c.muted,
    'editorLineNumber.activeForeground': c.yellow,
    'editorIndentGuide.background1': c.surface,
    'editorIndentGuide.activeBackground1': c.overlay,
    'editorWhitespace.foreground': c.overlay,
    'editorBracketMatch.background': withAlphaHex(c.overlay, 0.6),
    'editorBracketMatch.border': c.muted,
    'editorError.foreground': c.red,
    'editorWarning.foreground': c.yellow,
    'editorInfo.foreground': c.blue,
    'editorHint.foreground': c.cyan,
    'editorGutter.addedBackground': c.green,
    'editorGutter.modifiedBackground': c.blue,
    'editorGutter.deletedBackground': c.red,
    'editorWidget.background': c.surface,
    'editorSuggestWidget.background': c.surface,
    'editorSuggestWidget.selectedBackground': c.overlay,
    'editorHoverWidget.background': c.surface,
    'editorGroupHeader.tabsBackground': c.surface,
    'editorGroup.border': c.overlay,
    'diffEditor.insertedTextBackground': withAlphaHex(c.green, 0.2),
    'diffEditor.removedTextBackground': withAlphaHex(c.red, 0.2),
    'diffEditor.insertedLineBackground': d.diffAddBg,
    'diffEditor.removedLineBackground': d.diffDeleteBg,

    'tab.activeBackground': c.bg,
    'tab.activeForeground': c.fg,
    'tab.inactiveBackground': c.surface,
    'tab.inactiveForeground': c.muted,
    'tab.border': c.surface,
    'tab.activeBorderTop': c.blue,

    'activityBar.background': c.surface,
    'activityBar.foreground': c.fg,
    'activityBar.inactiveForeground': c.muted,
    'activityBar.activeBorder': c.blue,
    'activityBarBadge.background': c.blue,
    'activityBarBadge.foreground': c.bg,
    'sideBar.background': mix(c.bg, c.surface, 0.5),
    'sideBar.foreground': c.fg,
    'sideBar.border': c.surface,
    'sideBarTitle.foreground': c.muted,
    'sideBarSectionHeader.background': mix(c.bg, c.surface, 0.5),
    'sideBarSectionHeader.foreground': c.fg,
    'list.activeSelectionBackground': c.overlay,
    'list.activeSelectionForeground': c.fg,
    'list.inactiveSelectionBackground': c.surface,
    'list.hoverBackground': c.surface,
    'list.highlightForeground': c.blue,
    'list.errorForeground': c.red,
    'list.warningForeground': c.yellow,

    'titleBar.activeBackground': c.surface,
    'titleBar.activeForeground': c.fg,
    'titleBar.inactiveBackground': c.surface,
    'titleBar.inactiveForeground': c.muted,
    'statusBar.background': c.surface,
    'statusBar.foreground': c.muted,
    'statusBar.border': c.surface,
    'statusBar.debuggingBackground': c.orange,
    'statusBar.debuggingForeground': c.bg,
    'statusBarItem.remoteBackground': c.blue,
    'statusBarItem.remoteForeground': c.bg,
    'panel.background': c.bg,
    'panel.border': c.overlay,
    'panelTitle.activeForeground': c.fg,
    'panelTitle.inactiveForeground': c.muted,
    'panelTitle.activeBorder': c.blue,

    'input.background': c.surface,
    'input.foreground': c.fg,
    'input.border': c.overlay,
    'input.placeholderForeground': c.muted,
    'dropdown.background': c.surface,
    'dropdown.border': c.overlay,
    'button.background': c.blue,
    'button.foreground': c.bg,
    'button.hoverBackground': mix(c.blue, c.fg, 0.15),
    'badge.background': c.blue,
    'badge.foreground': c.bg,
    'quickInput.background': c.surface,
    'quickInputList.focusBackground': c.overlay,
    'scrollbarSlider.background': withAlphaHex(c.overlay, 0.5),
    'scrollbarSlider.hoverBackground': withAlphaHex(c.overlay, 0.8),
    'scrollbarSlider.activeBackground': c.overlay,
    'minimap.background': c.bg,
    'breadcrumb.foreground': c.muted,
    'breadcrumb.focusForeground': c.fg,
    'notifications.background': c.surface,
    'peekView.border': c.blue,
    'peekViewEditor.background': c.surface,
    'peekViewResult.background': c.surface,
    'textLink.foreground': c.blue,
    'textLink.activeForeground': c.cyan,

    'gitDecoration.addedResourceForeground': c.green,
    'gitDecoration.modifiedResourceForeground': c.yellow,
    'gitDecoration.deletedResourceForeground': c.red,
    'gitDecoration.untrackedResourceForeground': c.cyan,
    'gitDecoration.ignoredResourceForeground': c.muted,
    'gitDecoration.conflictingResourceForeground': c.magenta,

    'terminal.background': c.bg,
    'terminal.foreground': c.fg,
    'terminalCursor.foreground': d.cursor,
    'terminal.selectionBackground': c.overlay,
    ...terminal,
  }
}

export function colorTheme(palette: Palette) {
  return {
    $schema: 'vscode://schemas/color-theme',
    name: palette.name,
    type: isLight(palette.colors.bg) ? 'light' : 'dark',
    semanticHighlighting: true,
    colors: workbench(palette),
    tokenColors: tokenRules(palette).map(({ name, scope, foreground, fontStyle }) => ({
      name,
      scope,
      settings: fontStyle === undefined ? { foreground } : { foreground, fontStyle },
    })),
  }
}

// Same palette, same version; a changed palette bumps it so installs update
function version(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0
  return `1.0.${hash % 1_000_000}`
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function extensionId(slug: string) {
  return `theme-forge.theme-forge-${slug}`
}

function vsix(palette: Palette, slug: string): Uint8Array {
  const theme = JSON.stringify(colorTheme(palette), null, 2)
  const name = `theme-forge-${slug}`
  const v = version(theme)
  const manifest = {
    name,
    displayName: `${palette.name} (theme-forge)`,
    description: `${palette.name} color theme, generated by theme-forge`,
    version: v,
    publisher: 'theme-forge',
    engines: { vscode: '^1.70.0' },
    categories: ['Themes'],
    contributes: {
      themes: [
        {
          label: palette.name,
          uiTheme: isLight(palette.colors.bg) ? 'vs' : 'vs-dark',
          path: `./themes/${slug}-color-theme.json`,
        },
      ],
    },
  }

  return zipSync({
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json" />
  <Default Extension=".vsixmanifest" ContentType="text/xml" />
</Types>
`),
    'extension.vsixmanifest': strToU8(`<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${name}" Version="${v}" Publisher="theme-forge" />
    <DisplayName>${escapeXml(manifest.displayName)}</DisplayName>
    <Description xml:space="preserve">${escapeXml(manifest.description)}</Description>
    <Categories>Themes</Categories>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.70.0" />
    </Properties>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
  </Assets>
</PackageManifest>
`),
    'extension/package.json': strToU8(JSON.stringify(manifest, null, 2)),
    [`extension/themes/${slug}-color-theme.json`]: strToU8(theme),
    // Fixed timestamp so the same palette always produces identical bytes
  }, { mtime: '2020-01-01T00:00:00' })
}

export const vscode: Target = {
  id: 'vscode',
  name: 'VS Code / Cursor',
  kind: 'editor',
  path: (slug) => `.config/theme-forge/${slug}.vsix`,
  setup: (slug) =>
    `Run \`code --install-extension ~/.config/theme-forge/${slug}.vsix\` (or \`cursor ...\`), then choose it under Preferences: Color Theme`,
  render: (palette) => JSON.stringify(colorTheme(palette), null, 2) + '\n',
  binary: vsix,
}
