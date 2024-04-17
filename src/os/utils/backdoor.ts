/* eslint-disable */
import { NS } from '@ns';
import { Scan } from '/os/utils/scan';
import { PlayerCache } from '/os/modules/Cache';
import { ServerInfo, Server } from '/os/modules/Server';
/* eslint-enable */

// NOTE: You must be on the terminal tab for injection to work.

// const terminalInput = document.getElementById('terminal-input');
const terminalInput: any = document.getElementById(
  'terminal-input'
) as HTMLInputElement;
const handler = Object?.keys(terminalInput)[1];

function backdoor(ns: NS, route: string) {
  terminalInput.value = route;
  terminalInput[handler].onChange({
    target: terminalInput,
  });
  terminalInput[handler].onKeyDown({
    key: 'Enter',
    preventDefault: () => null,
  });
}

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('scan');
  ns.disableLog('sleep');
  ns.clearLog();
  ns.tail();

  // Launch modules
  const p = PlayerCache.read(ns, 'player');

  const servers = ServerInfo.list(ns)
    .filter((h: string) => h !== 'home')
    .map((h: string) => new Server(ns, h))
    .filter(
      (s: Server) => s.isRoot && !s.isServer && s.level <= p.level && !s.isDoor
    )
    .sort((a: Server, b: Server) => a.level - b.level);

  const doors: any = [];

  servers.forEach((s: Server) => {
    // const msgRoot = node.level <= p.hacking ? '✓  ' : '⛌  ';
    const msgRoute = Scan.routeTerminalBackdoor(ns, s.hostname);
    const door = {
      hostname: s.hostname,
      level: s.level,
      route: msgRoute,
      time: ns.getHackTime(s.hostname) / 4,
    };
    doors.push(door);
    // ns.printf(rowHeader, node.level, msgRoot, node.hostname, msgRoute);
  });

  const rowHeader = ' %2s %3s %-18s %-24s ';
  ns.print(`[Doors] ${doors.length}`);
  ns.printf(rowHeader, '  ', 'Lvl', 'Server', 'Time');
  ns.printf(rowHeader, '--', '--', '------------------', '------------------');

  while (doors.length > 0) {
    const next = doors[0];
    const delay = next.time + 1000;
    if (next.level <= p.level) {
      ns.printf(
        rowHeader,
        doors.length,
        next.level,
        next.hostname,
        `(${ns.tFormat(next.time)})`
      );
      backdoor(ns, next.route);
      doors.shift();
    }
    await ns.sleep(delay);
  }

  // ns.print(s);
  // ns.print(p.level);
}
