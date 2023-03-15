/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
import Display from './zDisplay.js';
import Server from './zServer.js';
import Shop from './zShop.js';
import Focus from './zFocus.js';
import { numCycleForGrowthCorrected } from './zCalc.js';
import { reclaimBot } from './uReclaim.js';
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
  const xshop = new Shop(ns, p, xnet);
  const xfocus = new Focus(ns, p, xnet);
  const xmon = new Display(ns, p, xnet);
  const xmap = new Map();
  const xmin = configs.xMin;
  const xhack = configs.xHack;
  const xweak = configs.xWeak;
  const xgrow = configs.xGrow;
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
    ramMin: ns.getScriptRam(configs.xMin),
    ramHack: ns.getScriptRam(configs.xHack),
    ramWeak: ns.getScriptRam(configs.xWeak),
    ramGrow: ns.getScriptRam(configs.xGrow),
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

  function updateNetwork() {
    xnet.updateRing();
    xmon.displayNetwork();
    xmon.displayTargets();
  }

  function updateBots() {
    const { reclaim } = xnet;
    // const { bots } = xnet;

    if (reclaim.length > 0) {
      reclaim.forEach((node: any) => {
        reclaimBot(ns, node);
      });
    }

    // const focus = xnet.targets.sort(
    //   (a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW
    // )[0];

    // deployBot(focus);
  }

  function work(
    action: string,
    amount = 1,
    target = 'n00dles',
    source: 'home'
  ) {
    // ns.print(`[Deploying] ${action} from ${source} on '${target}'`);
    ns.scp([xmin, xhack, xweak, xgrow], source, 'home');
    switch (action) {
      case 'hack': {
        ns.exec(xhack, source, amount, target);
        break;
      }

      case 'weak': {
        ns.exec(xweak, source, amount, target);
        break;
      }

      case 'grow': {
        ns.exec(xgrow, source, amount, target);
        break;
      }
      case 'min': {
        ns.exec(xmin, source, amount, target);
        break;
      }
      default: {
        ns.print('Nothing to do but wait');
      }
    }
  }

  function prepareTarget(targetNode: any, bot: any) {
    if (targetNode.weakR > 0 && bot.ram.now > controller.ramWeak) {
      if (targetNode.weakP < targetNode.weakR) {
        // ns.print('No weakens happening');
        // ns.print('[Deploy] WEAKEN');
        let batch = targetNode.weakR - targetNode.weakP;
        const maxThreads = bot.nodeThreads(controller.ramWeak);
        if (maxThreads > batch) {
          // ns.print('We could do a whole batch');
          targetNode.weakP += batch;
          work('weak', batch, targetNode.hostname, bot.hostname);
        } else if (maxThreads > 0) {
          batch = maxThreads;
          targetNode.weakP += batch;
          work('weak', batch, targetNode.hostname, bot.hostname);
        }
        if (targetNode.weakT + performance.now() > targetNode.recheck) {
          targetNode.recheck = targetNode.weakT + performance.now() + 1000;
        }
      }
    } else if (targetNode.growR > 0 && bot.ram.now > controller.ramGrow) {
      // ns.print('we need to grow it');
      if (targetNode.growP < targetNode.growR) {
        // ns.print('No grows happening');
        // ns.print('[SIMULATE] GROW');
        let batch = targetNode.growR - targetNode.growP;
        const maxThreads = bot.nodeThreads(controller.ramGrow);
        if (maxThreads > batch) {
          // ns.print('We could do a whole batch');
          targetNode.growP += batch;
          work('grow', batch, targetNode.hostname, bot.hostname);
        } else if (maxThreads > 0) {
          batch = maxThreads;
          targetNode.growP += batch;
          work('grow', batch, targetNode.hostname, bot.hostname);
        }
        if (targetNode.growT + performance.now() > targetNode.recheck) {
          targetNode.recheck = targetNode.growT + performance.now() + 1000;
        }
      }
    }
  }

  function attackTarget(targetNode: any, bot: any) {
    if (targetNode.hackR > 0 && bot.ram.now > controller.ramHack) {
      if (targetNode.hackP < targetNode.hackR) {
        let batch = targetNode.hackR - targetNode.hackP;
        const maxThreads = bot.nodeThreads(controller.ramHack);
        if (maxThreads > batch) {
          // ns.print('We could do a whole batch');
          targetNode.hackP += batch;
          work('hack', batch, targetNode.hostname, bot.hostname);
        } else if (maxThreads > 0) {
          batch = maxThreads;
          targetNode.hackP += batch;
          work('hack', batch, targetNode.hostname, bot.hostname);
        }
        if (targetNode.hackT + performance.now() > targetNode.recheck) {
          targetNode.recheck = targetNode.hackT + performance.now() + 1000;
        }
      }
    }
  }

  function updateTargets(targetNode: any) {
    const home = new Server(ns, 'home');
    if (!targetNode.ready) {
      // ns.print(`Not ready`);
      xnet.bots.forEach((bot: any) => {
        prepareTarget(targetNode, bot);
      });
      prepareTarget(targetNode, home);
    } else if (targetNode.ready) {
      // ns.print('Its ready, go for it');
      xnet.bots.forEach((bot: any) => {
        attackTarget(targetNode, bot);
        attackTarget(targetNode, home);
      });
    }
  }

  function updateFocus() {
    // Give it a set of targets
    // ns.print(xfocus.ramScripts, xfocus.ram);
    // ns.print(`[Targets Ready] ${xfocus.targetsReady.length}`);
    // xfocus.targetsReady.forEach((tr: any) => {
    //   ns.print(tr.hostname);
    // });

    xnet.targets.forEach((t: any) => {
      const previous = xmap.get(t.hostname);
      const update = {
        hostname: t.hostname,
        ready: t.nodeReady,
        focus: false,
        hackR: t.getHackThreads,
        hackP: 0,
        hackT: t.getHackTime,
        weakR: t.getWeakThreads,
        weakP: 0,
        weakT: t.getWeakTime,
        growR: t.getGrowThreads,
        growP: 0,
        growT: t.getGrowTime,
        recheck: performance.now() + 1000,
      };
      if (previous && previous.recheck >= performance.now()) {
        update.hackP = previous.hackP;
        update.weakP = previous.weakP;
        update.growP = previous.growP;
        update.recheck = previous.recheck;
      }
      xmap.set(t.hostname, update);
    });

    // FIXME: Adjust this with a filtered list with the top 10 results
    xnet.targets
      .sort((a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW)
      .filter((t: any, index) => index < 10)
      .forEach((t: any) => {
        const targetNode = xmap.get(t.hostname);
        updateTargets(targetNode);
      });

    // const home = new Server(ns, 'home');
    const test = xmap.get('harakiri-sushi');
    ns.print(test);

    // ns.print(xfocus.focusMap.get('harakiri-sushi'));
    // ns.print(`[Targets Prepping] ${xfocus.targetsPrep.length}`);
    // xfocus.targetsPrep.forEach((tp: any) => {
    //   ns.print(tp.hostname);
    // });
    // Get a set of actions to take from targets
  }

  // FIXME: Later
  // function deployBot(target: any) {
  //   if (controller.deploy !== target.hostname) {
  //     xnet.bots.forEach((node: any) => {
  //       ns.scp(xmin, node.hostname, 'home');
  //       ns.kill(xmin, node.hostname, target.hostname);
  //       const maxThreads = Math.floor(node.ram.max / controller.ramHack);
  //       ns.exec(xmin, node.hostname, maxThreads, target.hostname);
  //     });
  //     controller.deploy = target.hostname;
  //   }
  // }

  while (true) {
    ns.clearLog();
    updateStats();
    updateNetwork();
    updateBots();
    updateFocus();
    // work('hack');
    await ns.sleep(flags.refresh as number);
  }
}
