/* eslint-disable */
import { NS } from '@ns';
import { CORE } from '/os/configs';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.print(PORTS);
  const coreHeader = ' %-8s | %-10s | %-24s ';

  function updateCore() {
    ns.clearLog();

    ns.printf(coreHeader, 'Type', 'Name', 'Path');
    ns.printf(coreHeader, 'System', 'Bitnode', CORE.BITNODE);
    ns.printf(coreHeader, 'System', 'Clock', CORE.CLOCK);
    ns.printf(coreHeader, 'System', 'Launcher', CORE.LAUNCHER);
    ns.printf(coreHeader, 'System', 'Minimal', CORE.MINIMAL);
    ns.printf(coreHeader, 'System', 'Twitch', CORE.TWITCH);
    ns.printf(coreHeader, 'Manager', 'Hacknet', CORE.HACKNET);
    ns.printf(coreHeader, 'Manager', 'Hosting', CORE.HOSTING);
    ns.printf(coreHeader, 'Manager', 'Market', CORE.MARKET);
    ns.printf(coreHeader, 'Manager', 'Monitor', CORE.MONITOR);
    ns.printf(coreHeader, 'Manager', 'Contracts', CORE.CONTRACTS);
  }

  while (true) {
    updateCore();
    await ns.sleep(1000);
  }
}
