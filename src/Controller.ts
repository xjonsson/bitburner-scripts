/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
import Display from './zDisplay.js';
import Server from './zServer.js';
import Shop from './zShop.js';
// import Focus from './zFocus.js';
import { numCycleForGrowthCorrected } from './zCalc.js';
import { reclaimBot } from './uReclaim.js';
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
  const home = new Server(ns, 'home');
  const xnet = new Network(ns);
  const xshop = new Shop(ns, p, xnet);
  // const xfocus = new Focus(ns, p, xnet);
  const xmon = new Display(ns, p, xnet);
  const xmap = new Map();
  const xmin = configs.xMin;
  const xhack = configs.xHack;
  const xweak = configs.xWeak;
  const xgrow = configs.xGrow;
  const xshare = configs.xShare;
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
    ramShare: ns.getScriptRam(configs.xShare),
    deploy: '',
  };

  ns.tail();
  ns.clearLog();
  // ns.disableLog('scan');
  // ns.disableLog('getServerMaxRam');
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
      controller.cHacking = p.hacking;
      xnet.updateRing();
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
  }

  function updateNetwork() {
    // xnet.updateRing();
    xmon.displayNetwork();
    xmon.displayTargets(configs.focusLimit, xmap); // 25
  }

  function updateBots() {
    const { reclaim } = xnet;
    // const { bots } = xnet;

    if (reclaim.length > 0) {
      reclaim.forEach((node: any) => {
        reclaimBot(ns, p, node);
        ns.scp([xmin, xhack, xweak, xgrow, xshare], node.hostname, 'home');
      });
    }
  }

  function work(
    action: string,
    amount = 1,
    target = 'n00dles',
    source: 'home',
    repeat = false,
    delay = 0
  ) {
    // ns.print(`[Deploying] ${action} from ${source} on '${target}'`);
    // ns.scp([xmin, xhack, xweak, xgrow, xshare], source, 'home');
    switch (action) {
      case 'hack': {
        ns.exec(xhack, source, amount, target, repeat, delay);
        break;
      }

      case 'weak': {
        ns.exec(xweak, source, amount, target, repeat, delay);
        break;
      }

      case 'grow': {
        ns.exec(xgrow, source, amount, target, repeat, delay);
        break;
      }
      case 'min': {
        ns.exec(xmin, source, amount, target, repeat, delay);
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
        let batch = targetNode.weakR - targetNode.weakP;
        const maxThreads = bot.nodeThreads(controller.ramWeak);
        if (maxThreads > batch) {
          targetNode.weakP += batch;
          work('weak', batch, targetNode.hostname, bot.hostname, false, 0);
        } else if (maxThreads > 0) {
          batch = maxThreads;
          targetNode.weakP += batch;
          work('weak', batch, targetNode.hostname, bot.hostname, false, 0);
        }
        if (targetNode.weakT + performance.now() > targetNode.recheck) {
          targetNode.recheck = targetNode.weakT + performance.now() + 1000;
        }
      }
    } else if (targetNode.growR > 0 && bot.ram.now > controller.ramGrow) {
      if (targetNode.growP < targetNode.growR) {
        let batch = targetNode.growR - targetNode.growP;
        const maxThreads = bot.nodeThreads(controller.ramGrow);
        if (maxThreads > batch) {
          targetNode.growP += batch;
          work('grow', batch, targetNode.hostname, bot.hostname, false, 0);
        } else if (maxThreads > 0) {
          batch = maxThreads;
          targetNode.growP += batch;
          work('grow', batch, targetNode.hostname, bot.hostname, false, 0);
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

  function attackTargetBatch(targetNode: any, bot: any) {
    const target = new Server(ns, targetNode.hostname);
    const thHack = target.getHackThreads;
    const thWeak1 = Math.ceil(thHack / 25);
    const thGrow = target.getGrowThreadsCorrected(bot.cores);
    const thWeak2 = Math.ceil(thGrow / 12.5);
    const tWeak = target.getWeakTime;
    // const tGrow = target.getGrowTime;
    const now = performance.now();
    const next = now + tWeak + 3000;
    const batch = {
      hack: thHack,
      weak1: thWeak1,
      grow: thGrow,
      weak2: thWeak2,
    };

    let ramRequired = controller.ramHack * batch.hack;
    ramRequired += controller.ramWeak * batch.weak1;
    ramRequired += controller.ramGrow * batch.grow;
    ramRequired += controller.ramWeak * batch.weak2;

    if (bot.ram.now > ramRequired && targetNode.focus < configs.focusAmount) {
      targetNode.focus += 1;
      work('hack', batch.hack, target.hostname, bot.hostname, false, next);
      work(
        'weak',
        batch.weak1,
        target.hostname,
        bot.hostname,
        false,
        next + 40
      );
      work('grow', batch.grow, target.hostname, bot.hostname, false, next + 80);
      work(
        'weak',
        batch.weak2,
        target.hostname,
        bot.hostname,
        false,
        next + 120
      );

      if (next > targetNode.recheck) {
        targetNode.recheck = next + 1000;
      }
    }
  }

  function updateTargets(targetNode: any) {
    if (!targetNode.ready) {
      xnet.bots.forEach((bot: any) => {
        prepareTarget(targetNode, bot);
      });
      prepareTarget(targetNode, home);
    } else if (targetNode.ready && targetNode.focus < configs.focusAmount) {
      xnet.bots.forEach((bot: any) => {
        attackTargetBatch(targetNode, bot);
        // attackTarget(targetNode, bot);
      });
      attackTargetBatch(targetNode, home);
      // attackTarget(targetNode, home);

      // if (!controller.attackBatch) {
      //   // xnet.bots.forEach((bot: any) => {
      //   //   attackTarget(targetNode, bot);
      //   // });
      //   attackTarget(targetNode, home);
      // }
    }
  }

  function updateFocus() {
    xnet.targets.forEach((t: any) => {
      const previous = xmap.get(t.hostname);
      const update = {
        hostname: t.hostname,
        ready: t.nodeReady,
        focus: 0,
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
        update.focus = previous.focus;
        update.hackP = previous.hackP;
        update.weakP = previous.weakP;
        update.growP = previous.growP;
        update.recheck = previous.recheck;
      }
      xmap.set(t.hostname, update);
    });

    // FIXME: Adjust this with a filtered list with the top 10 results
    // xnet.targets
    //   .sort((a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW)
    //   .filter((t: any, index) => index < 10)
    //   .forEach((t: any) => {
    //     const targetNode = xmap.get(t.hostname);
    //     updateTargets(targetNode);
    //   });
    xnet.targets
      // .sort((a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW)
      .sort((a: any, b: any) => b.value - a.value)
      // .filter((t: any, index) => index < configs.focusLimit) // FIXME: Limit
      .filter((t: any) => {
        const previous = xmap.get(t.hostname);
        if (previous.recheck) {
          return previous.recheck <= performance.now() + 1000;
        }
        return true;
      })
      .forEach((t: any) => {
        const targetNode = xmap.get(t.hostname);
        updateTargets(targetNode);
      });
  }

  function updateShares() {
    xnet.bots
      .filter((b: any) => b.ram.now > controller.ramShare)
      .forEach((b: any) => {
        // ns.scp(xshare, b.hostname, 'home');
        const maxThreads = b.nodeThreads(controller.ramShare);
        ns.exec(xshare, b.hostname, maxThreads);
      });
    // if (home.ram.now * configs.reserveX.ram.share > controller.ramShare) {
    //   const maxThreads = home.nodeThreads(controller.ramShare);
    //   ns.exec(xshare, home.hostname, maxThreads);
    // }
  }

  while (true) {
    ns.clearLog();
    updateStats();
    updateNetwork();
    updateBots();
    updateFocus();
    // updateShares();
    await ns.sleep(flags.refresh as number);
  }
}
