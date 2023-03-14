/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
import Display from './zDisplay.js';
import Server from './zServer.js';
import Shop from './zShop.js';
import { numCycleForGrowthCorrected } from './zCalc.js';
/* eslint-enable */

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 1000],
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

      xshop.updateShopping();
      xshop.buyNext();

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

  function updateTargets() {
    const { targets } = xnet;
    const { bots } = xnet;
    xnet.updateRing();
    // bots.forEach((bot: any) => hash.set(bot.hostname, bot.ram.now));
    // bots.sort((a: any, b: any) => a.home - b.home);
    // targets.sort((a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW);
    // const targetsReady = targets.filter((target: any) => target.nodeReady);
    // const targetsPending = targets.filter((target: any) => !target.nodeReady);

    ns.print(`[Targets] ${targets.length}`);
    ns.print(`[Bots] ${bots.length}`);
    // ns.print(targetsReady);
    // ns.print(targetsPending);
  }

  while (true) {
    ns.clearLog();
    updateStats();
    updateTargets();
    await ns.sleep(flags.refresh as number);
  }
}
