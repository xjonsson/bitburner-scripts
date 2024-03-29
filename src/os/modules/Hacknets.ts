/* eslint-disable */
import { NS } from '@ns';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ControlInfo } from '/os/modules/Control';
import { CONFIGS, TIME } from '/os/configs';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('sleep');
  ns.clearLog();
  ns.tail();

  // ******** Initialize
  const { moneyReserve } = CONFIGS;
  const { hacknetMoneyRatio } = CONFIGS.moneyRatio;
  const hacknetSleepTime = TIME.HACKNET;
  const {
    hacknetBreakevenTime,
    hacknetTargetCount,
    hacknetTargetLevel,
    hacknetTargetRam,
    hacknetTargetCores,
  } = CONFIGS.hacknet;
  const prodMult = PlayerCache.read(ns, 'player')?.hacknet.production || 1;
  const prodMultBitnode = 1; // HacknetNodeMoney = 1;

  while (ns.hacknet.numNodes() === 0) {
    ns.hacknet.purchaseNode();
    await ns.sleep(hacknetSleepTime);
  }

  // ******** Update the nodes
  function updateNodes() {
    const nodesTemp = new Map();
    for (let i = 0; i < ns.hacknet.numNodes(); i += 1) {
      nodesTemp.set(i, ns.hacknet.getNodeStats(i));
    }
    return nodesTemp;
  }

  function getReserve() {
    const stage = ControlCache.read(ns, 'control')?.stage;
    switch (stage) {
      case 1: {
        return CONFIGS.shoppingPrices.tor;
      }
      case 2: {
        return CONFIGS.shoppingPrices.ssh;
      }
      case 4: {
        return CONFIGS.shoppingPrices.ftp;
      }
      case 6: {
        return CONFIGS.shoppingPrices.smtp;
      }
      case 8: {
        return CONFIGS.shoppingPrices.http;
      }
      case 10: {
        return CONFIGS.shoppingPrices.sql;
      }
      default: {
        return 0;
      }
    }
  }

  function getMoney() {
    return (
      (ns.getServerMoneyAvailable('home') - (moneyReserve + getReserve())) *
      hacknetMoneyRatio
    );
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

  // Keep the game loop going
  // let control
  const repeat = true;
  while (repeat) {
    await ns.sleep(100);
    ns.clearLog();
    ns.print(`Reserve: ${getReserve()}`);
    ns.print('Node\tLevel\tRAM\tCores\tProd/s');
    // upgrade existing
    const ratios = [];
    let done = 0;
    for (const [i, node] of nodes.entries()) {
      ns.print(
        `Node ${i}\t${node.level}\t${node.ram}\t${
          node.cores
        }\t${ns.formatNumber(node.production, 1)}`
      );
      // get upgrades cost
      const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(i, 1);
      const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(i, 1);
      const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(i, 1);
      // get prod. growth / cost ratios
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
      if (node.level < hacknetTargetLevel) {
        ratios.push({
          cost: levelUpgradeCost,
          payback: levelPaybackTime,
          idx: i,
          upgrade: UpgradeType.level,
        });
      }
      if (node.ram < hacknetTargetRam) {
        ratios.push({
          cost: ramUpgradeCost,
          payback: ramPaybackTime,
          idx: i,
          upgrade: UpgradeType.ram,
        });
      }
      if (node.cores < hacknetTargetCores) {
        ratios.push({
          cost: coreUpgradeCost,
          payback: corePaybackTime,
          idx: i,
          upgrade: UpgradeType.core,
        });
      }

      if (
        node.level >= hacknetTargetLevel &&
        node.ram >= hacknetTargetRam &&
        node.cores >= hacknetTargetCores
      ) {
        done += 1;
      }
    }

    if (
      nodes.size <= hacknetTargetCount &&
      ns.hacknet.getPurchaseNodeCost() < getMoney()
    ) {
      ns.hacknet.purchaseNode();
    } else {
      if (done >= hacknetTargetCount) {
        const past = ControlCache.read(ns, 'control');
        const control = ControlInfo.details(ns, past);
        control.isShopHacknet = false;
        await ControlCache.update(ns, control);
        return;
      }

      // const { cost, idx, upgrade } = ratios.sort((a, b) => a.cost - b.cost)[0];
      const { cost, idx, upgrade } = ratios.sort(
        (a, b) => a.payback - b.payback
      )[0];
      if (Number.isFinite(cost) && cost) {
        while (getMoney() < cost) {
          await ns.sleep(hacknetSleepTime);
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
