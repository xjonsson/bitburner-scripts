/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME } from '/os/configs';
import { PlayerCache } from '/os/modules/Cache';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('sleep');
  ns.disableLog('getServerMoneyAvailable');
  ns.tail();
  ns.clearLog();

  const { breakeven, countTarget, levelTarget, ramTarget, coresTarget } =
    CONFIGS.hacknetTarget;
  const moneyReserve = CONFIGS.moneyReserve.hacknet;
  const moneyRatio = CONFIGS.moneyRatio.hacknet;
  const sleepHacknet = TIME.HACKNET;
  const prodMult = PlayerCache.read(ns, 'player').hacknet.production;
  const prodMultBitnode = 1; // HacknetNodeMoney = 1;

  // ns.print(PlayerCache.read(ns, 'player'));

  // Buy the first node to not mess up code
  while (ns.hacknet.numNodes() === 0) {
    ns.hacknet.purchaseNode();
    await ns.sleep(sleepHacknet);
  }

  function updateNodes() {
    const nodesTemp = new Map();
    for (let i = 0; i < ns.hacknet.numNodes(); i += 1) {
      nodesTemp.set(i, ns.hacknet.getNodeStats(i));
    }
    return nodesTemp;
  }

  function getMoney() {
    return (ns.getServerMoneyAvailable('home') - moneyReserve) * moneyRatio;
  }

  function calculateProduction(level: number, ram: number, cores: number) {
    return (
      level *
      1.5 *
      1.035 ** (ram - 1) *
      ((cores + 5) / 6) *
      prodMult *
      prodMultBitnode
    );
  }

  function calculatePaybackTime(
    cost: number,
    oldProd: number,
    newProd: number
  ) {
    return cost / (newProd - oldProd);
  }

  const UpgradeType: any = {};
  (function () {
    UpgradeType[(UpgradeType.level = 0)] = 'level';
    UpgradeType[(UpgradeType.ram = 1)] = 'ram';
    UpgradeType[(UpgradeType.core = 2)] = 'core';
  })();

  let nodes = updateNodes();

  while (true) {
    await ns.sleep(10);
    ns.clearLog();
    ns.print('Node\tLevel\tRAM\tCores\tProd/s');
    // upgrade existing
    const ratios = [];
    for (const [i, node] of nodes.entries()) {
      ns.print(
        `Node ${i}\t${node.level}\t${node.ram}\t${node.cores}\t${ns.nFormat(
          node.production,
          '0.0a'
        )}`
      );
      // get upgrades cost
      const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(i, 1);
      const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(i, 1);
      const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(i, 1);
      // get prod. growth / cost ratios
      // const levelUpgradeRatio = (calc_production(node.level + 1, node.ram, node.cores) - node.production) / levelUpgradeCost;
      // const ramUpgradeRatio = (calc_production(node.level, node.ram * 2, node.cores) - node.production) / ramUpgradeCost;
      // const coreUpgradeRatio = (calc_production(node.level, node.ram, node.cores + 1) - node.production) / coreUpgradeCost;
      const levelPaybackTime = calculatePaybackTime(
        levelUpgradeCost,
        calculateProduction(node.level, node.ram, node.cores),
        calculateProduction(node.level + 1, node.ram, node.cores)
      );
      const ramPaybackTime = calculatePaybackTime(
        ramUpgradeCost,
        calculateProduction(node.level, node.ram, node.cores),
        calculateProduction(node.level, node.ram * 2, node.cores)
      );
      const corePaybackTime = calculatePaybackTime(
        coreUpgradeCost,
        calculateProduction(node.level, node.ram, node.cores),
        calculateProduction(node.level, node.ram, node.cores + 1)
      );
      if (node.level < levelTarget) {
        ratios.push({
          cost: levelUpgradeCost,
          payback: levelPaybackTime,
          idx: i,
          upgrade: UpgradeType.level,
        });
      }
      if (node.ram < ramTarget) {
        ratios.push({
          cost: ramUpgradeCost,
          payback: ramPaybackTime,
          idx: i,
          upgrade: UpgradeType.ram,
        });
      }
      if (node.cores < coresTarget) {
        ratios.push({
          cost: coreUpgradeCost,
          payback: corePaybackTime,
          idx: i,
          upgrade: UpgradeType.core,
        });
      }
    }
    if (ratios.every((r) => r.payback > breakeven)) {
      if (nodes.size >= countTarget) {
        // ns.closeTail();
        return; // ns.exit(); // return;
      }

      // try to buy a new node
      while (ns.hacknet.getPurchaseNodeCost() > getMoney()) {
        await ns.sleep(sleepHacknet);
        // ns.exit()
      }
      ns.hacknet.purchaseNode();
    } else {
      const { cost, idx, upgrade } = ratios.sort(
        (a, b) => a.payback - b.payback
      )[0];
      if (Number.isFinite(cost) && cost) {
        while (getMoney() < cost) {
          await ns.sleep(sleepHacknet);
          // ns.exit()
        }
        switch (upgrade) {
          case UpgradeType.level:
            ns.hacknet.upgradeLevel(idx, 1);
            break;
          case UpgradeType.ram:
            ns.hacknet.upgradeRam(idx, 1);
            break;
          case UpgradeType.core:
            ns.hacknet.upgradeCore(idx, 1);
            break;
          default:
        }
      }
    }
    nodes = updateNodes();
  }
}
