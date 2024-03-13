/* eslint-disable */
import { NS } from '@ns';
import { PlayerCache } from '/os/modules/Cache';
import { Scan } from '/os/utils/scan';
import Server from '/os/modules/Server';
import { serversData } from '/os/data/servers';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('scan');
  ns.tail();
  ns.clearLog();

  // ns.print(PlayerCache.read(ns, 'player').level);
  const player = PlayerCache.read(ns, 'player');
  // const servers = Scan.list(ns)
  //   .map((s: any) => {
  //     const n = new Server(ns, player, s);
  //     return n;
  //   })
  //   .sort((a: Server, b: Server) => a.challenge - b.challenge)
  //   .sort((a: Server, b: Server) => a.level - b.level);
  // ns.print(`Level | Challenge | Hostname | Organization | Money | Ram`);

  const sample = [
    'joesguns',
    'neo-net',
    'CSEC',
    'phantasy',
    'avmnite-02h',
    'computek',
    'I.I.I.I',
    'aevum-police',
    '.',
    'run4theh111z',
    'vitalife',
    'The-Cave',
    'fulcrumassets',
    'w0r1d_d43m0n',
  ];

  const servers = serversData.filter((s) => s.challenge === 5);
  const rowHeader = ' %-18s | %1s | %4s | %9s | %5s | %5s | %4s | %4s ';
  ns.printf(
    rowHeader,
    'Server',
    'C',
    'LVL',
    'Type',
    'Bot',
    'Cash',
    'Ram',
    'Money'
  );
  servers.forEach((s) => {
    ns.printf(
      rowHeader,
      s.hostname,
      s.challenge,
      s.level,
      s.type,
      s.isBot,
      s.isTarget,
      s.ram,
      s.money
    );
  });
}
