// Editor and terminal themes built from the palette. Every color is a palette role.
// Warp: dist/warp/cyber-cat.yaml. Zed: dist/zed/cyber-cat.json.
// VS Code: dist/vscode/ (package.json and themes/cyber-cat-color-theme.json).

import { flavor } from './seeds.mjs';

const ACCENT = 'green'; // Warp accent and cursor, VS Code and Zed focus color.

const alpha = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

const roles = (palette) => {
  const f = palette[flavor.key];
  const c = Object.fromEntries(Object.entries(f.colors).map(([k, v]) => [k, v.hex]));
  return { f, c };
};

// One syntax mapping shared by Zed and VS Code, so both editors color code the same way.
// Roles match the code sample in dist/preview.html.
const syntaxRoles = {
  comment: ['overlay2', 'italic'],
  keyword: ['mauve'],
  string: ['green'],
  number: ['peach'],
  constant: ['peach'],
  function: ['blue'],
  type: ['yellow'],
  variable: ['text'],
  parameter: ['maroon'],
  operator: ['sky'],
  punctuation: ['overlay2'],
  property: ['blue'],
  tag: ['mauve'],
  attribute: ['yellow'],
  escape: ['pink'],
  regex: ['pink'],
};

export const buildWarp = (palette) => {
  const { f, c } = roles(palette);
  const block = (kind) =>
    Object.entries(f.ansiColors)
      .map(([name, a]) => `    ${name}: '${a[kind].hex}'`)
      .join('\n');
  return `name: ${f.name}
accent: '${c[ACCENT]}'
cursor: '${c.rosewater}'
background: '${c.base}'
foreground: '${c.text}'
details: ${f.dark ? 'darker' : 'lighter'}
terminal_colors:
  normal:
${block('normal')}
  bright:
${block('bright')}
`;
};

const zedAnsi = (f) =>
  Object.fromEntries(
    Object.entries(f.ansiColors).flatMap(([name, a]) => [
      [`terminal.ansi.${name}`, a.normal.hex],
      [`terminal.ansi.bright_${name}`, a.bright.hex],
    ]),
  );

export const buildZed = (palette) => {
  const { f, c } = roles(palette);
  const s = (key) => {
    const [role, style] = syntaxRoles[key];
    return style ? { color: c[role], font_style: style } : { color: c[role] };
  };
  const player = (hex) => ({ cursor: hex, background: hex, selection: alpha(hex, 0.25) });
  const theme = {
    name: f.name,
    appearance: f.dark ? 'dark' : 'light',
    style: {
      background: c.mantle,
      'surface.background': c.mantle,
      'elevated_surface.background': c.surface0,
      'panel.background': c.mantle,
      'title_bar.background': c.crust,
      'status_bar.background': c.crust,
      'tab_bar.background': c.crust,
      'tab.active_background': c.base,
      'tab.inactive_background': c.crust,
      border: c.surface1,
      'border.variant': c.surface0,
      'border.focused': c[ACCENT],
      'border.selected': c[ACCENT],
      'element.background': c.surface0,
      'element.hover': c.surface1,
      'element.selected': c.surface1,
      text: c.text,
      'text.muted': c.subtext0,
      'text.placeholder': c.overlay1,
      'text.disabled': c.overlay0,
      'text.accent': c[ACCENT],
      icon: c.subtext0,
      'icon.accent': c[ACCENT],
      'editor.background': c.base,
      'editor.foreground': c.text,
      'editor.gutter.background': c.base,
      'editor.line_number': c.overlay1,
      'editor.active_line_number': c.lavender,
      'editor.active_line.background': alpha(c.text, 0.1),
      'editor.highlighted_line.background': alpha(c.text, 0.1),
      'terminal.background': c.base,
      'terminal.foreground': c.text,
      ...zedAnsi(f),
      error: c.red,
      warning: c.yellow,
      success: c.green,
      info: c.teal,
      hint: c.overlay2,
      created: c.green,
      modified: c.blue,
      deleted: c.red,
      conflict: c.peach,
      players: [c.green, c.mauve, c.peach, c.blue, c.pink, c.teal, c.yellow, c.red].map(player),
      syntax: {
        comment: s('comment'),
        'comment.doc': s('comment'),
        keyword: s('keyword'),
        string: s('string'),
        'string.escape': s('escape'),
        'string.regex': s('regex'),
        number: s('number'),
        boolean: s('constant'),
        constant: s('constant'),
        function: s('function'),
        type: s('type'),
        variable: s('variable'),
        'variable.special': s('parameter'),
        operator: s('operator'),
        punctuation: s('punctuation'),
        'punctuation.bracket': s('punctuation'),
        'punctuation.delimiter': s('punctuation'),
        property: s('property'),
        tag: s('tag'),
        attribute: s('attribute'),
        constructor: s('type'),
        primary: { color: c.text },
      },
    },
  };
  return `${JSON.stringify({ $schema: 'https://zed.dev/schema/themes/v0.2.0.json', name: f.name, author: 'Cyber Cat', themes: [theme] }, null, 2)}\n`;
};

const vscodeScopes = {
  comment: ['comment', 'punctuation.definition.comment'],
  keyword: ['keyword', 'storage', 'storage.type', 'keyword.control'],
  string: ['string', 'punctuation.definition.string'],
  number: ['constant.numeric'],
  constant: ['constant', 'constant.language', 'support.constant'],
  function: ['entity.name.function', 'support.function', 'meta.function-call'],
  type: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
  variable: ['variable', 'meta.definition.variable'],
  parameter: ['variable.parameter'],
  operator: ['keyword.operator'],
  punctuation: ['punctuation', 'meta.brace'],
  property: ['variable.other.property', 'support.type.property-name', 'meta.object-literal.key'],
  tag: ['entity.name.tag'],
  attribute: ['entity.other.attribute-name'],
  escape: ['constant.character.escape'],
  regex: ['string.regexp'],
};

export const buildVscode = (palette) => {
  const { f, c } = roles(palette);
  const ansi = Object.fromEntries(
    Object.entries(f.ansiColors).flatMap(([name, a]) => {
      const cap = name[0].toUpperCase() + name.slice(1);
      return [
        [`terminal.ansi${cap}`, a.normal.hex],
        [`terminal.ansiBright${cap}`, a.bright.hex],
      ];
    }),
  );
  const tokenColors = Object.entries(syntaxRoles).map(([key, [role, style]]) => ({
    name: key,
    scope: vscodeScopes[key],
    settings: style ? { foreground: c[role], fontStyle: style } : { foreground: c[role] },
  }));
  const theme = {
    name: f.name,
    type: f.dark ? 'dark' : 'light',
    colors: {
      focusBorder: c[ACCENT],
      foreground: c.text,
      descriptionForeground: c.subtext0,
      errorForeground: c.red,
      'widget.shadow': alpha(c.crust, 0.5),
      'selection.background': alpha(c.overlay2, 0.4),
      'editor.background': c.base,
      'editor.foreground': c.text,
      'editorLineNumber.foreground': c.overlay1,
      'editorLineNumber.activeForeground': c.lavender,
      'editor.lineHighlightBackground': alpha(c.text, 0.1),
      'editor.selectionBackground': alpha(c.overlay2, 0.25),
      'editorCursor.foreground': c.rosewater,
      'editorGroupHeader.tabsBackground': c.crust,
      'tab.activeBackground': c.base,
      'tab.inactiveBackground': c.crust,
      'tab.activeForeground': c.text,
      'tab.inactiveForeground': c.overlay2,
      'sideBar.background': c.mantle,
      'sideBar.foreground': c.subtext1,
      'sideBarSectionHeader.background': c.crust,
      'activityBar.background': c.crust,
      'activityBar.foreground': c.text,
      'activityBar.inactiveForeground': c.overlay1,
      'activityBarBadge.background': c[ACCENT],
      'activityBarBadge.foreground': c.base,
      'titleBar.activeBackground': c.crust,
      'titleBar.activeForeground': c.text,
      'statusBar.background': c.crust,
      'statusBar.foreground': c.subtext0,
      'panel.background': c.mantle,
      'panel.border': c.surface1,
      'list.activeSelectionBackground': c.surface1,
      'list.hoverBackground': c.surface0,
      'input.background': c.surface0,
      'input.foreground': c.text,
      'input.border': c.surface1,
      'button.background': c[ACCENT],
      'button.foreground': c.base,
      'badge.background': c[ACCENT],
      'badge.foreground': c.base,
      'terminal.background': c.base,
      'terminal.foreground': c.text,
      'terminal.selectionBackground': alpha(c.overlay2, 0.25),
      ...ansi,
      'diffEditor.insertedTextBackground': alpha(c.green, 0.15),
      'diffEditor.removedTextBackground': alpha(c.red, 0.15),
      'gitDecoration.addedResourceForeground': c.green,
      'gitDecoration.modifiedResourceForeground': c.blue,
      'gitDecoration.deletedResourceForeground': c.red,
      'gitDecoration.conflictingResourceForeground': c.peach,
    },
    tokenColors,
  };
  return `${JSON.stringify(theme, null, 2)}\n`;
};

export const buildVscodePackage = (palette) =>
  `${JSON.stringify(
    {
      name: 'cyber-cat',
      displayName: palette[flavor.key].name,
      description: 'Catppuccin-format dark theme with a green handheld-screen UI',
      version: palette.version,
      publisher: 'cyber-cat',
      engines: { vscode: '^1.80.0' },
      categories: ['Themes'],
      contributes: {
        themes: [{ label: palette[flavor.key].name, uiTheme: 'vs-dark', path: './themes/cyber-cat-color-theme.json' }],
      },
    },
    null,
    2,
  )}\n`;
