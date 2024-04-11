/* eslint-disable */
import { NS } from '@ns';
import { ControlCache } from '/os/modules/Cache';
import { formatTime } from '/os/utils/formatTime';
import ServerTarget from '/os/modules/ServerTarget';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('getHackingLevel');
  ns.clearLog();
  ns.tail();

  // ******** Initialize

  // Keep the game loop going
  function updateDisplay() {
    const control = ControlCache.read(ns, 'control');
    const focus = control?.serverFocus;
    ns.clearLog();
    if (control) {
      ns.print(`[Action] ${control.actions[0]}`);

      const headerRow = ` %6s |%4s| %-18s | %5s | %6s | %4s |%6s |%5s|%5s|%5s |%5s|%10s|%10s`;
      const serverRow = ` %6s |%4s| %-18s | %5s | %6s | %4s |%6s|%5s|%5s|%5s|%5s|%10s|%10s`;
      ns.printf(
        headerRow,
        '💎 Step',
        'LVL',
        'Server',
        'Money',
        'Cash',
        'Sec',
        '🎲',
        '👾',
        '🔓',
        '🌿',
        '🔓🌿',
        '💎 Value',
        'Time'
      );
      // ns.printf(serverRow, '💸 Hack', '999', 'Hack Server', '', '', '', '100%');
      // ns.printf(serverRow, '🔓 Weak', '999', 'Weak Server', '', '', '', '50%');
      // ns.printf(serverRow, '🌿 Grow', '999', 'Grow Server', '', '', '', '1%');
      if (focus) {
        focus.forEach((h: string) => {
          // const base = ServersCache.read(ns, h);
          const s = new ServerTarget(ns, h);
          const b = s.getBatch(true, 1);
          ns.printf(
            serverRow,
            s.sanity.action, // Was s.action.msg
            s.level,
            s.hostname,
            ns.formatNumber(s.money.max, 1),
            ns.formatPercent(s.money.now / s.money.max, 1),
            `+${ns.formatNumber(s.sec.now - s.sec.min, 1)}`,
            ns.formatPercent(s.hackChance, 1),
            ns.formatNumber(s.hackThreads, 0),
            ns.formatNumber(s.weakThreads, 0),
            ns.formatNumber(s.growThreads(false, 1), 0),
            ns.formatNumber(s.weakThreadsAfterGrow(false, 1), 0),
            ns.formatNumber(s.sanity.value, 1),
            formatTime(ns, b.deployTime)
          );
        });
      }
    }
  }

  while (true) {
    updateDisplay();

    await ns.asleep(1000);
  }
}
