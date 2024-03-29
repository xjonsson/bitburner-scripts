/* eslint-disable */
import { NS } from '@ns';
import { TIME, CORE, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const updateControl = async (ns: NS) => {
  while (true) {
    await launch(ns, CACHE.CONTROL);
    await ns.asleep(TIME.CONTROL);
  }
};

const updatePlayer = async (ns: NS) => {
  while (true) {
    await launch(ns, CACHE.PLAYER);
    await ns.asleep(TIME.PLAYER);
  }
};

const updateHacknet = async (ns: NS) => {
  await launch(ns, CORE.HACKNET);
};

const updateHosting = async (ns: NS) => {
  await launch(ns, CORE.HOSTING);
};

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();

  // ******** Initialize

  // Launch modules
  // launch(ns, CORE.HACKNET);
  updateControl(ns).catch(console.error);
  updatePlayer(ns).catch(console.error);
  updateHacknet(ns).catch(console.error);
  updateHosting(ns).catch(console.error);
  // updateServers(ns).catch(console.error); // FIXME:

  // Keep the game loop going
  while (true) {
    const control = ControlCache.read(ns, 'control');
    const player = PlayerCache.read(ns, 'player');
    const { ticks } = control;
    const { level, money, challenge } = player;
    // const time = performance.now();
    // const { level } = player;

    ns.clearLog();

    ns.printf(
      ' %-5s %-5s %6s %2s ',
      `🖲️${ticks}`,
      `🧠${level}`,
      `💰${ns.formatNumber(money, 1)}`,
      `🔑${challenge}`
    );
    // ns.print(player?.updatedAt);
    // ns.print(formatTime(ns, player?.updatedAt + 1000 * 60 - time));
    ns.print(control);
    await ns.asleep(1000);
  }
}
