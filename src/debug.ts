/* eslint-disable */
import { NS } from '@ns';
import { TIME, CONFIGS, DEPLOY } from '/os/configs';
import { ServerInfo, Server } from '/os/modules/Server';
import { ControlCache } from '/os/modules/Cache';
import { ControlInfo } from '/os/modules/Control';
import ServerTarget from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { xHack, xWeak, xGrow } = DEPLOY;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;
const {
  hackBuffer,
  hackDelay,
  hackBatches,
  hackTargetsMax,
  // hackTargetsPrepMax, // FIXME:
  hackMinBatches,
  hackSwap,
} = CONFIGS.hacking;
const defaultUpdate = TIME.SERVERS;

// ******** Styling
// const rowStyle =
//   '%4s %-18s |%2s|%6s %4s|%5s| %4s | %4s | %4s | %4s |%7s|%7s|%7s| %7s | %6s | %10s | %4s | %8s';
const rowStyle =
  '%4s %-18s %2s %4s %4s|%5s| %4s %4s %4s %4s|%7s| %5s | %4s %9s %4s %5s';

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

function updateRam(nodes: Server[]): any {
  let max = 0;
  const total = nodes.reduce((totalRam: number, node: Server) => {
    if (node.ram.max > max) max = node.ram.max;
    // eslint-disable-next-line no-param-reassign
    return (totalRam += node.ram.now);
  }, 0);
  return { max, total };
}

// ******** Server Targets
function updateServers(ns: NS, cServers: any[], cTargets: string[]) {
  let tServers = cServers;
  let tTargets = cTargets;
  const tRamMax = updateRam(updateNodes(ns)).max;

  if (tTargets.length === 0) {
    // **** Fresh load (use level)
    const hackTargets = ServerInfo.list(ns)
      .map((h: string) => ServerInfo.details(ns, h))
      .filter((s: Server) => s.isTarget && !tTargets.includes(s.hostname))
      .map((s: Server) => new ServerTarget(ns, s.hostname))
      .sort(
        (a: ServerTarget, b: ServerTarget) => a.level - b.level
        // Sort so n00dles is first on first run
        // (a: ServerTarget, b: ServerTarget) => a.sanity.value - b.sanity.value
      )
      .slice(0, hackTargetsMax);

    hackTargets.forEach((s: ServerTarget) => {
      tTargets.push(s.hostname);
    });

    ns.tprint(tTargets);
    const iPast = ControlCache.read(ns, 'control');
    iPast.hackTargets = tTargets;
    const iControl = ControlInfo.details(ns, iPast);
    ControlCache.update(ns, iControl);
    return hackTargets;
  }

  // **** Reconnecting to targets
  if (tServers.length === 0) {
    tTargets.forEach((h: string) => {
      tServers.push(new ServerTarget(ns, h));
    });
    tServers
      .sort(
        (a: ServerTarget, b: ServerTarget) => a.sanity.value - b.sanity.value
      )
      .slice(0, hackTargetsMax);
  }

  // **** Calculate Switching
  let batcherCount = 0;
  tServers.forEach((s: ServerTarget) => {
    // ns.tprint(`${s.hostname} | ${s.sanity.batches}`);
    if (s.sanity.batches > 0) {
      batcherCount += 1;
    }
  });

  // ns.tprint(`Batchercount: ${batcherCount}`);
  // if (batcherCount > hackTargetsPrepMax || tServers.length < hackTargetsMax) { // FIXME:
  if (batcherCount > hackMinBatches || tServers.length < hackTargetsMax) {
    let offset = hackTargetsMax - tServers.length;
    offset = offset < 0 ? 0 : offset;
    // **** Calculate new targets
    const newServers = ServerInfo.list(ns)
      .map((h: string) => ServerInfo.details(ns, h))
      .filter((s: Server) => s.isTarget && !tTargets.includes(s.hostname))
      .map((s: Server) => new ServerTarget(ns, s.hostname))
      .filter((s: ServerTarget) => s.sanity.tRam < tRamMax)
      .sort(
        (a: ServerTarget, b: ServerTarget) => a.sanity.value - b.sanity.value
      )
      .slice(-(hackSwap + offset)) // FIXME:
      // .slice(-(hackTargetsPrepMax + offset)) // FIXME:
      .filter((s: ServerTarget) => {
        // const tCheck = tServers[tServers.length - 1];
        const tCheck = tServers[0];
        if (s.sanity.tRam < tRamMax && s.sanity.value > tCheck.sanity.value) {
          return true;
        }
        return false;
      });

    if (newServers.length > 0) {
      newServers.forEach((s: ServerTarget) => {
        const tCheck = tServers[0];
        tTargets.push(s.hostname);
        tServers.push(s);
        if (tServers.length > hackTargetsMax) {
          tTargets = tTargets.filter((h: string) => h !== tCheck.hostname);
          tServers = tServers
            .filter((t: ServerTarget) => t.hostname !== tCheck.hostname)
            .sort(
              (a: ServerTarget, b: ServerTarget) =>
                a.sanity.value - b.sanity.value
            );
        }
        // tTargets.shift();
        // tServers.shift();
      });
    }
  }

  // **** Update targets
  const past = ControlCache.read(ns, 'control');
  past.hackTargets = tTargets;
  const control = ControlInfo.details(ns, past);
  ControlCache.update(ns, control);

  // **** Resort and return
  // ns.tprint(tTargets);
  return tServers;
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
    'Cash',
    '%',
    '+Sec',
    'Hack',
    'Weak',
    'Grow',
    'Meak',
    // 'Hack',
    'Time', // 'Weak',
    // 'Grow',
    'Batch',
    'VPRS',
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
      : s.sanity.action === 'RISK'
      ? '🎲'
      : '',
    /* eslint-enable */
    ns.formatNumber(s.money.max, 0),
    ns.formatPercent(s.money.now / s.money.max, 0),
    `+${ns.formatNumber(s.sec.now - s.sec.min, 1)}`,
    s.sanity.tHack > 0 ? s.sanity.tHack : '',
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
    // formatTime(ns, s.hackTime),
    formatTime(ns, s.weakTime),
    // formatTime(ns, s.growTime),
    ns.formatRam(s.sanity.tRam, 0),
    ns.formatNumber(s.sanity.value, 0),
    formatTime(ns, s.lastUpdate - now),
    s.sanity.batches,
    debug
  );
}

// ******** HWGW Functions ******** //
function prepWeak(ns: NS, s: ServerTarget): number {
  const nodes = updateNodes(ns);
  let rWeak = s.sanity.pWeak;
  let nSpacer = 1;
  const dStart = performance.now() + hackDelay;
  // ns.tprint(`${s.hostname} Grow (${rWeak})`); // FIXME: REMOVE ME

  if (rWeak > 0) {
    let dEnd = s.weakTime + hackBuffer;
    nodes.forEach((n: Server) => {
      // Can we do anything
      const nWeak = nodeThreads(n.ram.now, xWeakRam);
      const tWeak = rWeak > nWeak ? nWeak : rWeak;

      // If we have threads
      if (tWeak > 0 && n.ram.now > 0) {
        // const dWeak = dStart + nSpacer * hackBuffer;
        // dEnd += nSpacer * hackBuffer;
        // ns.exec(xWeak, n.hostname, tWeak, s.hostname, false, dWeak);
        // rWeak -= tWeak;
        // nSpacer += 1;
        const dWeak = dStart + hackBuffer; // Remove spacer timing
        dEnd += hackBuffer; // Removing spacer timing
        ns.exec(xWeak, n.hostname, tWeak, s.hostname, false, dWeak);
        rWeak -= tWeak;
        nSpacer += 1;

        // This loop will cover this
        if (rWeak < 0) {
          return dEnd + hackDelay;
        }
      }
    });
    // Return the end
    return dEnd + hackDelay;
  }
  // Return delay
  return defaultUpdate; // hackDelay;
}

function prepGrow(ns: NS, s: ServerTarget): number {
  const nodes = updateNodes(ns);
  let rGrow = s.sanity.pGrow;
  let nSpacer = 1;
  const dStart = performance.now() + hackDelay;
  // ns.tprint(`${s.hostname} Grow (${rGrow})`); // FIXME: REMOVE ME

  if (rGrow > 0) {
    let dEnd = s.growTime + hackBuffer;
    nodes.forEach((n: Server) => {
      // Can we do anything
      const nGrow = nodeThreads(n.ram.now, xGrowRam);
      const tGrow = rGrow > nGrow ? nGrow : rGrow;

      // If we have threads
      if (tGrow > 0 && n.ram.now > 0) {
        // const dGrow = dStart + nSpacer * hackBuffer;
        // dEnd += nSpacer * hackBuffer;
        // ns.exec(xGrow, n.hostname, tGrow, s.hostname, false, dGrow);
        // rGrow -= tGrow;
        // nSpacer += 1;
        const dGrow = dStart + hackBuffer; // Remove spacer timing
        dEnd += hackBuffer; // Remove spacer timing
        ns.exec(xGrow, n.hostname, tGrow, s.hostname, false, dGrow);
        rGrow -= tGrow;
        nSpacer += 1;

        // This loop will cover this
        if (rGrow < 0) {
          return dEnd + hackDelay;
        }
      }
    });
    // Return the end
    return dEnd + hackDelay;
  }
  // Return delay
  return defaultUpdate; // hackDelay;
}

function prepHWGW(ns: NS, s: ServerTarget): number {
  const nodes = updateNodes(ns);
  const nodesRam = updateRam(nodes);
  const { tRam, tHack, tWeak, tGrow, tWeakAG } = s.sanity;
  s.setBatches = 0;
  let nSpacer = 1;

  // Timings
  const dStart = performance.now() + hackDelay;
  let dEnd = dStart + s.weakTime + hackBuffer;
  const dHack = dEnd - hackBuffer * 3 - (s.hackTime + hackBuffer);
  const dWeak = dEnd - hackBuffer * 2 - (s.weakTime + hackBuffer);
  const dGrow = dEnd - hackBuffer * 1 - (s.growTime + hackBuffer);
  const dWeakAG = dEnd - (s.weakTime + hackBuffer);

  // if (
  //   s.sanity.batches < hackBatches &&
  //   tHack > 0 &&
  //   tWeak > 0 &&
  //   tGrow > 0 &&
  //   tWeakAG > 0
  // ) {

  // if (s.sanity.batches < hackBatches) {
  if (
    s.sanity.batches < hackBatches &&
    tHack > 0 &&
    tWeak > 0 &&
    tGrow > 0 &&
    tWeakAG > 0
  ) {
    // Note: If we have enough to batch, then batch. otherwise partial
    if (nodesRam.max > tRam) {
      nodes.forEach((n: Server) => {
        if (n.ram.now > tRam) {
          // ns.tprint(`${n.hostname} FULL BATCH`);
          while (n.ram.now > tRam && s.sanity.batches < hackBatches) {
            ns.exec(
              xHack,
              n.hostname,
              tHack,
              s.hostname,
              false,
              dHack + nSpacer * hackBuffer
            );
            ns.exec(
              xWeak,
              n.hostname,
              tWeak,
              s.hostname,
              false,
              dWeak + nSpacer * hackBuffer
            );
            ns.exec(
              xGrow,
              n.hostname,
              tGrow,
              s.hostname,
              false,
              dGrow + nSpacer * hackBuffer
            );
            ns.exec(
              xWeak,
              n.hostname,
              tWeakAG,
              s.hostname,
              false,
              dWeakAG + nSpacer * hackBuffer
            );
            nSpacer += 1;
            s.setBatches = s.sanity.batches + 1;
          }
          // dEnd += nSpacer * hackBuffer;
        } else {
          // ns.tprint(`${n.hostname} PARTIAL`);
          // FIXME: THIS NEEDS TO BE COMPLETED
        }
      });
    } else {
      // No single node can batch
      // ns.tprint('Cant HWGW, basic hack');
      let rHack = tHack;
      if (rHack > 0) {
        dEnd = s.hackTime + hackBuffer;
        nodes.forEach((n: Server) => {
          // Can we do anything
          const nHack = nodeThreads(n.ram.now, xHackRam);
          const pHack = rHack > nHack ? nHack : rHack;

          // If we have threads
          if (pHack > 0 && n.ram.now > 0) {
            const dpHack = dStart + nSpacer * hackBuffer;
            dEnd += nSpacer * hackBuffer;
            ns.exec(xHack, n.hostname, pHack, s.hostname, false, dpHack);
            rHack -= pHack;
            nSpacer += 1;

            // This loop will cover this
            if (rHack < 0) {
              return dEnd + hackDelay;
            }
          }
        });
        // Return the end
        return dEnd + hackDelay;
      }
    }

    dEnd -= dStart;

    return dEnd + nSpacer * hackBuffer + hackDelay;
  }
  return defaultUpdate; // hackDelay;
}

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  const start = performance.now();

  // NOTE: ONETIME CODE
  let cLevel = -1;
  let networkRam = -1; // FIXME:
  let servers: any = [];

  while (true) {
    ns.clearLog();
    const now = performance.now();
    const control = ControlCache.read(ns, 'control');
    const { hackTargets } = control;
    // const pLevel = control.level; // FIXME:
    updateHeaders(ns, now, start, networkRam);

    // ******** Update Nodes & Servers on change
    const pLevel = ns.getPlayer().skills.hacking; // FIXME:
    if (pLevel > cLevel) {
      cLevel = pLevel;
      networkRam = updateRam(updateNodes(ns)).total;
      servers = updateServers(ns, servers, hackTargets);
    }

    // ******** Servers each tick
    servers.forEach((s: ServerTarget) => {
      if (s.lastUpdate > now) {
        updateRow(ns, s, now, 'WAIT');
      } else {
        s.update = 10 * 1000; // 10s Updates if nothing happening

        if (s.sanity.action === 'WEAK') {
          updateRow(ns, s, now, 'WEAK');
          s.update = prepWeak(ns, s);
          // s.update = s.weakTime + hackDelay;
        } else if (s.sanity.action === 'GROW') {
          updateRow(ns, s, now, 'GROW');
          s.update = prepGrow(ns, s);
          // s.update = s.growTime + hackDelay;
        } else if (s.sanity.action === 'HACK') {
          updateRow(ns, s, now, 'BATCH');
          s.update = prepHWGW(ns, s);
          // s.update = defaultUpdate;
        } else if (s.sanity.action === 'RISK') {
          updateRow(ns, s, now, 'RISK'); // Under hack chance
          s.update = 10 * 60 * 1000; // Wait to see if chance increases (10min)
        } else {
          updateRow(ns, s, now, 'ERROR'); // ENDING LINE likely network ram (Reduce batch sizes)
          ns.tprint(
            `ERROR: ${s.hostname} A:${s.sanity.action} | V:${ns.formatNumber(
              s.sanity.value,
              2
            )} R:${ns.formatNumber(s.sanity.tRam, 2)} | tH:${
              s.sanity.tHack
            } tW:${s.sanity.tWeak} tG:${s.sanity.tGrow} tWAG:${
              s.sanity.tWeakAG
            } | pW:${s.sanity.pWeak} pG:${s.sanity.pGrow} | B:${
              s.sanity.batches
            } | Sec:${ns.formatNumber(
              s.sec.now - s.sec.min,
              2
            )} | $:${ns.formatNumber(
              s.money.now / s.money.max,
              2
            )} | HC:${ns.formatNumber(s.hackChance, 2)}`
          );
        }
      }
    });

    await ns.asleep(1000);
  }
}
