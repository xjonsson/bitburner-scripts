/* eslint-disable */
import { NS } from '@ns';
import { Scan } from '/os/utils/scan';
import { PlayerCache } from '/os/modules/Cache';
/* eslint-enable */

// NOTE: You must be on the terminal tab for injection to work.

// const terminalInput = document.getElementById('terminal-input');
const terminalInput = document.getElementById(
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

function sortDoor(doorA: any, doorB: any) {
  return doorA.level - doorB.level;
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
  const s = Scan.list(ns)
    .filter((hostname) => hostname !== 'home')
    .map((hostname) => {
      const data = ns.getServer(hostname as string);
      const server = {
        hostname: data.hostname,
        server: data.purchasedByPlayer,
        level: data.requiredHackingSkill || 9999,
        root: data.hasAdminRights,
        challenge: data.numOpenPortsRequired,
        open: data.openPortCount,
        door: data.backdoorInstalled,
      };

      return server;
    })
    .filter((node) => {
      if (node.root && node.level <= p.level && !node.door && !node.server) {
        return true;
      }
      return false;
    })
    .sort(sortDoor);

  const doors: any = [];

  s.forEach((node) => {
    // const msgRoot = node.level <= p.hacking ? '✓  ' : '⛌  ';
    const msgRoute = Scan.routeTerminal(ns, node.hostname);
    const door = {
      hostname: node.hostname,
      level: node.level,
      route: msgRoute,
    };
    doors.push(door);
    // ns.printf(rowHeader, node.level, msgRoot, node.hostname, msgRoute);
  });

  const rowHeader = ' %5s | %5s | %-20s | %-24s ';
  ns.print(`[Doors]  ${doors.length}`);
  ns.printf(rowHeader, 'Door', 'Level', 'Server', 'Time');
  ns.printf(
    rowHeader,
    '-----',
    '-----',
    '------------------',
    '------------------'
  );

  while (doors.length > 0) {
    const delay = ns.getHackTime(doors[0].hostname) / 4 + 1000;
    if (doors[0].level <= p.level) {
      ns.printf(
        rowHeader,
        doors.length,
        doors[0].level,
        doors[0].hostname,
        ns.tFormat(delay - 1000)
      );
      backdoor(ns, doors[0].route);
      doors.shift();
    }
    await ns.sleep(delay);
  }

  // ns.print(s);
  // ns.print(p.level);
}
