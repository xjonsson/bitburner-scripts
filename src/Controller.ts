/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
import Display from './zDisplay.js';
import Server from './zServer.js';
import Shop from './zShop.js';
import Monitor from './monitor.js';
import { numCycleForGrowthCorrected } from './zCalc.js';
/* eslint-enable */

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 500],
    ['help', false],
  ]);

  if (flags.help) {
    ns.tprint('This script helps monitor and control all operations');
    ns.tprint(`Usage: run ${ns.getScriptName()} --refreshrate 5000`);
    return;
  }

  const p = new Player(ns);
  const xnet = new Network(ns);
  const xmon = new Display(ns, p, xnet);
  const xshop = new Shop(ns, p, xnet);
  const xcode = 'xmin.js';
  const controller = {
    cHacking: 0,
    cMoney: 0,
    cShopping: true,
    cShopPrograms: true,
    cShopHacknet: true,
    cShopServers: true,
    displayChallenge: true,
    displayHacknet: true,
    displayServers: true,
    scriptRAM: ns.getScriptRam(xcode),
    deploy: '',
  };

  ns.tail();
  ns.clearLog();
  ns.disableLog('ALL');

  function updateStats() {
    if (controller.displayChallenge) {
      xmon.displayStats();
      if (p.challenge === 5 && p.reserve === 0) {
        controller.displayChallenge = false;
      }
    } else {
      xmon.displayStats(true);
    }

    if (p.hacking > controller.cHacking) {
      // Updating hacking functions
      ns.print('We would do some hacking here');
      controller.cHacking = p.hacking;
    }

    if (controller.cShopping) {
      if (controller.cShopPrograms) {
        xmon.displayShopPrograms();
        if (p.challenge >= 5) {
          controller.cShopPrograms = false;
        }
      }

      xshop.updateShopping();
      xshop.buyNext();

      if (controller.cShopHacknet) {
        xmon.displayShopHacknet();
        if (xnet.hacknetDone >= xnet.nodesTargetCount) {
          controller.cShopHacknet = false;
        }
      }

      if (controller.cShopServers) {
        xmon.displayShopServers();
        if (xnet.serverDone >= xnet.serversTargetCount) {
          controller.cShopServers = false;
        }
      }

      if (
        !controller.cShopPrograms &&
        !controller.cShopHacknet &&
        !controller.cShopServers
      ) {
        controller.cShopping = false;
      }
    }

    // if (hacking > stats.hacking) {
    //   stats.hacking = hacking;
    //   xnet.updateRing();
    //   xnet.updateServers();
    // }

    // msg = `BitNode ${mBitNode}    Ports  ${controller.challenge}  Hacking ${mHacking}  Money $${mMoney}`;
    // return msg;
  }

  function reclaimBot(node: any) {
    if (node.numOpenPortsRequired >= 5) {
      ns.sqlinject(node.hostname);
    }
    if (node.numOpenPortsRequired >= 4) {
      ns.httpworm(node.hostname);
    }
    if (node.numOpenPortsRequired >= 3) {
      ns.relaysmtp(node.hostname);
    }
    if (node.numOpenPortsRequired >= 2) {
      ns.ftpcrack(node.hostname);
    }
    if (node.numOpenPortsRequired >= 1) {
      ns.brutessh(node.hostname);
    }
    if (node.numOpenPortsRequired >= 0) {
      ns.nuke(node.hostname);
    }
  }

  // FIXME: Later
  function deployBot(target: any) {
    if (controller.deploy !== target.hostname) {
      xnet.bots.forEach((node: any) => {
        ns.scp(xcode, node.hostname, 'home');
        ns.kill(xcode, node.hostname, target.hostname);
        const maxThreads = Math.floor(node.ram.max / controller.scriptRAM);
        ns.exec(xcode, node.hostname, maxThreads, target.hostname);
      });
      controller.deploy = target.hostname;
    }
  }

  function updateBots() {
    const { reclaim } = xnet;
    const { bots } = xnet;

    reclaim.forEach((node: any) => {
      reclaimBot(node);
    });

    const focus = xnet.targets.sort(
      (a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW
    )[0];

    deployBot(focus);
  }

  function updateTargets() {
    const { targets } = xnet;
    const { bots } = xnet;
    // bots.forEach((bot: any) => hash.set(bot.hostname, bot.ram.now));
    // bots.sort((a: any, b: any) => a.home - b.home);
    targets.sort((a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW);
    // targets.sort((a: any, b: any) => b.money.max - a.money.max);
    // const targetsReady = targets.filter((target: any) => target.nodeReady);
    // const targetsPending = targets.filter((target: any) => !target.nodeReady);

    // ns.print(`[Bots] ${bots.length}`);
    // ns.print(targetsReady);
    // ns.print(targetsPending);

    const tMonitorRow =
      ' %4s | %3s | %4s | %6s | %8s | %8s | %8s | %8s | %8s | %-12s ';

    ns.printf(
      tMonitorRow,
      'Type',
      'CRD',
      'Lvl',
      'Sec',
      'Money',
      'Max',
      'Hack',
      'Weak',
      'Grow',
      'Server'
    );
    ns.printf(
      tMonitorRow,
      '',
      '',
      '',
      '',
      ns.formatNumber(xnet.targetsValueNow, 2),
      ns.formatNumber(xnet.targetsValue, 2),
      '',
      '',
      '',
      targets.length
    );
    ns.printf(
      tMonitorRow,
      '----',
      '---',
      '----',
      '------',
      '--------',
      '--------',
      '--------',
      '--------',
      '--------',
      '------------'
    );
    targets.forEach((t: any) => {
      const tmon = new Monitor(ns, t.hostname);
      const mH = t.home ? 'H' : ' ';
      const mS = t.server ? 'S' : ' ';
      const mB = t.bot ? 'B' : ' ';
      const mT = t.target ? '$' : ' ';
      const mC = t.challenge;
      const mR = t.root ? 'R' : ' ';
      const mD = t.door ? 'D' : ' ';

      ns.printf(
        tMonitorRow,
        `${mH}${mS}${mB}${mT}`,
        `${mC}${mR}${mD}`,
        t.level,
        `+${(tmon.getSec - tmon.getSecMin).toFixed(2)}`,
        `${((tmon.getMoneyAvailable / tmon.getMoneyMax) * 100).toFixed(2)}%`,
        `${ns.formatNumber(tmon.getMoneyMax, 2)}`,
        `${tmon.getHackThreads}`,
        `${tmon.getWeakThreads}`,
        `${tmon.getGrowThreads}`,
        t.hostname
      );
    });

    bots
      .filter((b: any) => b.bot && !b.target)
      .forEach((t: any) => {
        const tmon = new Monitor(ns, t.hostname);
        const mH = t.home ? 'H' : ' ';
        const mS = t.server ? 'S' : ' ';
        const mB = t.bot ? 'B' : ' ';
        const mT = t.target ? '$' : ' ';
        const mC = t.challenge;
        const mR = t.root ? 'R' : ' ';
        const mD = t.door ? 'D' : ' ';

        ns.printf(
          tMonitorRow,
          `${mH}${mS}${mB}${mT}`,
          `${mC}${mR}${mD}`,
          t.level,
          `+${(tmon.getSec - tmon.getSecMin).toFixed(2)}`,
          `${((tmon.getMoneyAvailable / tmon.getMoneyMax) * 100).toFixed(2)}%`,
          `${ns.formatNumber(tmon.getMoneyMax, 2)}`,
          `${tmon.getHackThreads}`,
          `${tmon.getWeakThreads}`,
          `${tmon.getGrowThreads}`,
          t.hostname
        );
      });
  }

  while (true) {
    ns.clearLog();
    updateStats();

    xnet.updateRing();
    updateBots();
    updateTargets();
    await ns.sleep(flags.refresh as number);
  }
}
