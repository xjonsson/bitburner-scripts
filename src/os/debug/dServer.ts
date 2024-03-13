/* eslint-disable */
import { NS } from '@ns';
//import { ServerCache } from '/os/modules/Cache';
import { Scan } from '/os/utils/scan';
import { Server, ServerInfo } from '/os/modules/Server';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('scan');
  ns.disableLog('getHackingLevel');
  const serversHeader = ' %-16s | %14s | %12s | %8s | %6s | %6s | %6s ';

  const serverlist = Scan.list(ns);

  function updateServers() {
    ns.clearLog();

    // const player = PlayerCache.read(ns, 'player');
    const servers = ServerInfo.all(ns).filter((s: Server) => s.isTarget);
    servers.sort((a: Server, b: Server) => a.level - b.level);

    // ns.printf(portsHeader, 'Purpose', 'Port', 'Name', 'Data');
    ns.printf(
      serversHeader,
      'Server',
      'Cash',
      'Sec',
      'HTime',
      'Hack',
      'Grow',
      'Weak'
    );

    servers.map((s: Server) => {
      ns.printf(
        serversHeader,
        s.id,
        `${ns.formatNumber(s.money.available, 2)}/${ns.formatNumber(
          s.money.max,
          2
        )}`,
        `${ns.formatNumber(Math.max(0, s.security.level), 2)}/${ns.formatNumber(
          Math.max(0, s.security.min),
          2
        )}`,
        `${ns.formatNumber(s.hackTime / 1000, 2)}s`,
        `${ns.formatNumber(
          Math.ceil(ns.hackAnalyzeThreads(s.id, s.money.max * 0.01)),
          0
        )}`,
        `${ns.formatNumber(
          Math.ceil(
            ns.growthAnalyze(s.id, s.money.max / Math.max(1, s.money.available))
          ),
          0
        )}`,
        `${ns.formatNumber(
          Math.ceil((0.002 + s.security.level - s.security.min) / 0.05),
          0
        )}`
      );
    });
    // ns.printf(
    //   portsHeader,
    //   'System',
    //   PORTS.SYSTEM,
    //   PORTS[1],
    //   ns.peek(PORTS.SYSTEM) // TODO: Add cache primary
    // );
  }

  // ns.print(serverlist);
  // const s = new Server(ns, 'n00dles');
  // ns.print(s);

  while (true) {
    updateServers();
    await ns.sleep(1000);
  }
}
