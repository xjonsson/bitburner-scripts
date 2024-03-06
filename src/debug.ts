/* eslint-disable */
import { NS } from '@ns';
import { PlayerCache } from '/os/modules/Cache';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();

  ns.print(PlayerCache.read(ns, 'player').level);
}
