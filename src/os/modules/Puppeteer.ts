/* eslint-disable */
import { NS } from '@ns';
import { DEPLOY } from '/os/configs';
import { ServerInfo, Server } from '/os/modules/Server';
import ServerTarget from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Styling

// ******** Main function
export async function main(ns: NS) {
  // ******** Setup
  const xWidth = 1040;
  const xHeight = 430;
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  // ns.disableLog('ALL');
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.disableLog('asleep');
  ns.disableLog('scan');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Puppeteer');
  ns.resizeTail(xWidth, xHeight);
  ns.moveTail(wWidth - 200 - xWidth, 0);
  const start = performance.now();

  // ******** Initialize (One Time Code)

  // ******** Primary (Loop Time Code)
  while (true) {
    ns.clearLog();
    const now = performance.now();

    ns.print(formatTime(ns, now - start));
    ns.print('===== DEBUG =====');

    await ns.asleep(1000);
  }
}
