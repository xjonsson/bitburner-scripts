/* eslint-disable */
import { NS } from '@ns';
import { PlayerCache } from '/os/modules/Cache';
import { Server, ServerInfo } from '/os/modules/Server';
// import { serversData } from '/os/data/servers';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('scan');
  ns.tail();
  ns.clearLog();

  const p = PlayerCache.read(ns, 'player');
  // const s = ServerInfo.list(ns);
  // ns.print(s);
  const servers = ServerInfo.all(ns);
  servers.forEach((s: Server) => {
    ns.print(`[Server] ${s.hostname} | ${s.level} | ${s.distance.message}`);
  });
}
