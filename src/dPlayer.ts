/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  const p = ns.getPlayer();
  const r = ns.getResetInfo();
  ns.print(p);
  ns.print('--------------------------------');
  ns.print(r);
}
