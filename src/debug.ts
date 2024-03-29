/* eslint-disable */
import { NS } from '@ns';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ServerInfo } from '/os/modules/Server';
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
    // const control = ControlCache.read(ns, 'control');
    // const player = PlayerCache.read(ns, 'player');
    const hostnames = ServerInfo.list(ns);
    const servers = hostnames.map((h: string) => {
      const s = ServerInfo.details(ns, h);
      return s;
    });
    const nodes = servers.filter((s) => s.isNode);
    ns.print('===== DEBUG =====');
    ns.print(`Nodes: ${nodes.length}`);
    nodes.forEach((s) => ns.print(s.hostname));
    // ns.print(ns.peek(2));

    await ns.asleep(1000);
  }
}
