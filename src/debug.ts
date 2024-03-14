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

  // const p = PlayerCache.read(ns, 'player');
  // // const s = ServerInfo.list(ns);
  // // ns.print(s);
  // const servers = ServerInfo.all(ns);
  // servers.forEach((s: Server) => {
  //   ns.print(`[Server] ${s.hostname} | ${s.level} | ${s.distance.message}`);
  // });

  while (true) {
    const c = ControlCache.read(ns, 'control');
    // ns.clearLog();
    ns.print(c);
    // ns.print(
    //   `[Past] ${c?.past?.player.level} [Now] ${c?.player.level} [Action] ${c?.player?.action?.length}`
    // );
    // ns.print(`[Action] ${c?.player.action}`);
    await ns.asleep(1000);
  }
}
