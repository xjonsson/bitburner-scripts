/* eslint-disable */
import { NS } from '@ns';
import { Print, Banner, Text, BG } from '/os/utils/colors';
import { HacknetCache } from '/os/modules/Cache';
/* eslint-enable */

// ******** Globals
// const { SUCCESS, INFO, WARN, ERROR, DARK } = COLORS;

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  // ******** DEBUG ONETIME START ********
  // const s1 = Scan.list(ns);
  // const s2 = Scan.route(ns, 'CSEC');
  // const s3 = Scan.routeTerminal(ns, 'CSEC');
  // const s4 = Scan.routeTerminal(ns, 'CSEC', true);

  // ******** DEBUG ONETIME END ********
  // ns.print('======== COLORS ========');
  // ns.print(Print.ctext(Type.ERROR, 'This is some text', true));
  // ns.print(Print.banner(Type.SUCCESS, 'Good', 'This is my banner text'));
  // ns.print(Print.banner(Type.INFO, 'Banner', 'This is my banner text'));
  // ns.print(Print.banner(Type.WARN, 'Eh', 'This is my banner text'));
  // ns.print(Print.banner(Type.ERROR, 'Bad', 'This is my banner text'));
  // ns.print('======== PRINT ========');
  // Print.pbanner(ns, Type.SUCCESS, 'Good', 'This is my banner text');
  // Print.pbanner(ns, Type.INFO, 'Inf', 'This is my banner text');
  // Print.pbanner(ns, Type.WARN, 'Eh', 'This is my banner text');
  // Print.pbanner(ns, Type.ERROR, 'Bad', 'This is my banner text');
  // ns.print('======== PRINT TEXT ========');
  // Print.ptext(ns, Type.SUCCESS, 'Regular text');
  // Print.ptext(ns, Type.INFO, 'Regular text');
  // Print.ptext(ns, Type.WARN, 'Regular text');
  // Print.ptext(ns, Type.ERROR, 'Regular text');
  // ns.print(
  //   ' LVL Server            📝 Cash    %  +Sec   HC 💎 Hack Weak Grow Meak    Time Batch VPRS HWGW    Update',
  // );
  // ns.print(
  //   ' 100 iron-gym          🔓  20m       +0.0  0.6 ❌       694       271  5m 27s        293         3m 38s',
  // );
  ns.print('======== Samples ========');
  ns.print(Banner.normal('Test', 'This is my test'));
  ns.print(Banner.info('Info', 'This is my test'));
  ns.print(Banner.warning('Warning', 'This is my test'));
  ns.print(Banner.error('Error', 'This is my test'));
  ns.print(Banner.dark('Dark', 'This is my test'));
  ns.print(Banner.black('Black', 'This is my test'));
  ns.print(Banner.blue('Blue', 'This is my test'));
  ns.print(Banner.green('Green', 'This is my test'));
  ns.print(Banner.yellow('Yellow', 'This is my test'));
  ns.print(Banner.cyan('Cyan', 'This is my test'));
  ns.print(Banner.magenta('Magenta', 'This is my test'));
  ns.print(Banner.red('Red', 'This is my test'));
  ns.print(Banner.white('White', 'This is my test'));
  ns.print(Banner.bBlack('Black', 'This is my test'));
  ns.print(Banner.bBlue('Blue', 'This is my test'));
  ns.print(Banner.bGreen('Green', 'This is my test'));
  ns.print(Banner.bYellow('Yellow', 'This is my test'));
  ns.print(Banner.bCyan('Cyan', 'This is my test'));
  ns.print(Banner.bMagenta('Magenta', 'This is my test'));
  ns.print(Banner.bRed('Red', 'This is my test'));
  ns.print(Banner.bWhite('White', 'This is my test'));
  ns.print(Banner.text('Text', 'This is my test'));
  ns.print(Banner.bg('bg', 'This is my test'));
  ns.print(Banner.bg2('bg2', 'This is my test'));
  ns.print(Banner.comment('Comment', 'This is my test'));
  ns.print(Banner.class('class', 'This is my test'));
  ns.print(Banner.arg('arg', 'This is my test'));
  ns.print(Banner.show('show', 'This is my test'));
  ns.print(Banner.header('header', 'This is my test'));
  ns.print(Banner.insert('insert', 'This is my test'));
  ns.print('======== Samples ========');
  const sample = HacknetCache.read(ns);
  ns.tprint(sample);
  // ns.tprint(Banner.warning('DEBUG', sample);
  // ns.print(ctext('INFO', ' Banner ', true), ctext('ERROR', 'This is my text'));
  // ns.print(`${DARK.f}This is a DARK message ${RESET}`);
  // ns.print(`${DARK.b} DARK ${RESET} This is a DARK background msg`);
  // ns.print(`${DARK.b} Note ${DARK.f} This is a DARK background msg`);
  // ns.print(
  //   `\u001b[48;2;34;34;34;38;2;215;218;224m DARK ${RESET} This is a DARK background msg`,
  // );

  await ns.asleep(1000);
}

export function autocomplete({ servers }: { servers: string[] }) {
  return servers;
}
