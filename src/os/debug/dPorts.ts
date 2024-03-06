/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
import { PlayerCache } from '/os/modules/Cache';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.print(PORTS);
  const portsHeader = ' %-12s | %4s | %-12s | %-24s ';

  // Clear the ports before running
  for (let i = 1; i <= 20; i += 1) {
    ns.clearPort(i);
  }

  function updatePorts() {
    ns.clearLog();

    const player = PlayerCache.read(ns, 'player');

    ns.printf(portsHeader, 'Purpose', 'Port', 'Name', 'Data');
    ns.printf(
      portsHeader,
      'System',
      PORTS.SYSTEM,
      PORTS[1],
      ns.peek(PORTS.SYSTEM) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Control',
      PORTS.CONTROL,
      PORTS[2],
      ns.peek(PORTS.CONTROL) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Bitnode',
      PORTS.BITNODE,
      PORTS[3],
      ns.peek(PORTS.BITNODE) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Player',
      PORTS.PLAYER,
      PORTS[4],
      // ns.peek(PORTS.PLAYER) // TODO: Add cache primary
      `Level: ${player?.level} | ${ns.formatNumber(player?.money || 0, 3)}`
    );
    ns.printf(
      portsHeader,
      'Augments',
      PORTS.AUGMENTS,
      PORTS[5],
      ns.peek(PORTS.AUGMENTS) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Sleeves',
      PORTS.SLEEVES,
      PORTS[6],
      ns.peek(PORTS.SLEEVES) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Hacknet',
      PORTS.HACKNET,
      PORTS[7],
      ns.peek(PORTS.HACKNET) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Servers',
      PORTS.SERVERS,
      PORTS[8],
      ns.peek(PORTS.SERVERS) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Factions',
      PORTS.FACTIONS,
      PORTS[9],
      ns.peek(PORTS.FACTIONS) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Corporations',
      PORTS.CORPORATIONS,
      PORTS[10],
      ns.peek(PORTS.CORPORATIONS) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Crimes',
      PORTS.CRIMES,
      PORTS[11],
      ns.peek(PORTS.CRIMES) // TODO: Add cache primary
    );
    ns.printf(
      portsHeader,
      'Stocks',
      PORTS.STOCKS,
      PORTS[12],
      ns.peek(PORTS.STOCKS) // TODO: Add cache primary
    );
  }

  while (true) {
    updatePorts();
    await ns.sleep(1000);
  }
}
