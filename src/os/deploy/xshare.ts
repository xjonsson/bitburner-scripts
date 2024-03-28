/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export async function main(ns: NS) {
  const sustain = ns.args[0] || false;
  // ns.tail();
  // ns.clearLog();
  // ns.disableLog('disableLog');
  // ns.disableLog('share');

  const sharePower = ns.getSharePower();
  ns.print(`[Time] ${new Date().toLocaleTimeString()}`);
  ns.print(`[Share] ${sharePower}`);
  await ns.share();

  while (sustain) {
    ns.print(`[Time] ${new Date().toLocaleTimeString()}`);
    ns.print(`[Share] ${sharePower}`);
    await ns.share();
  }
}
