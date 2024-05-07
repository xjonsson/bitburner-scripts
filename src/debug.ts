/* eslint-disable */
import { NS } from '@ns';
import { TIME, CONFIGS, DEPLOY } from '/os/configs';
import { ServerInfo, Server } from '/os/modules/Server';
import { ControlCache } from '/os/modules/Cache';
import { ControlInfo } from '/os/modules/Control';
import { TServer } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { HACK, WEAK, GROW } = DEPLOY;
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
function updateServers(
  ns: NS,
  cServers: any[],
  cTargets: string[],
  pLevel: number
) {
  let tServers = cServers;
  let tTargets = cTargets;
  let hackTargetsMaxOffset =
    pLevel > 1000 && hackTargetsMax < 15 ? 15 : hackTargetsMax;
  hackTargetsMaxOffset =
    pLevel > 1500 && hackTargetsMax < 20 ? 20 : hackTargetsMax;
  hackTargetsMaxOffset =
    pLevel > 2000 && hackTargetsMax < 25 ? 25 : hackTargetsMax;
  const tRamMax = updateRam(updateNodes(ns)).max;

  if (tTargets.length === 0) {
    // **** Fresh load (use level)
    const hackTargets = ServerInfo.list(ns)
      .map((h: string) => ServerInfo.details(ns, h))
      .filter((s: Server) => s.isTarget && !tTargets.includes(s.hostname))
      .map((s: Server) => new TServer(ns, s.hostname))
      .sort((a: TServer, b: TServer) => a.level - b.level)
      .slice(0, hackTargetsMaxOffset);

    hackTargets.forEach((s: TServer) => {
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
      tServers.push(new TServer(ns, h));
    });
    tServers
      .sort((a: TServer, b: TServer) => a.bValue - b.bValue)
      .slice(0, hackTargetsMaxOffset);
  }

  // **** Calculate Switching
  let batcherCount = 0;
  tServers.forEach((s: TServer) => {
    // ns.tprint(`${s.hostname} | ${s.sanity.batches}`);
    if (s.batches > 0) {
      batcherCount += 1;
    }
  });

  // ns.tprint(`Batchercount: ${batcherCount}`);
  // if (batcherCount > hackTargetsPrepMax || tServers.length < hackTargetsMax) { // FIXME:
  if (batcherCount > hackMinBatches || tServers.length < hackTargetsMaxOffset) {
    let offset = hackTargetsMaxOffset - tServers.length;
    offset = offset < 0 ? 0 : offset;
    // **** Calculate new targets
    const newServers = ServerInfo.list(ns)
      .map((h: string) => ServerInfo.details(ns, h))
      .filter((s: Server) => s.isTarget && !tTargets.includes(s.hostname))
      .map((s: Server) => new TServer(ns, s.hostname))
      .filter((s: TServer) => s.bRam < tRamMax)
      .sort((a: TServer, b: TServer) => a.bValue - b.bValue)
      .slice(-(hackSwap + offset)) // FIXME:
      // .slice(-(hackTargetsPrepMax + offset)) // FIXME:
      .filter((s: TServer) => {
        // const tCheck = tServers[tServers.length - 1];
        const tCheck = tServers[0];
        if (s.bRam < tRamMax && s.bValue > tCheck.bValue) {
          return true;
        }
        return false;
      });

    if (newServers.length > 0) {
      newServers.forEach((s: TServer) => {
        const tCheck = tServers[0];
        tTargets.push(s.hostname);
        tServers.push(s);
        if (tServers.length > hackTargetsMaxOffset) {
          tTargets = tTargets.filter((h: string) => h !== tCheck.hostname);
          tServers = tServers
            .filter((t: TServer) => t.hostname !== tCheck.hostname)
            .sort((a: TServer, b: TServer) => a.bValue - b.bValue);
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

function updateRow(ns: NS, s: TServer, now: number, debug = '') {
  ns.printf(
    rowStyle,
    s.level,
    s.hostname,
    /* eslint-disable */
    s.status.action === 'HACK'
      ? '💰'
      : s.status.action === 'WEAK'
      ? '🔓'
      : s.status.action === 'GROW'
      ? '🌿'
      : s.status.action === 'RISK'
      ? '🎲'
      : '',
    /* eslint-enable */
    ns.formatNumber(s.money.max, 0),
    ns.formatPercent(s.money.now / s.money.max, 0),
    `+${ns.formatNumber(s.sec.now - s.sec.min, 1)}`,
    s.hTh > 0 ? s.hTh : '',
    /* eslint-disable */
    s.status.action === 'HACK'
      ? s.wTh
      : s.status.action === 'WEAK'
      ? s.pwTh
      : '',
    s.status.action === 'HACK'
      ? s.gTh
      : s.status.action === 'GROW'
      ? s.pgTh
      : '',
    /* eslint-enable */
    s.wagTh,
    // formatTime(ns, s.hackTime),
    formatTime(ns, s.wTime),
    // formatTime(ns, s.growTime),
    ns.formatRam(s.bRam, 0),
    ns.formatNumber(s.bValue, 0),
    formatTime(ns, s.updateAt - now),
    s.batches,
    debug
  );
}

// ******** HWGW Functions ******** //
function prepWeak(ns: NS, s: TServer): number {
  const nodes = updateNodes(ns);
  let rWeak = s.pwTh;
  let nSpacer = 1;
  const dStart = performance.now() + hackDelay;
  // ns.tprint(`${s.hostname} Grow (${rWeak})`); // FIXME: REMOVE ME

  if (rWeak > 0) {
    let dEnd = s.wTime + hackBuffer;
    nodes.forEach((n: Server) => {
      // Can we do anything
      const nWeak = nodeThreads(n.ram.now, WEAK.R);
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
        ns.exec(WEAK.X, n.hostname, tWeak, s.hostname, false, dWeak);
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

function prepGrow(ns: NS, s: TServer): number {
  const nodes = updateNodes(ns);
  let rGrow = s.pgTh;
  let nSpacer = 1;
  const dStart = performance.now() + hackDelay;
  // ns.tprint(`${s.hostname} Grow (${rGrow})`); // FIXME: REMOVE ME

  if (rGrow > 0) {
    let dEnd = s.gTime + hackBuffer;
    nodes.forEach((n: Server) => {
      // Can we do anything
      const nGrow = nodeThreads(n.ram.now, GROW.R);
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
        ns.exec(GROW.X, n.hostname, tGrow, s.hostname, false, dGrow);
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

function prepHWGW(ns: NS, s: TServer): number {
  const nodes = updateNodes(ns);
  const nodesRam = updateRam(nodes);
  const { bRam, hTh, wTh, gTh, wagTh } = s;
  s.setBatches = 0;
  let nSpacer = 1;

  // Timings
  const dStart = performance.now() + hackDelay;
  let dEnd = dStart + s.wTime + hackBuffer;
  const dHack = dEnd - hackBuffer * 3 - (s.hTime + hackBuffer);
  const dWeak = dEnd - hackBuffer * 2 - (s.wTime + hackBuffer);
  const dGrow = dEnd - hackBuffer * 1 - (s.gTime + hackBuffer);
  const dWeakAG = dEnd - (s.wTime + hackBuffer);

  // if (
  //   s.sanity.batches < hackBatches &&
  //   tHack > 0 &&
  //   tWeak > 0 &&
  //   tGrow > 0 &&
  //   tWeakAG > 0
  // ) {

  // if (s.sanity.batches < hackBatches) {
  if (s.batches < hackBatches && hTh > 0 && wTh > 0 && gTh > 0 && wagTh > 0) {
    // Note: If we have enough to batch, then batch. otherwise partial
    if (nodesRam.max > bRam) {
      nodes.forEach((n: Server) => {
        if (n.ram.now > bRam) {
          // ns.tprint(`${n.hostname} FULL BATCH`);
          const { hostname: nID } = n;
          const { hostname: sID } = s;
          while (n.ram.now > bRam && s.batches < hackBatches) {
            ns.exec(HACK.X, nID, hTh, sID, false, dHack + nSpacer * hackBuffer);
            ns.exec(WEAK.X, nID, wTh, sID, false, dWeak + nSpacer * hackBuffer);
            ns.exec(GROW.X, nID, gTh, sID, false, dGrow + nSpacer * hackBuffer);
            ns.exec(
              WEAK.X,
              nID,
              wagTh,
              sID,
              false,
              dWeakAG + nSpacer * hackBuffer
            );
            nSpacer += 1;
            s.setBatches = s.batches + 1;
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
      let rHack = hTh;
      if (rHack > 0) {
        dEnd = s.hTime + hackBuffer;
        nodes.forEach((n: Server) => {
          // Can we do anything
          const nHack = nodeThreads(n.ram.now, HACK.R);
          const pHack = rHack > nHack ? nHack : rHack;

          // If we have threads
          if (pHack > 0 && n.ram.now > 0) {
            const dpHack = dStart + nSpacer * hackBuffer;
            dEnd += nSpacer * hackBuffer;
            ns.exec(HACK.X, n.hostname, pHack, s.hostname, false, dpHack);
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
  const xWidth = 1040;
  const xHeight = 430;
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Puppeteer');
  ns.resizeTail(xWidth, xHeight);
  ns.moveTail(wWidth - 200 - xWidth, 0);
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
      servers = updateServers(ns, servers, hackTargets, pLevel);
    }

    // ******** Servers each tick
    servers.forEach((s: TServer) => {
      if (s.updateAt > now) {
        updateRow(ns, s, now, 'WAIT');
      } else {
        s.setUpdate(10 * 1000); // 10s Updates if nothing happening

        if (s.status.action === 'WEAK') {
          updateRow(ns, s, now, 'WEAK');
          s.setUpdate(prepWeak(ns, s));
          // s.update = s.weakTime + hackDelay;
        } else if (s.status.action === 'GROW') {
          updateRow(ns, s, now, 'GROW');
          s.setUpdate(prepGrow(ns, s));
          // s.update = s.growTime + hackDelay;
        } else if (s.status.action === 'HACK') {
          updateRow(ns, s, now, 'BATCH');
          s.setUpdate(prepHWGW(ns, s));
          // s.update = defaultUpdate;
        } else if (s.status.action === 'RISK') {
          updateRow(ns, s, now, 'RISK'); // Under hack chance
          s.setUpdate(10 * 60 * 1000); // Wait to see if chance increases (10min)
        } else {
          updateRow(ns, s, now, 'ERROR'); // ENDING LINE likely network ram (Reduce batch sizes)
          ns.tprint(
            `ERROR: ${s.hostname} A:${s.status.action} | V:${ns.formatNumber(
              s.bValue,
              2
            )} R:${ns.formatNumber(s.bRam, 2)} | tH:${s.hTh} tW:${s.wTh} tG:${
              s.gTh
            } tWAG:${s.wagTh} | pW:${s.pwTh} pG:${s.pgTh} | B:${
              s.batches
            } | Sec:${ns.formatNumber(
              s.sec.now - s.sec.min,
              2
            )} | $:${ns.formatNumber(
              s.money.now / s.money.max,
              2
            )} | HC:${ns.formatNumber(s.hChance, 2)}`
          );
        }
      }
    });

    await ns.sleep(1000);
  }
}
