/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.print(PORTS);
  const portsHeader = ' %-12s | %4s | %-12s | %-24s ';

  function updatePorts() {
    ns.clearLog();

    ns.printf(portsHeader, 'Purpose', 'Port', 'Name', 'Data');
    ns.printf(portsHeader, 'System', PORTS.SYSTEM, PORTS[1]);
    ns.printf(portsHeader, 'Control', PORTS.CONTROL, PORTS[2]);
    ns.printf(portsHeader, 'Bitnode', PORTS.BITNODE, PORTS[3]);
    ns.printf(portsHeader, 'Player', PORTS.PLAYER, PORTS[4]);
    ns.printf(portsHeader, 'Augments', PORTS.AUGMENTS, PORTS[5]);
    ns.printf(portsHeader, 'Sleeves', PORTS.SLEEVES, PORTS[6]);
    ns.printf(portsHeader, 'Hacknet', PORTS.HACKNET, PORTS[7]);
    ns.printf(portsHeader, 'Servers', PORTS.SERVERS, PORTS[8]);
    ns.printf(portsHeader, 'Factions', PORTS.FACTIONS, PORTS[9]);
    ns.printf(portsHeader, 'Corporations', PORTS.CORPORATIONS, PORTS[10]);
    ns.printf(portsHeader, 'Crimes', PORTS.CRIMES, PORTS[11]);
    ns.printf(portsHeader, 'Stocks', PORTS.STOCKS, PORTS[12]);
  }

  while (true) {
    updatePorts();
    await ns.sleep(1000);
  }
}
