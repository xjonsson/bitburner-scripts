/* eslint-disable */
import { NS } from '@ns';
import { ServersCache, ControlCache } from '/os/modules/Cache';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.clearLog();
  ns.tail();

  // ******** Initialize

  // Keep the game loop going
  while (true) {
    const focus = ControlCache.read(ns, 'control').serverFocus;
    focus.forEach((h: string) => {
      const target = ServersCache.read(ns, h);
      ns.print(`Target ${target.hostname} ${target.money.max}`);
    });
    // ns.print(targets);
    await ns.asleep(1000);
  }
}
