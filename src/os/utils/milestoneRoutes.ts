/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo, Server } from '/os/modules/Server';
import { Scan } from '/os/utils/scan';
/* eslint-enable */

// ******** Styling

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  // const start = performance.now(); // DEBUG

  // ******** Single run code
  const m1 = Scan.routeTerminalBackdoor(ns, 'CSEC');
  const m2 = Scan.routeTerminalBackdoor(ns, 'avmnite-02h');
  const m3 = Scan.routeTerminalBackdoor(ns, 'I.I.I.I');
  const m4 = Scan.routeTerminalBackdoor(ns, 'run4theh111z');
  ns.print(
    `alias m1="${m1}";alias m2="${m2}";alias m3="${m3}";alias m4="${m4}";`
  );
  ns.tprint(
    `alias m1="${m1}";alias m2="${m2}";alias m3="${m3}";alias m4="${m4}";`
  );

  // ******** Loop code
  // while (true) {
  //   ns.clearLog();
  //   const now = performance.now(); // DEBUG

  //   // ******** Each tick
  //   ns.print('========DEBUG========');

  //   await ns.asleep(1000);
  // }
}
