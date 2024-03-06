/* eslint-disable */
import { NS } from '@ns';
import { CORE, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
/* eslint-enable */

export async function main(ns: NS) {
  // ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('asleep');

  // TODO: Kill all processes
  // TODO: Prep servers
  // TODO: Prep bitnode

  // Clear ports for clean run
  for (let i = 1; i <= 20; i += 1) {
    ns.clearPort(i);
  }

  // Prepare the cache before running
  for (const cache of [
    // CACHE.BITNODE, // TODO: Add this
    CACHE.PLAYER,
    // CACHE.AUGMENTS, // TODO: Add this
    // CACHE.SLEEVES, // TODO: Add this
    // CACHE.HACKNET, // TODO: Add this
    // CACHE.SERVERS, // TODO: Add this
    // CACHE.FACTIONS, // TODO: Add this
    // CACHE.CORPORATIONS, // TODO: Add this
    // CACHE.CRIMES, // TODO: Add this
    // CACHE.STOCKS, // TODO: Add this
  ]) {
    await launch(ns, cache);
  }

  if (ns.getServerMaxRam('home') >= 32) {
    ns.print('We would run full');
    ns.spawn(CORE.TWITCH);
  } else {
    ns.print('We would run minimal');
    ns.spawn(CORE.MINIMAL); // FIXME: Doesnt exist
  }
}
