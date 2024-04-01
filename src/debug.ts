/* eslint-disable */
import { NS } from '@ns';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ServerInfo, Server } from '/os/modules/Server';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  // NOTE: ONETIME CODE

  // NOTE: DOES`THE LOOP
  while (true) {
    ns.clearLog();
    const control = ControlCache.read(ns, 'control');
    const pChallenge = control ? control.challenge : 0;

    const servers = ServerInfo.list(ns)
      .filter((h: string) => h !== 'home')
      .map((h: string) => ServerInfo.details(ns, h));

    const ports = servers.filter((s: Server) => s.challenge <= pChallenge);
    const admin = servers.filter((s: Server) => s.isRoot && !s.isServer);

    // const player = PlayerCache.read(ns, 'player');
    // const servers = hostnames.map((h: string) => {
    //   const s = ServerInfo.details(ns, h);
    //   return s;
    // });
    ns.print('===== DEBUG =====');
    ns.print(`Total visible: ${servers.length}`);
    ns.print(`Ports: ${ports.length} | Admin: ${admin.length}`);

    await ns.asleep(1000);
  }
}
