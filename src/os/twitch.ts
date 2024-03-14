/* eslint-disable */
import { NS } from '@ns';
import { TIME, CORE, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
/* eslint-enable */

const updatePlayer = async (ns: NS) => {
  while (true) {
    await launch(ns, CACHE.PLAYER);
    await ns.asleep(TIME.PLAYER);
  }
};

// CACHE.AUGMENTS, // TODO: Add this
// CACHE.SLEEVES, // TODO: Add this
// CACHE.HACKNET, // TODO: Add this
// CACHE.SERVERS, // TODO: Add this

const updateServers = async (ns: NS) => {
  while (true) {
    await launch(ns, CACHE.SERVERS);
    // await ns.asleep(TIME.SERVERS);
    await ns.asleep(1000); // FIXME: HIGH CPU USAGE
  }
};

// CACHE.FACTIONS, // TODO: Add this
// CACHE.CORPORATIONS, // TODO: Add this
// CACHE.CRIMES, // TODO: Add this
// CACHE.STOCKS, // TODO: Add this

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();

  // Launch modules
  // launch(ns, CORE.HACKNET); // FIXME:
  updatePlayer(ns).catch(console.error);
  // updateAugments(ns).catch(console.error);
  // updateSleeves(ns).catch(console.error);
  // updateHacknet(ns).catch(console.error);
  updateServers(ns).catch(console.error);
  // updateFactions(ns).catch(console.error);
  // updateCorporations(ns).catch(console.error);
  // updateCrimes(ns).catch(console.error);
  // updateStocks(ns).catch(console.error);

  // Keep the game loop going
  while (true) {
    await ns.asleep(1000);
  }
}
