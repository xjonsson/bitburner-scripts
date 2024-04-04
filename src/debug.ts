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
const { hackBuffer, hackDelay, hackBatches } = CONFIGS.hacking;

// ******** Styling
const rowStyle =
  '%4s %-18s |%2s|%6s %4s|%5s| %4s | %4s | %4s | %4s |%7s|%7s|%7s| %7s | %6s | %10s | %4s | %8s';

// ******** Utility
function nodeThreads(ram: number, script = 1.6): number {
  return Math.floor(ram / script);
}

// ******** Nodes (Bots & Servers)
function updateNodes(ns: NS) {
  return ServerInfo.list(ns)
    .map((h: string) => ServerInfo.details(ns, h))
    .filter((n: Server) => n.isNode)
    .sort((a: Server, b: Server) => b.ram.max - a.ram.max);
}

function updateRam(nodes: Server[]): number {
  return nodes.reduce(
    // eslint-disable-next-line no-param-reassign
    (totalRam: number, node: Server) => (totalRam += node.ram.now),
    0
  );
}

// ******** Server Targets
function updateServers(ns: NS, oldServers: ServerTarget[]) {
  ns.tprint(oldServers.length);

  if (oldServers.length === 0) {
    // Fresh load
    return ServerInfo.list(ns)
      .map((h: string) => ServerInfo.details(ns, h))
      .filter((s: Server) => s.isTarget)
      .map((s: Server) => new ServerTarget(ns, s.hostname))
      .sort((a: ServerTarget, b: ServerTarget) => a.level - b.level);
  }

  const newServers = ServerInfo.list(ns)
    .map((h: string) => ServerInfo.details(ns, h))
    .filter((s: Server) => s.isTarget);

  newServers.forEach((sNew: Server) => {
    if (
      oldServers.some((stOld: ServerTarget) => stOld.hostname === sNew.hostname)
    ) {
      // Skip if it exists
    } else {
      ns.tprint(`We need to add ${sNew.hostname}`);
      oldServers.push(new ServerTarget(ns, sNew.hostname));
    }
  });

  return oldServers.sort(
    (a: ServerTarget, b: ServerTarget) => a.level - b.level
  );

  // FIXME:
  //     .sort(
  //       (a: ServerTarget, b: ServerTarget) =>
  //         b.getBatch(true, 1).dValue - a.getBatch(true, 1).dValue
  //     )
  // );
}

// ******** Styling and Display
function updateHeaders(ns: NS, now: number, start: number, networkRam: number) {
  // ******** Time and Ram
  ns.print(
    `[Time] ${formatTime(ns, now - start)} | ${ns.formatRam(networkRam, 2)}`
  );
  // ******** Headers
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
    'HWGW',
    'DEBUG'
  );
}

function updateRow(ns: NS, s: ServerTarget, now: number, debug = '') {
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
    /* eslint-disable */
    s.sanity.action === 'HACK'
      ? s.sanity.tWeak
      : s.sanity.action === 'WEAK'
      ? s.sanity.pWeak
      : '',
    s.sanity.action === 'HACK'
      ? s.sanity.tGrow
      : s.sanity.action === 'GROW'
      ? s.sanity.pGrow
      : '',
    /* eslint-enable */
    s.sanity.tWeakAG,
    s.sanity.tHack > 0 ? s.sanity.tHack : '',
    formatTime(ns, s.hackTime), // s.sanity.action === 'HACK' ? formatTime(ns, s.hackTime) : '',
    formatTime(ns, s.weakTime), // s.sanity.action === 'WEAK' ? formatTime(ns, s.weakTime) : '',
    formatTime(ns, s.growTime), // s.sanity.action === 'GROW' ? formatTime(ns, s.growTime) : '',
    ns.formatRam(s.sanity.ram, 1),
    ns.formatNumber(s.sanity.value, 1),
    formatTime(ns, s.lastUpdate - now),
    s.sanity.batches,
    debug
  );
}

// ******** HWGW Functions ******** //
function prepGrow(ns: NS, s: ServerTarget): number {
  const nodes = updateNodes(ns);
  let rGrow = s.sanity.pGrow;
  let nSpacer = 1;
  const dStart = performance.now() + hackBuffer;
  let dEnd = dStart;
  ns.tprint(`${s.hostname} Grow (${rGrow})`); // FIXME: REMOVE ME

  if (rGrow > 0) {
    nodes.forEach((n: Server) => {
      // Can we do anything
      const nGrow = nodeThreads(n.ram.now, xGrowRam);
      const tGrow = rGrow > nGrow ? nGrow : rGrow;

      // If we have threads
      if (tGrow > 0) {
        const dGrow = dStart;
        dEnd = s.growTime + nSpacer * hackDelay;
        ns.exec(xGrow, n.hostname, tGrow, s.hostname, false, dGrow);
        rGrow -= tGrow;
        nSpacer += 1;

        // This loop will cover this
        if (rGrow < 0) {
          return dEnd;
        }
      }
    });
    // Return the end
    return dEnd;
  }
  // Return delay
  return dEnd + hackDelay;
}

function prepWeak(ns: NS, s: ServerTarget): number {
  const nodes = updateNodes(ns);
  let rWeak = s.sanity.pWeak;
  let nSpacer = 1;
  const dStart = performance.now() + hackBuffer;
  let dEnd = dStart;
  ns.tprint(`${s.hostname} Grow (${rWeak})`); // FIXME: REMOVE ME

  if (rWeak > 0) {
    nodes.forEach((n: Server) => {
      // Can we do anything
      const nWeak = nodeThreads(n.ram.now, xWeakRam);
      const tWeak = rWeak > nWeak ? nWeak : rWeak;

      // If we have threads
      if (tWeak > 0) {
        const dWeak = dStart;
        dEnd = s.weakTime + nSpacer * hackDelay;
        ns.exec(xWeak, n.hostname, tWeak, s.hostname, false, dWeak);
        rWeak -= tWeak;
        nSpacer += 1;

        // This loop will cover this
        if (rWeak < 0) {
          return dEnd;
        }
      }
    });
    // Return the end
    return dEnd;
  }
  // Return delay
  return dEnd + hackDelay;
}

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  const start = performance.now();

  // NOTE: ONETIME CODE
  let cLevel = -1;
  // let nodes: any = [];
  const networkRam = -1; // FIXME:
  let servers: any = updateServers(ns, []);
  // let dEnd = -1;
  // let dHack = -1;
  // let dWeak = -1;
  // let dGrow = -1;
  // let dWeakAG = -1;
  // let batch: any;
  // const availableRam = -1;

  // const node = ServerInfo.details(ns, 'ps-0');
  // const sample = new ServerTarget(ns, 'sigma-cosmetics');
  // const sample = [servers[0], servers[1], servers[2]];

  while (true) {
    ns.clearLog();
    const now = performance.now();
    updateHeaders(ns, now, start, networkRam);

    // ******** Update Nodes & Servers on change
    const pLevel = ns.getPlayer().skills.hacking;
    if (pLevel > cLevel) {
      cLevel = pLevel;
      // nodes = updateNodes(ns); // FIXME:
      // networkRam = updateRam(nodes); // FIXME:
      servers = updateServers(ns, servers);
    }

    // ******** Servers each tick
    servers.forEach((s: ServerTarget) => {
      if (s.lastUpdate > now) {
        updateRow(ns, s, now, 'Waiting');
      } else {
        s.update = 10 * 1000; // 10s Updates if nothing happening

        if (s.sanity.action === 'WEAK') {
          updateRow(ns, s, now, 'WEAK PREP');
          s.update = prepWeak(ns, s); // FIXME:
          // s.update = s.weakTime + hackDelay;
        } else if (s.sanity.action === 'GROW') {
          updateRow(ns, s, now, 'GROW PREP');
          s.update = prepGrow(ns, s); // FIXME:
          // s.update = s.growTime + hackDelay;
        } else if (
          s.sanity.action === 'HACK' &&
          s.sanity.batches < hackBatches
        ) {
          updateRow(ns, s, now, 'BATCH');
          s.update = s.weakTime + hackDelay;
        } else {
          updateRow(ns, s, now, 'NaN Update'); // ENDING LINE
        }
      }
    });

    await ns.asleep(1000);
  }

  // NOTE: DOES THE LOOP
  // while (true) {

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
