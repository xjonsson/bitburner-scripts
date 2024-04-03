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

  const node = ServerInfo.details(ns, 'ps-0');
  // const sample = new ServerTarget(ns, 'sigma-cosmetics');
  const sample = new ServerTarget(ns, 'nectar-net');

  // NOTE: DOES`THE LOOP
  while (true) {
    ns.clearLog();
    ns.print('===== DEBUG =====');

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

    await ns.asleep(1000);
  }
}
