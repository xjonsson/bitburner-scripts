/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo, Server } from '/os/modules/Server';
import ServerTarget from '/os/modules/ServerTarget';
import { formatTime } from 'os/utils/formatTime';
/* eslint-enable */

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 1000],
    ['silent', false],
    ['help', false],
  ]);

  // const target = ns.args[0] as string;

  if (!flags.silent) {
    ns.tail();
  }

  ns.disableLog('ALL');
  ns.clearLog();

  // ******** Initialize

  // Keep the game loop going
  while (!flags.silent) {
    ns.clearLog();
    const servers = ServerInfo.list(ns)
      .filter((h: string) => h !== 'home')
      .map((h: string) => ServerInfo.details(ns, h))
      .filter((s: Server) => s.isTarget)
      .map((s: Server) => new ServerTarget(ns, s.hostname))
      .sort((a: Server, b: Server) => a.level - b.level);

    const rowHeader =
      '%4s %-4s %-18s %6s |%2s|%6s %4s|%5s| %4s | %4s | %4s | %4s |%7s|%7s|%7s| %7s | %6s ';
    ns.printf(
      rowHeader,
      'Lvl',
      'Sta',
      'Server',
      'RAM',
      '💰',
      'Money',
      '%',
      '+Sec',
      'Weak',
      'Grow',
      'Meak',
      'Hack',
      'Hack',
      'Weak',
      'Grow',
      'Batch',
      'Value'
    );

    servers.forEach((s: ServerTarget) => {
      const batch = s.getBatch();
      ns.printf(
        rowHeader,
        s.isServer ? '' : s.level,
        /* eslint-disable */
        s.isRoot ? (s.isDoor ? '🚪D' : '🔑R') : `👾${s.challenge}`,
        /* eslint-enable */
        s.hostname,
        s.isBot ? ns.formatRam(s.ram.max, 0) : '',
        /* eslint-disable */
        s.aAttack ? '💰' : s.aWeak ? '🔓' : s.aGrow ? '🌿' : '',
        /* eslint-enable */
        s.isCash ? ns.formatNumber(s.money.max, 1) : '',
        s.isCash ? ns.formatPercent(s.money.now / s.money.max, 0) : '',
        s.aWeak ? `+${ns.formatNumber(s.sec.now - s.sec.min, 1)}` : '',
        s.aWeak ? s.weakThreads : '',
        s.aGrow ? s.growThreads() : '',
        s.aGrow ? s.weakThreadsAfterGrow() : '',
        s.aHack ? s.hackThreads : '',
        s.aHack ? formatTime(ns, s.hackTime) : '',
        s.aWeak ? formatTime(ns, s.weakTime) : '',
        s.aGrow ? formatTime(ns, s.growTime) : '',
        // s.aAttack ? ns.formatRam(batch.dRam, 2) : '',
        ns.formatRam(batch.dRam, 2),
        ns.formatNumber(batch.dValue, 2)
      );
    });

    await ns.asleep((flags.refresh as number) || 1000);
  }
}
