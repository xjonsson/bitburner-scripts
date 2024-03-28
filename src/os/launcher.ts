/* eslint-disable */
import { NS } from '@ns';
import { CORE, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('asleep');

  // TODO: Kill all processes
  // TODO: Prep servers
  // TODO: Prep bitnode
  // const node = ns.getResetInfo().currentNode; // Gets current bitnode

  // Clear ports for clean run
  for (let i = 1; i <= 20; i += 1) {
    ns.clearPort(i);
  }

  // Prepare the cache before running
  for (const cache of [
    CACHE.CONTROL,
    // CACHE.PLAYER,
  ]) {
    await launch(ns, cache);
  }

  if (ns.getServerMaxRam('home') >= 32) {
    ns.print('We would run full');
    ns.closeTail();
    ns.spawn(CORE.TWITCH);
  }
  // else {
  //   ns.print('We would run minimal');
  //   ns.spawn(CORE.MINIMAL); // FIXME: Doesnt exist
  // }
}
