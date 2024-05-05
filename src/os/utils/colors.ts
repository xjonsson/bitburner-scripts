/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

// ******** COLOR UTILITY FUNCTIONS
// function getRGBC(r: number, g: number, b: number, background = false): string {
//   if (background) return `\u001b[48;2;${r};${g};${b}m`;
//   return `\u001b[38;2;${r};${g};${b}m`;
// }

// const hex = 'F65579';
// const rgb = {
//   r: parseInt(hex.slice(0, 2), 16),
//   g: parseInt(hex.slice(2, 4), 16),
//   b: parseInt(hex.slice(4, 6), 16),
// };
// const sr = hex.slice(0,2);
// const sg = hex.slice(2,4);
// const sb = hex.slice(4,6);
// ns.print(sr,'|',sg,'|',sb);
// ns.print(hex);
// ns.print(rgb);
// const rgb = [34,2,0]

// const fc = getRGBC(rgb.r, rgb.g, rgb.b);
// const bg = getRGBC(rgb.r, rgb.g, rgb.b, true);
// ns.print(`[#${hex}]${fc}FOREGROUND${reset}`);
// ns.print(`[#${hex}]${bg}BACKGROUND${reset}`);

// Escape code'\u001b'
export const RESET = '\u001b[0m';

export const Colors: Record<string, { hex: string; f: string; b: string }> = {
  // ******** UTILITY COLORS ********
  SUCCESS: {
    hex: '#49D454',
    f: '\u001b[38;2;73;212;84m',
    b: '\u001b[48;2;73;212;84;38;2;34;34;34m',
  },
  INFO: {
    hex: '#33BBEB',
    f: '\u001b[38;2;51;187;235m',
    b: '\u001b[48;2;51;187;235;38;2;34;34;34m',
  },
  WARN: {
    hex: '#FFC042',
    f: '\u001b[38;2;255;192;66m',
    b: '\u001b[48;2;255;192;66;38;2;34;34;34m',
  },
  ERROR: {
    hex: '#F65579',
    f: '\u001b[38;2;246;85;121m',
    b: '\u001b[48;2;246;85;121;38;2;34;34;34m',
  },
  DARK: {
    hex: '#222222',
    f: '\u001b[38;2;34;34;34m',
    b: '\u001b[48;2;34;34;34;38;2;215;218;224m', // 38;2;215;218;224m
  },
  // ******** REGULAR COLORS ********
  Black: {
    hex: '#2d3139',
    f: '\u001b[38;2;45;49;57m',
    b: '\u001b[48;2;45;49;57;38;2;215;218;224m',
  },
  Blue: {
    hex: '#528bff',
    f: '\u001b[38;2;82;139;255m',
    b: '\u001b[48;2;82;139;255;38;2;34;34;34m',
  },
  Green: {
    hex: '#98c379',
    f: '\u001b[38;2;152;195;121m',
    b: '\u001b[48;2;152;195;121;38;2;34;34;34m',
  },
  Yellow: {
    hex: '#e5c07b',
    f: '\u001b[38;2;229;192;123m',
    b: '\u001b[48;2;229;192;123;38;2;34;34;34m',
  },
  Cyan: {
    hex: '#56b6c2',
    f: '\u001b[38;2;86;182;194m',
    b: '\u001b[48;2;86;182;194;38;2;34;34;34m',
  },
  Magenta: {
    hex: '#c678dd',
    f: '\u001b[38;2;198;120;221m',
    b: '\u001b[48;2;198;120;221;38;2;34;34;34m',
  },
  Red: {
    hex: '#e06c75',
    f: '\u001b[38;2;224;108;117m',
    b: '\u001b[48;2;224;108;117;38;2;34;34;34m',
  },
  White: {
    hex: '#d7dae0',
    f: '\u001b[38;2;215;218;224m',
    b: '\u001b[48;2;215;218;224;38;2;34;34;34m',
  },
  // ******** REGULAR BRIGHT COLORS ********
  BBlack: {
    hex: '#7f848e',
    f: '\u001b[38;2;127;132;142m',
    b: '\u001b[48;2;127;132;142;38;2;34;34;34m',
  },
  BBlue: {
    hex: '#528bff',
    f: '\u001b[38;2;82;139;255m',
    b: '\u001b[48;2;82;139;255;38;2;34;34;34m',
  },
  BGreen: {
    hex: '#98c379',
    f: '\u001b[38;2;152;195;121m',
    b: '\u001b[48;2;152;195;121;38;2;34;34;34m',
  },
  BYellow: {
    hex: '#e5c07b',
    f: '\u001b[38;2;229;192;123m',
    b: '\u001b[48;2;229;192;123;38;2;34;34;34m',
  },
  BCyan: {
    hex: '#56b6c2',
    f: '\u001b[38;2;86;182;194m',
    b: '\u001b[48;2;86;182;194;38;2;34;34;34m',
  },
  BMagenta: {
    hex: '#7e0097',
    f: '\u001b[38;2;126;0;151m',
    b: '\u001b[48;2;126;0;151;38;2;215;218;224m',
  },
  BRed: {
    hex: '#f44747',
    f: '\u001b[38;2;244;71;71m',
    b: '\u001b[48;2;244;71;71;38;2;34;34;34m',
  },
  BWhite: {
    hex: '#d7dae0',
    f: '\u001b[38;2;215;218;224m',
    b: '\u001b[48;2;215;218;224;38;2;34;34;34m',
  },
  // ******** BASE COLORS ********
  TEXT: {
    hex: '#abb2bf',
    f: '\u001b[38;2;171;178;191m',
    b: '\u001b[48;2;171;178;191;38;2;34;34;34m',
  },
  BG: {
    hex: '#282c34',
    f: '\u001b[38;2;40;44;52m',
    b: '\u001b[48;2;40;44;52;38;2;215;218;224m',
  },
  BG2: {
    hex: '#21252B',
    f: '\u001b[38;2;33;37;43m',
    b: '\u001b[48;2;33;37;43;38;2;215;218;224m',
  },
  // ******** SPECIAL COLORS ********
  Comment: {
    hex: '#676f7d',
    f: '\u001b[38;2;103;111;125m',
    b: '\u001b[48;2;103;111;125;38;2;215;218;224m',
  },
  Class: {
    hex: '#61afef',
    f: '\u001b[38;2;97;175;239m',
    b: '\u001b[48;2;97;175;239;38;2;34;34;34m',
  },
  Arg: {
    hex: '#d19a66',
    f: '\u001b[38;2;209;154;102m',
    b: '\u001b[48;2;209;154;102;38;2;34;34;34m',
  },
  Show: {
    hex: '#42557B',
    f: '\u001b[38;2;66;85;123m',
    b: '\u001b[48;2;66;85;123;38;2;215;218;224m',
  },
  Header: {
    hex: '#75715E',
    f: '\u001b[38;2;117;113;94m',
    b: '\u001b[48;2;117;113;94;38;2;215;218;224m',
  },
  Insert: {
    hex: '#00809B',
    f: '\u001b[38;2;0;128;155m',
    b: '\u001b[48;2;0;128;155;38;2;215;218;224m',
  },
};

export const Print = {
  list(ns: NS) {
    const rowStyle = '%-7s %-10s %-10s %-10s ';
    ns.printf(rowStyle, 'Hex', 'Color', 'Foreground', 'Background');
    Object.keys(Colors).forEach((ck) => {
      // ns.print(ck);
      const { hex, f, b } = Colors[ck];
      ns.printf(
        rowStyle,
        hex,
        `${b} ${ck} ${RESET}`,
        `${f} FOREGROUND ${RESET}`,
        `${b} BACKGROUND ${RESET}`,
      );
    });
  },
  text(mode: string, t: string, background = false): string {
    if (background) return `${Colors[mode].b}${t}${RESET}`;
    return `${Colors[mode].f}${t}${RESET}`;
  },
  ptext(ns: NS, mode: string, text: string, background = false) {
    ns.print(this.text(mode, text, background));
  },
  banner(mode: string, banner: string, text: string): string {
    const b = this.text(mode, ` ${banner} `, true);
    const t = this.text(mode, text, false);
    return `${b} ${t}`;
  },
  pbanner(ns: NS, mode: string, banner: string, text: string) {
    ns.print(this.banner(mode, banner, text));
  },
};

export const Banner = {
  normal(banner: string, text: string) {
    return `${Print.text('SUCCESS', ` ${banner} `, true)} ${Print.text('SUCCESS', text)}`;
  },
  info(banner: string, text: string) {
    return `${Print.text('INFO', ` ${banner} `, true)} ${Print.text('INFO', text)}`;
  },
  warning(banner: string, text: string) {
    return `${Print.text('WARN', ` ${banner} `, true)} ${Print.text('WARN', text)}`;
  },
  error(banner: string, text: string) {
    return `${Print.text('ERROR', ` ${banner} `, true)} ${Print.text('ERROR', text)}`;
  },
  dark(banner: string, text: string) {
    return `${Print.text('DARK', ` ${banner} `, true)} ${Print.text('DARK', text)}`;
  },
  black(banner: string, text: string) {
    return `${Print.text('Black', ` ${banner} `, true)} ${Print.text('Black', text)}`;
  },
  blue(banner: string, text: string) {
    return `${Print.text('Blue', ` ${banner} `, true)} ${Print.text('Blue', text)}`;
  },
  green(banner: string, text: string) {
    return `${Print.text('Green', ` ${banner} `, true)} ${Print.text('Green', text)}`;
  },
  yellow(banner: string, text: string) {
    return `${Print.text('Yellow', ` ${banner} `, true)} ${Print.text('Yellow', text)}`;
  },
  cyan(banner: string, text: string) {
    return `${Print.text('Cyan', ` ${banner} `, true)} ${Print.text('Cyan', text)}`;
  },
  magenta(banner: string, text: string) {
    return `${Print.text('Magenta', ` ${banner} `, true)} ${Print.text('Magenta', text)}`;
  },
  red(banner: string, text: string) {
    return `${Print.text('Red', ` ${banner} `, true)} ${Print.text('Red', text)}`;
  },
  white(banner: string, text: string) {
    return `${Print.text('White', ` ${banner} `, true)} ${Print.text('White', text)}`;
  },
  bBlack(banner: string, text: string) {
    return `${Print.text('BBlack', ` ${banner} `, true)} ${Print.text('BBlack', text)}`;
  },
  bBlue(banner: string, text: string) {
    return `${Print.text('BBlue', ` ${banner} `, true)} ${Print.text('BBlue', text)}`;
  },
  bGreen(banner: string, text: string) {
    return `${Print.text('BGreen', ` ${banner} `, true)} ${Print.text('BGreen', text)}`;
  },
  bYellow(banner: string, text: string) {
    return `${Print.text('BYellow', ` ${banner} `, true)} ${Print.text('BYellow', text)}`;
  },
  bCyan(banner: string, text: string) {
    return `${Print.text('BCyan', ` ${banner} `, true)} ${Print.text('BCyan', text)}`;
  },
  bMagenta(banner: string, text: string) {
    return `${Print.text('BMagenta', ` ${banner} `, true)} ${Print.text('BMagenta', text)}`;
  },
  bRed(banner: string, text: string) {
    return `${Print.text('BRed', ` ${banner} `, true)} ${Print.text('BRed', text)}`;
  },
  bWhite(banner: string, text: string) {
    return `${Print.text('BWhite', ` ${banner} `, true)} ${Print.text('BWhite', text)}`;
  },
  text(banner: string, text: string) {
    return `${Print.text('TEXT', ` ${banner} `, true)} ${Print.text('TEXT', text)}`;
  },
  bg(banner: string, text: string) {
    return `${Print.text('BG', ` ${banner} `, true)} ${Print.text('BG', text)}`;
  },
  bg2(banner: string, text: string) {
    return `${Print.text('BG2', ` ${banner} `, true)} ${Print.text('BG2', text)}`;
  },
  comment(banner: string, text: string) {
    return `${Print.text('Comment', ` ${banner} `, true)} ${Print.text('Comment', text)}`;
  },
  class(banner: string, text: string) {
    return `${Print.text('Class', ` ${banner} `, true)} ${Print.text('Class', text)}`;
  },
  arg(banner: string, text: string) {
    return `${Print.text('Arg', ` ${banner} `, true)} ${Print.text('Arg', text)}`;
  },
  show(banner: string, text: string) {
    return `${Print.text('Show', ` ${banner} `, true)} ${Print.text('Show', text)}`;
  },
  header(banner: string, text: string) {
    return `${Print.text('Header', ` ${banner} `, true)} ${Print.text('Header', text)}`;
  },
  insert(banner: string, text: string) {
    return `${Print.text('Insert', ` ${banner} `, true)} ${Print.text('Insert', text)}`;
  },
};

export const Text = {
  normal(text: string) {
    return Print.text('SUCCESS', text, false);
  },
  info(text: string) {
    return Print.text('INFO', text, false);
  },
  warning(text: string) {
    return Print.text('WARN', text, false);
  },
  error(text: string) {
    return Print.text('ERROR', text, false);
  },
  dark(text: string) {
    return Print.text('DARK', text, false);
  },
  black(text: string) {
    return Print.text('Black', text, false);
  },
  blue(text: string) {
    return Print.text('Blue', text, false);
  },
  green(text: string) {
    return Print.text('Green', text, false);
  },
  yellow(text: string) {
    return Print.text('Yellow', text, false);
  },
  cyan(text: string) {
    return Print.text('Cyan', text, false);
  },
  magenta(text: string) {
    return Print.text('Magenta', text, false);
  },
  red(text: string) {
    return Print.text('Red', text, false);
  },
  white(text: string) {
    return Print.text('White', text, false);
  },
  bBlack(text: string) {
    return Print.text('BBlack', text, false);
  },
  bBlue(text: string) {
    return Print.text('BBlue', text, false);
  },
  bGreen(text: string) {
    return Print.text('BGreen', text, false);
  },
  bYellow(text: string) {
    return Print.text('BYellow', text, false);
  },
  bCyan(text: string) {
    return Print.text('BCyan', text, false);
  },
  bMagenta(text: string) {
    return Print.text('BMagenta', text, false);
  },
  bRed(text: string) {
    return Print.text('BRed', text, false);
  },
  bWhite(text: string) {
    return Print.text('BWhite', text, false);
  },
  text(text: string) {
    return Print.text('TEXT', text, false);
  },
  bg(text: string) {
    return Print.text('BG', text, false);
  },
  bg2(text: string) {
    return Print.text('BG2', text, false);
  },
  comment(text: string) {
    return Print.text('Comment', text, false);
  },
  class(text: string) {
    return Print.text('Class', text, false);
  },
  arg(text: string) {
    return Print.text('Arg', text, false);
  },
  show(text: string) {
    return Print.text('Show', text, false);
  },
  header(text: string) {
    return Print.text('Header', text, false);
  },
  insert(text: string) {
    return Print.text('Insert', text, false);
  },
};

export const BG = {
  normal(text: string) {
    return Print.text('SUCCESS', text, true);
  },
  info(text: string) {
    return Print.text('INFO', text, true);
  },
  warning(text: string) {
    return Print.text('WARN', text, true);
  },
  error(text: string) {
    return Print.text('ERROR', text, true);
  },
  dark(text: string) {
    return Print.text('DARK', text, true);
  },
  black(text: string) {
    return Print.text('Black', text, true);
  },
  blue(text: string) {
    return Print.text('Blue', text, true);
  },
  green(text: string) {
    return Print.text('Green', text, true);
  },
  yellow(text: string) {
    return Print.text('Yellow', text, true);
  },
  cyan(text: string) {
    return Print.text('Cyan', text, true);
  },
  magenta(text: string) {
    return Print.text('Magenta', text, true);
  },
  red(text: string) {
    return Print.text('Red', text, true);
  },
  white(text: string) {
    return Print.text('White', text, true);
  },
  bBlack(text: string) {
    return Print.text('BBlack', text, true);
  },
  bBlue(text: string) {
    return Print.text('BBlue', text, true);
  },
  bGreen(text: string) {
    return Print.text('BGreen', text, true);
  },
  bYellow(text: string) {
    return Print.text('BYellow', text, true);
  },
  bCyan(text: string) {
    return Print.text('BCyan', text, true);
  },
  bMagenta(text: string) {
    return Print.text('BMagenta', text, true);
  },
  bRed(text: string) {
    return Print.text('BRed', text, true);
  },
  bWhite(text: string) {
    return Print.text('BWhite', text, true);
  },
  text(text: string) {
    return Print.text('TEXT', text, true);
  },
  bg(text: string) {
    return Print.text('BG', text, true);
  },
  bg2(text: string) {
    return Print.text('BG2', text, true);
  },
  comment(text: string) {
    return Print.text('Comment', text, true);
  },
  class(text: string) {
    return Print.text('Class', text, true);
  },
  arg(text: string) {
    return Print.text('Arg', text, true);
  },
  show(text: string) {
    return Print.text('Show', text, true);
  },
  header(text: string) {
    return Print.text('Header', text, true);
  },
  insert(text: string) {
    return Print.text('Insert', text, true);
  },
};

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  ns.print('======== COLORS ========');
  Print.list(ns);
  await ns.asleep(1000);
}

// const unused = {
//   // ******** UNUSED ********
//   'activityBar.background': {
//     hex: '#2F333D',
//     f: '\u001b[38;2;47;51;61m',
//     b: '\u001b[48;2;47;51;61m',
//   },
//   'activityBarBadge.foreground': {
//     hex: '#F8FAFD',
//     f: '\u001b[38;2;248;250;253m',
//     b: '\u001b[48;2;248;250;253m',
//   },

//   'editor.findMatchHighlightBackground': {
//     hex: '#314365',
//     f: '[38;2;49;67;101m',
//     b: '[48;2;49;67;101m',
//   },
//   'editor.selectionBackground': {
//     hex: '#3E4451',
//     f: '[38;2;62;68;81m',
//     b: '[48;2;62;68;81m',
//   },
//   'editorCursor.foreground': {
//     hex: '#f8f8f0',
//     f: '[38;2;248;248;240m',
//     b: '[48;2;248;248;240m',
//   },
//   'editorError.foreground': {
//     hex: '#c24038',
//     f: '[38;2;194;64;56m',
//     b: '[48;2;194;64;56m',
//   },
//   'editorIndentGuide.background': {
//     hex: '#3B4048',
//     f: '[38;2;59;64;72m',
//     b: '[48;2;59;64;72m',
//   },
//   'editorLineNumber.foreground': {
//     hex: '#495162',
//     f: '[38;2;73;81;98m',
//     b: '[48;2;73;81;98m',
//   },
//   'editorRuler.foreground': {
//     hex: '#484848',
//     f: '[38;2;72;72;72m',
//     b: '[48;2;72;72;72m',
//   },
//   'editorWhitespace.foreground': {
//     hex: '#484a50',
//     f: '[38;2;72;74;80m',
//     b: '[48;2;72;74;80m',
//   },
//   'input.background': {
//     hex: '#1d1f23',
//     f: '[38;2;29;31;35m',
//     b: '[48;2;29;31;35m',
//   },
//   'list.highlightForeground': {
//     hex: '#C5C5C5',
//     f: '[38;2;197;197;197m',
//     b: '[48;2;197;197;197m',
//   },
//   'list.hoverBackground': {
//     hex: '#292d35',
//     f: '[38;2;41;45;53m',
//     b: '[48;2;41;45;53m',
//   },
//   'scrollbarSlider.activeBackground': {
//     hex: '#747D9180',
//     f: '[38;2;116;125;145m',
//     b: '[48;2;116;125;145m',
//   },
//   'scrollbarSlider.background': {
//     hex: '#4E566680',
//     f: '[38;2;78;86;102m',
//     b: '[48;2;78;86;102m',
//   },
//   'scrollbarSlider.hoverBackground': {
//     hex: '#5A637580',
//     f: '[38;2;90;99;117m',
//     b: '[48;2;90;99;117m',
//   },
//   'tab.activeBackground': {
//     hex: '#383E4A',
//     f: '[38;2;56;62;74m',
//     b: '[48;2;56;62;74m',
//   },
//   'tab.border': { hex: '#181A1F', f: '[38;2;24;26;31m', b: '[48;2;24;26;31m' },

//   'titleBar.activeForeground': {
//     hex: '#9da5b4',
//     f: '[38;2;157;165;180m',
//     b: '[48;2;157;165;180m',
//   },
//   'titleBar.inactiveForeground': {
//     hex: '#6B717D',
//     f: '[38;2;107;113;125m',
//     b: '[48;2;107;113;125m',
//   },

//   'name.hoverBackground': {
//     hex: '#2c313a',
//     f: '[38;2;44;49;58m',
//     b: '[48;2;44;49;58m',
//   },
//   'name.Invalid': {
//     hex: '#F8F8F0',
//     f: '[38;2;248;248;240m',
//     b: '[48;2;248;248;240m',
//   },
//   'name.Invalid deprecated': {
//     hex: '#F8F8F0',
//     f: '[38;2;248;248;240m',
//     b: '[48;2;248;248;240m',
//   },

//   'name.Markup: List Punctuation': {
//     hex: '#ffffff',
//     f: '[38;2;255;255;255m',
//     b: '[48;2;255;255;255m',
//   },
// };
