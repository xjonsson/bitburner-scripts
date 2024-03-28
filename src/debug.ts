/* eslint-disable */
import { NS } from '@ns';
import { PlayerCache } from '/os/modules/Cache';
import { Server, ServerInfo } from '/os/modules/Server';
import { ControlCache } from '/os/modules/Cache';
import { ControlInfo } from '/os/modules/Control';
// import { serversData } from '/os/data/servers';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  // NOTE: ONETIME CODE
  // const sample = ControlCache.read(ns, 'control').serverReclaim;
  // ns.print(sample.length);
  // ns.print(sample);

  // NOTE: DOES`THE LOOP
  while (true) {
    ns.clearLog();
    // const c = ControlCache.read(ns, 'control');
    // ns.print(c); // FIXME: Plane work
    // const sample = ControlCache.read(ns, 'control').serverReclaim;
    // const sample = ControlCache.read(ns, 'control').serverFocus;
    const stage = ControlCache.read(ns, 'control')?.stage;
    const player = PlayerCache.read(ns, 'player');
    const phase = ControlCache.read(ns, 'control')?.phase;
    const sample = ControlCache.read(ns, 'control')?.actions;
    ns.print(sample?.length);
    ns.print(sample);
    ns.print(`Milestone ${phase}`);
    ns.print('===== DEBUG =====');
    ns.print(player?.faction.factions);
    ns.print(stage);

    await ns.asleep(1000);
  }
}
