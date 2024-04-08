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
  if (!ns.isRunning(CORE.HACKNET, 'home')) {
    await launch(ns, CORE.HACKNET);
    await ns.asleep(TIME.HACKNET);
  }
};

const updateHosting = async (ns: NS) => {
  if (!ns.isRunning(CORE.HOSTING, 'home')) {
    await launch(ns, CORE.HOSTING);
    await ns.asleep(TIME.HOSTING);
  }
};

const updateContracts = async (ns: NS) => {
  if (!ns.isRunning(CORE.CONTRACTS, 'home')) {
    await launch(ns, CORE.CONTRACTS);
  }
};

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();

  // ******** Initialize

  // Launch modules
  updateControl(ns).catch(console.error);
  updatePlayer(ns).catch(console.error);
  updateHacknet(ns).catch(console.error); // TODO: Improve timings
  updateHosting(ns).catch(console.error); // TODO: Improve performance
  updateContracts(ns).catch(console.error); // TODO: Complete solutions

  // Keep the game loop going
  while (true) {
    const control = ControlCache.read(ns, 'control');
    const player = PlayerCache.read(ns, 'player');
    const { ticks } = control;
    const { level, money, challenge } = player;
    const { stage, phase, hackTargets, isShopHacknet, isShopHosting } = control;
    // const time = performance.now();
    // const { level } = player;

    ns.clearLog();

    ns.printf(
      ' %-5s %-5s %6s %2s %2s %2s %3s %2s %-16s',
      `🖲️${ticks}`,
      `🧠${level}`,
      `💰${ns.formatNumber(money, 1)}`,
      `🔑${challenge}`,
      `👾${isShopHacknet ? '✅' : '❌'}`,
      `🖥️${isShopHosting ? '✅' : '❌'}`,
      `🎯${hackTargets.length}`,
      `🚀${stage}`,
      `${phase.done ? '✅' : '❌'}${phase.msg}`
    );
    // ns.print(control); // NOTE: Debug
    await ns.asleep(1000);
  }
}
