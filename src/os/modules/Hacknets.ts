/* eslint-disable */
import { NS } from '@ns';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ControlInfo } from '/os/modules/Control';
import { CONFIGS, TIME } from '/os/configs';
import { getBitNodeMults } from '/os/modules/BitNodes';
/* eslint-enable */

// ******** Globals
const { moneyReserve } = CONFIGS;
const { hacknetMoneyRatio } = CONFIGS.moneyRatio;
const {
  hacknetBreakevenTime,
  hacknetTargetCount,
  hacknetTargetLevel,
  hacknetTargetRam,
  hacknetTargetCores,
} = CONFIGS.hacknet;

// ******** HACKNET UTILITY FUNCTIONS
function calculatePayBack(
  cost: number,
  oldProd: number,
  newProd: number
): number {
  return cost / (newProd - oldProd);
}

export default class Hacknets {
  ns: NS;
  nodesDone: number;
  pMult: number;
  pMultBN: number;
  hacknetNodes: any;
  targets: {
    count: number;
    level: number;
    ram: number;
    cores: number;
  };

  constructor(ns: NS, lvl = 1) {
    this.ns = ns;
    this.nodesDone = 0;
    this.pMult = ns.getPlayer().mults.hacknet_node_money || 1;
    this.pMultBN = getBitNodeMults(
      ns.getResetInfo().currentNode,
      lvl
    ).HacknetNodeMoney;
    this.targets = {
      count: hacknetTargetCount,
      level: hacknetTargetLevel,
      ram: hacknetTargetRam,
      cores: hacknetTargetCores,
    };
  }

  canAfford(reserve: number): number {
    return (
      (this.ns.getServerMoneyAvailable('home') - (moneyReserve + reserve)) *
      hacknetMoneyRatio
    );
  }

  get pNodeCost() {
    return this.ns.hacknet.getPurchaseNodeCost();
  }

  pUpgrade(node: any, reserve: number) {
    switch (node.uType) {
      case 'LEVEL': {
        if (node.cLevel < this.canAfford(reserve)) {
          this.ns.hacknet.upgradeLevel(node.id, 1);
        }
        break;
      }

      case 'RAM': {
        if (node.cRam < this.canAfford(reserve)) {
          this.ns.hacknet.upgradeRam(node.id, 1);
        }
        break;
      }

      case 'CORES': {
        if (node.cCores < this.canAfford(reserve)) {
          this.ns.hacknet.upgradeCore(node.id, 1);
        }
        break;
      }
      default:
    }
  }

  get nodes() {
    const m: any = [];
    let done = 0;
    for (let i = 0; i < this.ns.hacknet.numNodes(); i += 1) {
      const n = this.ns.hacknet.getNodeStats(i);
      const r = {
        id: i,
        name: n.name, // name: 'hacknet-node-0',
        level: n.level, // level: 1,
        cLevel: this.ns.hacknet.getLevelUpgradeCost(i, 1),
        uLevel:
          n.level < this.targets.level
            ? this.calculateProduction(n.level + 1, n.ram, n.cores)
            : false,
        vLevel: 0,
        ram: n.ram, // ram: 1,
        cRam: this.ns.hacknet.getRamUpgradeCost(i, 1),
        uRam:
          n.ram < this.targets.ram
            ? this.calculateProduction(n.level, n.ram * 2, n.cores)
            : false,
        vRam: 0,
        cores: n.cores, // cores: 1,
        cCores: this.ns.hacknet.getCoreUpgradeCost(i, 1),
        uCores:
          n.cores < this.targets.cores
            ? this.calculateProduction(n.level, n.ram, n.cores + 1)
            : false,
        vCores: 0,
        production: this.calculateProduction(n.level, n.ram, n.cores),
        uType: '',
        uCost: 0,
        done: false,
      };

      // Calculate value
      if (typeof r.uLevel === 'number')
        r.vLevel = calculatePayBack(r.cLevel, r.production, r.uLevel);
      if (typeof r.uRam === 'number')
        r.vRam = calculatePayBack(r.cRam, r.production, r.uRam);
      if (typeof r.uCores === 'number')
        r.vCores = calculatePayBack(r.cCores, r.production, r.uCores);

      // Calculate upgrade
      const choice = [];
      if (r.level < this.targets.level)
        choice.push({ u: 'LEVEL', v: r.vLevel, c: r.cLevel });
      if (r.ram < this.targets.ram)
        choice.push({ u: 'RAM', v: r.vRam, c: r.cRam });
      if (r.cores < this.targets.cores)
        choice.push({ u: 'CORES', v: r.vCores, c: r.cCores });

      choice.sort((a: any, b: any) => a.v - b.v);

      // Calcualte if its done
      if (
        n.level >= this.targets.level &&
        n.ram >= this.targets.ram &&
        n.cores >= this.targets.cores
      ) {
        r.uType = '';
        r.done = true;
        done += 1;
      } else {
        r.uType = choice[0].u;
        r.uCost = choice[0].c;
      }
      // return it
      m.push(r);
    }
    this.nodesDone = done;
    m.sort((a: any, b: any) => a.uCost - b.uCost);
    return m;
  }

  calculateProduction(level: number, ram: number, cores: number): number {
    return (
      level *
      1.5 *
      1.035 ** (ram - 1) *
      ((cores + 5) / 6) *
      this.pMult *
      this.pMultBN
    );
  }
}

// ******** Main function
export async function main(ns: NS) {
  // ******** Setup
  const xWidth = 200;
  const xHeight = 160;
  const xBufferY = 52; // Bottom terminal
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  ns.disableLog('disableLog');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('asleep');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Hacknet');
  ns.resizeTail(xWidth, xHeight);
  ns.moveTail(wWidth - xWidth, wHeight - xHeight - xBufferY - 190 - 90);

  // ******** Initialize (One Time Code)
  const hacknet = new Hacknets(ns);
  // ns.tprint(hacknet);

  // ******** Primary (Loop Time Code)
  while (true) {
    ns.clearLog();
    // ******** Consts
    const control = ControlCache.read(ns, 'control');
    const isShopHacknet = control?.isShopHacknet || true;
    const isReserve = control?.isReserve || 0;
    const { nodes } = hacknet;
    const nTotal = nodes.length;

    // ******** Display
    ns.print(`👾 ${hacknet.nodesDone} 💸 ${ns.formatNumber(isReserve, 1)}`);

    // ******** Purchase loop
    if (isShopHacknet) {
      // Styling
      const rowStyle = '%2s %3s %2s %2s %-6s';
      ns.printf(rowStyle, 'ID', 'LVL', 'R#', 'C#', '🌿');

      // Buy first one just in case
      if (nTotal === 0) {
        ns.hacknet.purchaseNode();
      }
      // Upgrade if we are not at max
      if (nTotal < hacknet.targets.count) {
        ns.printf(
          rowStyle,
          'X',
          '-',
          '-',
          '-',
          `👾${ns.formatNumber(
            hacknet.pNodeCost - hacknet.canAfford(isReserve),
            0
          )}`
        );
        if (
          hacknet.pNodeCost < nodes[0].uCost &&
          hacknet.pNodeCost < hacknet.canAfford(isReserve)
        ) {
          ns.hacknet.purchaseNode();
        }
      }

      // Loop through the existing ones
      nodes.forEach((n: any) => {
        // Styling
        let mType = '';
        if (n.uType === 'LEVEL') mType = '🌿';
        if (n.uType === 'RAM') mType = '🔋';
        if (n.uType === 'CORES') mType = '🖲️';
        // ns.print(n);
        ns.printf(
          rowStyle,
          n.id,
          n.level,
          n.ram,
          n.cores,
          `${mType}${ns.formatNumber(
            n.uCost - hacknet.canAfford(isReserve),
            0
          )}`
        );
        hacknet.pUpgrade(n, isReserve);
      });
    }

    if (hacknet.nodesDone === hacknet.targets.count) {
      ns.exit();
    }

    await ns.asleep(TIME.HACKNET);
  }
}
