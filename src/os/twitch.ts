/* eslint-disable */
import { NS } from '@ns';
import { TIME, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
import { ControlCache } from '/os/modules/Cache';
import Player from '/os/modules/Player';
/* eslint-enable */

const updateControl = async (ns: NS) => {
  while (true) {
    await launch(ns, CACHE.CONTROL);
    await ns.asleep(TIME.CONTROL);
  }
};

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();

  // ******** Initialize
  const player = new Player(ns, 'player');
  // player.updateCache().catch(console.error);
  player.createEventListener('level').catch(console.error);
  player.createEventListener('money').catch(console.error);

  // Launch modules
  // launch(ns, CORE.HACKNET);
  updateControl(ns).catch(console.error);
  // updatePlayer(ns).catch(console.error);
  // updateServers(ns).catch(console.error); // FIXME:

  // Keep the game loop going
  while (true) {
    const control = ControlCache.read(ns, 'control');
    const { ticks } = control;

    ns.clearLog();

    ns.printf(' %-5s ', `🖲️${ticks}`);
    ns.print(control);
    await ns.asleep(1000);
  }
}
