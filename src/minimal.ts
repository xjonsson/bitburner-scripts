/* eslint-disable-next-line */
import { NS } from '@ns';

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();

  ns.print(`[Minimal] This module is when you are starting out`);
  const row = '%-10s | %8s | %12s | %12s';
  ns.printf(row, 'HOSTNAME', 'HACK LVL', 'MAX $$', 'CASH $$');
  ns.printf(row, '---------', '-------', '------', '-------');
  // for (const target of potentialTargets) {
  //   ns.tprintf(
  //     row,
  //     target.hostname,
  //     ns.nFormat(target.requiredHackingLevel, '0,0'),
  //     ns.nFormat(target.maxMoney, '($ 0.00 a)'),
  //     ns.nFormat(target.MoneyAvailable, '($ 0.00 a)')
  //   );
  // }
}
