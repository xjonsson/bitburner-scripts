/* eslint-disable */
import { NS } from '@ns';
import Player from '/os/modules/Player';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  // NOTE: ONETIME CODE
  // const sample = ControlCache.read(ns, 'control').serverReclaim;
  // ns.print(sample.length);
  // ns.print(sample);

  // for (let i = 1; i <= 20; i += 1) {
  //   ns.clearPort(i);
  // }

  // NOTE: DOES`THE LOOP
  while (true) {
    ns.clearLog();
    // const stage = ControlCache.read(ns, 'control')?.stage;
    // const player = PlayerCache.read(ns, 'player');
    // const phase = ControlCache.read(ns, 'control')?.phase;
    // const sample = ControlCache.read(ns, 'control')?.actions;
    // const p = new Player(ns);
    ns.print('===== DEBUG =====');
    // ns.print(ns.peek(2));
    // ns.print(p.money);

    await ns.asleep(1000);
  }
}
