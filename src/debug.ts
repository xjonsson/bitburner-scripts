/* eslint-disable */
import { NS } from '@ns';
import { TIME, CONFIGS, DEPLOY } from '/os/configs';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ServerInfo, Server } from '/os/modules/Server';
import ServerTarget from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { xHack, xWeak, xGrow } = DEPLOY;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;
const { hackBuffer, hackDelay, hackBatches, hackTargetsMax } = CONFIGS.hacking;
const defaultUpdate = TIME.SERVERS;

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
      // NOTE: Keep this line (Skip if it exists)
    } else {
      // ns.tprint(`We need to add ${sNew.hostname}`);
      oldServers.push(new ServerTarget(ns, sNew.hostname));
    }
  });

  oldServers.sort(
    // (a: ServerTarget, b: ServerTarget) => a.level - b.level
    (a: ServerTarget, b: ServerTarget) => b.sanity.value - a.sanity.value
  );

  while (oldServers.length > hackTargetsMax) {
    oldServers.pop();
  }

  return oldServers;

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
    ns.formatRam(s.sanity.tRam, 1),
    ns.formatNumber(s.sanity.value, 1),
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
        const dWeak = dStart + nSpacer * hackBuffer;
        dEnd += nSpacer * hackBuffer;
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
        const dGrow = dStart + nSpacer * hackBuffer;
        dEnd += nSpacer * hackBuffer;
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

  if (
    s.sanity.batches < hackBatches &&
    tHack > 0 &&
    tWeak > 0 &&
    tGrow > 0 &&
    tWeakAG > 0
  ) {
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
      }
    });

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
  const networkRam = -1; // FIXME:
  let servers: any = updateServers(ns, []);

  while (true) {
    ns.clearLog();
    const now = performance.now();
    updateHeaders(ns, now, start, networkRam);

    // ******** Update Nodes & Servers on change
    const pLevel = ns.getPlayer().skills.hacking;
    if (pLevel > cLevel) {
      cLevel = pLevel;
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
          s.update = prepWeak(ns, s);
          // s.update = s.weakTime + hackDelay;
        } else if (s.sanity.action === 'GROW') {
          updateRow(ns, s, now, 'GROW PREP');
          s.update = prepGrow(ns, s);
          // s.update = s.growTime + hackDelay;
        } else if (s.sanity.action === 'HACK') {
          updateRow(ns, s, now, 'BATCH');
          s.update = prepHWGW(ns, s);
          // s.update = defaultUpdate;
        } else {
          updateRow(ns, s, now, 'ERROR'); // ENDING LINE
        }
      }
    });

    await ns.asleep(1000);
  }
}
