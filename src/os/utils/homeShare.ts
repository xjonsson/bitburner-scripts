/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { ServerInfo, Server } from '/os/modules/Server';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { ramReserve } = CONFIGS;
const { shareRamRatio } = CONFIGS.ramRatio;
const { SHARE } = DEPLOY;

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

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();
  const start = performance.now();
  let recheck = -1;
  let tShare = 0;

  const nodes = updateNodes(ns);

  while (true) {
    ns.clearLog();
    const now = performance.now();
    const sharePower = ns.getSharePower();
    const nHome = ns.getServer('home');
    const nodesRam = updateRam(nodes);

    ns.print(
      `⏲️ ${formatTime(ns, now - start)} | 🔋 ${ns.formatNumber(
        sharePower,
        2
      )} | (${ns.formatRam(nodesRam, 2)}) ${
        shareRamRatio * 100
      }% | 🧵 ${ns.formatNumber(tShare, 3)}`
    );
    // await ns.share();

    // Future for each
    // NOTE: HOME Share special
    // const nHomeRam = nHome.maxRam - nHome.ramUsed - ramReserve;
    // const hShare = nodeThreads(nHomeRam, xShareRam);
    // if (hShare > 0 && nHomeRam > xShareRam) {
    //   ns.exec(xShare, 'home', hShare, false);
    //   ns.print(`Home ${nHomeRam} (${hShare})`);
    // }

    if (recheck < now) {
      tShare = 0;
      ns.print('Recheck');
      // eslint-disable-next-line no-loop-func
      nodes.forEach((n: Server) => {
        const nRam = n.ram.now * shareRamRatio;
        const nShare = nodeThreads(nRam, SHARE.R);
        if (nShare > 0 && n.ram.now > SHARE.R) {
          ns.exec(SHARE.X, n.hostname, nShare, false);
          // ns.print(`${n.hostname} (${nShare})`);
          tShare += nShare;
        }
      });
      recheck = performance.now() + 11 * 1000;
    } else {
      ns.print(`Wait ${formatTime(ns, recheck - now)}`);
    }

    await ns.asleep(1 * 1000);
  }
}
