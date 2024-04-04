/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ServerInfo, Server } from '/os/modules/Server';
import ServerTarget from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { xHack, xWeak, xGrow } = DEPLOY;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;
const singleTargetBatches = CONFIGS.hacking.batches;

// ******** Utility
function nodeThreads(ram: number, script = 1.6): number {
  return Math.floor(ram / script);
}

// function getTotalRam(nodes: any): number {
//   return nodes.reduce((totalRam: number, n: Server) => totalRam + n.ram.now, 0);
// }

function updateNodes(ns: NS) {
  return ServerInfo.list(ns)
    .map((h: string) => ServerInfo.details(ns, h))
    .filter((n: Server) => n.isNode)
    .sort((a: Server, b: Server) => b.ram.max - a.ram.max);
}

function updateRam(nodes: any): number {}

function updateServers(ns: NS) {
  return ServerInfo.list(ns)
    .map((h: string) => ServerInfo.details(ns, h))
    .filter((s: Server) => s.isTarget)
    .map((s: Server) => new ServerTarget(ns, s.hostname))
    .sort((a: ServerTarget, b: ServerTarget) => a.level - b.level);
  // FIXME:
  // .sort(
  //   (a: ServerTarget, b: ServerTarget) =>
  //     a.getBatch(true, 1).dValue - b.getBatch(true, 1).dValue
  // );
}

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  const start = performance.now();

  // NOTE: ONETIME CODE
  // let dEnd = -1;
  // let dHack = -1;
  // let dWeak = -1;
  // let dGrow = -1;
  // let dWeakAG = -1;
  // let batch: any;
  // let level = -1;
  // const availableRam = -1;

  // const node = ServerInfo.details(ns, 'ps-0');
  const nodes = updateNodes(ns);
  // const sample = new ServerTarget(ns, 'sigma-cosmetics');
  // const sample = new ServerTarget(ns, 'zer0');
  const servers = updateServers(ns);

  // const sample = [servers[0], servers[1], servers[2]];
  const sample = [servers[0], servers[2]];
  const rowStyle =
    '%4s %-18s |%2s|%6s %4s|%5s| %4s | %4s | %4s | %4s |%7s|%7s|%7s| %7s | %6s | %4s | %4s';

  while (true) {
    ns.clearLog();
    const now = performance.now();
    ns.print(`[Time] ${formatTime(ns, now - start)}`);

    ns.printf(
      rowStyle,
      'Lvl',
      'Server',
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
      'Value',
      'Update',
      'DEBUG'
    );

    sample.forEach((s: ServerTarget) => {
      ns.printf(
        rowStyle,
        s.level,
        s.hostname,
        /* eslint-disable */
        s.sanity.action === 'HACK'
          ? '💰'
          : s.sanity.action === 'WEAK'
          ? '🔓'
          : s.sanity.action === 'GROW'
          ? '🌿'
          : '',
        /* eslint-enable */
        ns.formatNumber(s.money.max, 1),
        ns.formatPercent(s.money.now / s.money.max, 0),
        `+${ns.formatNumber(s.sec.now - s.sec.min, 1)}`,
        s.sanity.action === 'HACK' ? s.sanity.tWeak : s.sanity.pWeak,
        s.sanity.action === 'HACK' ? s.sanity.tGrow : s.sanity.pGrow,
        s.sanity.tWeakAG,
        s.sanity.tHack,
        formatTime(ns, s.hackTime), // s.sanity.action === 'HACK' ? formatTime(ns, s.hackTime) : '',
        formatTime(ns, s.weakTime), // s.sanity.action === 'WEAK' ? formatTime(ns, s.weakTime) : '',
        formatTime(ns, s.growTime), // s.sanity.action === 'GROW' ? formatTime(ns, s.growTime) : '',
        ns.formatRam(s.sanity.ram, 1),
        ns.formatNumber(s.sanity.value, 2),
        formatTime(ns, s.lastUpdate - now),
        s.sanity.batches
      );

      if (s.lastUpdate < now) {
        s.setBatches = s.sanity.batches + 1;
        s.update = s.weakTime + 3000;
      }
    });

    await ns.asleep(1000);
  }

  // NOTE: DOES THE LOOP
  // while (true) {
  //   ns.clearLog();

  //   if (ns.getPlayer().skills.hacking > level) {
  //     level = ns.getPlayer().skills.hacking;
  //     nodes = updateNodes(ns);
  //     servers = updateServers(ns);
  //   }

  //   // ns.print(`[Nodes] ${nodes.length} | ${ns.formatRam(availableRam, 2)}`);
  //   ns.print(`[Nodes] ${nodes.length}`);
  //   ns.print('===== DEBUG =====');

  //   const now = performance.now();
  //   ns.print(`[Now] ${now}`);
  //   ns.print(`[End] ${dEnd}`);
  //   if (now > dEnd) {
  //     ns.print(`Refiring`);
  //     // availableRam = getTotalRam(nodes);

  //     servers.forEach((s: ServerTarget) => {
  //       if (s.aAttack) {
  //         batch = s.getBatch(true, 1);
  //         dEnd = batch.dEnd;
  //         dHack = batch.dHack;
  //         dWeak = batch.dWeak;
  //         dGrow = batch.dGrow;
  //         dWeakAG = batch.dWeakAG;
  //         let bufferCount = 1;
  //         let targetBatches = 0;

  //         nodes.forEach((n: Server, i: number) => {
  //           if (targetBatches < singleTargetBatches) {
  //             while (n.ram.now > batch.dRam) {
  //               ns.exec(
  //                 xHack,
  //                 n.hostname,
  //                 batch.tHack,
  //                 s.hostname,
  //                 false,
  //                 dHack + bufferCount * 3000
  //               );
  //               ns.exec(
  //                 xWeak,
  //                 n.hostname,
  //                 batch.tWeak,
  //                 s.hostname,
  //                 false,
  //                 dWeak + bufferCount * 3000
  //               );
  //               ns.exec(
  //                 xGrow,
  //                 n.hostname,
  //                 batch.tGrow,
  //                 s.hostname,
  //                 false,
  //                 dGrow + bufferCount * 3000
  //               );
  //               ns.exec(
  //                 xWeak,
  //                 n.hostname,
  //                 batch.tWeakAG,
  //                 s.hostname,
  //                 false,
  //                 dWeakAG + bufferCount * 3000
  //               );
  //               bufferCount += 1;
  //               targetBatches += 1;
  //             }
  //             dEnd += bufferCount * 3000;
  //           }

  //           // FIXME:
  //           // if (n.ram.now > 0) {
  //           //   ns.tprint(`${n.hostname} Can Partial`);
  //           // }
  //         });
  //       } else if (s.aWeak) {
  //         let rWeak = s.weakThreads;
  //         while (rWeak > 0) {
  //           dEnd = now + 3000 + s.weakTime + 1000;
  //           dWeak = now + 2000;

  //           nodes.forEach((n: Server) => {
  //             const nWeak = nodeThreads(n.ram.now, xWeakRam);
  //             const tWeak = rWeak > nWeak ? nWeak : rWeak;
  //             const deploy = now + 1000;
  //             if (tWeak > 0) {
  //               ns.tprint(`${n.hostname} | ${rWeak} - ${tWeak}`);
  //               rWeak -= tWeak;
  //               ns.exec(xWeak, n.hostname, tWeak, s.hostname, false, deploy);
  //             }
  //           });
  //           break;
  //         }
  //       } else if (s.aGrow) {
  //         let rGrow = s.growThreads(false, 1);
  //         while (rGrow > 0) {
  //           dEnd = now + 3000 + s.growTime + 1000;
  //           dGrow = now + 2000;

  //           nodes.forEach((n: Server) => {
  //             const nGrow = nodeThreads(n.ram.now, xGrowRam);
  //             const tGrow = rGrow > nGrow ? nGrow : rGrow;
  //             const deploy = now + 1000;
  //             if (tGrow > 0) {
  //               ns.tprint(`${n.hostname} | ${rGrow} - ${tGrow}`);
  //               rGrow -= tGrow;
  //               ns.exec(xGrow, n.hostname, tGrow, s.hostname, false, deploy);
  //             }
  //           });
  //           break;
  //         }
  //       }
  //     });
  //   } else {
  //     ns.print(`Waiting: ${formatTime(ns, dEnd - now)}`);
  //     // if (batch) {
  //     //   ns.print(`Hack: ${batch?.tHack} ${formatTime(ns, batch.dHack - now)}`);
  //     //   ns.print(`Weak: ${batch?.tWeak} ${formatTime(ns, batch.dWeak - now)}`);
  //     //   ns.print(`Grow: ${batch?.tGrow} ${formatTime(ns, batch.dGrow - now)}`);
  //     //   ns.print(
  //     //     `Weak: ${batch?.tWeakAG} ${formatTime(ns, batch.dWeakAG - now)}`
  //     //   );
  //     // }
  //   }

  //   await ns.asleep(1000);
  // }
}
