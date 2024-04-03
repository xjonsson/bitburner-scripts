/* eslint-disable */
import { NS } from '@ns';
import { DEPLOY } from '/os/configs';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ServerInfo, Server } from '/os/modules/Server';
import ServerTarget from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { xHack, xWeak, xGrow } = DEPLOY;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;

// ******** Utility
function nodeThreads(ram: number, script = 1.6): number {
  return Math.floor(ram / script);
}

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  // NOTE: ONETIME CODE
  let dEnd = -1;
  let dHack = -1;
  let dWeak = -1;
  let dGrow = -1;
  let dWeakAG = -1;
  let batch;

  // NOTE: DOES`THE LOOP
  while (true) {
    ns.clearLog();
    // const player = PlayerCache.read(ns, 'player');

    // const servers = ServerInfo.list(ns)
    //   .filter((h: string) => h !== 'home')
    //   .map((h: string) => ServerInfo.details(ns, h)); // NOTE: USEME

    // const hosting = servers.filter((s: Server) => s.isServer);
    // const nodes = servers.filter((s: Server) => s.isNode); // NOTE: USEME
    // const cash = servers.filter((s: Server) => s.isCash);
    // const targets = servers.filter((s: Server) => s.isTarget);
    // const ram = nodes.reduce(
    //   (totalRam: number, s: Server) => totalRam + s.ram.now,
    //   0
    // );

    // ns.print('===== DEBUG =====');
    // ns.print(`Servers: ${servers.length} (- Home)`);
    // ns.print(`Nodes: ${nodes.length} | Hosting: ${hosting.length}`);
    // ns.print(`Ram Now: ${ns.formatRam(ram)} (${ram})`);
    // ns.print(`Cash: ${cash.length} | Targets: ${targets.length}`);
    ns.print('===== DEBUG =====');
    // const sample = new ServerTarget(ns, 'n00dles');
    const node = ServerInfo.details(ns, 'ps-0');
    // Servers
    const sample = new ServerTarget(ns, 'sigma-cosmetics');
    // const sampleBatch = sample.getBatch(true, 1);
    const now = performance.now();
    ns.print(`[Now] ${now}`);
    ns.print(`[End] ${dEnd}`);
    if (now > dEnd) {
      ns.print(`Refiring`);
      if (sample.aAttack) {
        batch = sample.getBatch(true, 1);
        ({ dEnd, dHack, dWeak, dGrow, dWeakAG } = batch);
        ns.exec(
          xHack,
          node.hostname,
          batch.tHack,
          sample.hostname,
          false,
          dHack
        );
        ns.exec(
          xWeak,
          node.hostname,
          batch.tWeak,
          sample.hostname,
          false,
          dWeak
        );
        ns.exec(
          xGrow,
          node.hostname,
          batch.tGrow,
          sample.hostname,
          false,
          dGrow
        );
        ns.exec(
          xWeak,
          node.hostname,
          batch.tWeakAG,
          sample.hostname,
          false,
          dWeakAG
        );
      } else if (sample.aWeak) {
        const rWeak = sample.weakThreads;
        const nWeak = nodeThreads(node.ram.now, xWeakRam);
        const tWeak = rWeak > nWeak ? nWeak : rWeak;
        dEnd = now + 3000 + sample.weakTime + 1000;
        dWeak = dEnd - 1000 - (sample.weakTime + 1000);
        ns.exec(xWeak, node.hostname, tWeak, sample.hostname, false, dWeak);
      } else if (sample.aGrow) {
        const rGrow = sample.growThreads(false, 1);
        const nGrow = nodeThreads(node.ram.now, xGrowRam);
        const tGrow = rGrow > nGrow ? nGrow : rGrow;
        dEnd = now + 3000 + sample.growTime + 1000;
        dGrow = dEnd - 1000 - (sample.growTime + 1000);
        ns.exec(xGrow, node.hostname, tGrow, sample.hostname, false, dGrow);
      }
    } else {
      ns.print(`Waiting: ${formatTime(ns, dEnd - now)}`);
      if (batch) {
        ns.print(`Hack: ${batch?.tHack} ${formatTime(ns, batch.dHack - now)}`);
        ns.print(`Weak: ${batch?.tWeak} ${formatTime(ns, batch.dWeak - now)}`);
        ns.print(`Grow: ${batch?.tGrow} ${formatTime(ns, batch.dGrow - now)}`);
        ns.print(
          `Weak: ${batch?.tWeakAG} ${formatTime(ns, batch.dWeakAG - now)}`
        );
      }
    }
    // if (dEnd < sampleBatch.dEnd) {
    //   dEnd = sampleBatch.dEnd;
    //   ns.print(`Refiring`);
    // } else {
    //   ns.print(`Waiting for landing`);
    // }
    // ns.print(sampleBatch);
    // ns.print(`Hack: ${sampleBatch.tHack} | `)

    await ns.asleep(1000);
  }
}
