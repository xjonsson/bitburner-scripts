/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
import { ControlCache } from '/os/modules/Cache';
import { CONFIGS, TIME } from '/os/configs';
import { getBitNodeMults } from '/os/modules/BitNodes';
/* eslint-enable */

// ******** Globals
const mReserve = CONFIGS.moneyReserve;
const { hnMoneyRatio, hnTCount, hnTLevel, hnTRam, hnTCores } = CONFIGS.hacknet; // hnBreakevenTime

// ******** HACKNET UTILITY FUNCTIONS
function calcPayBack(c: number, o: number, n: number): number {
  return c / (n - o); // Cost / (new production - old production)
}

function hnMoney(ns: NS, r: number): number {
  return (ns.getServerMoneyAvailable('home') - mReserve - r) * hnMoneyRatio;
}

// ******** HACKNET CLASS
export default class Hacknets {
  ns: NS;
  done: boolean;
  pMult: number;
  pMultBN: number;
  nodesLevel: number;
  nodesMaxed: number;
  shoppinglist: Array<{
    id: number;
    type: string;
    cost: number;
    value: number;
  }>;

  // ******** CONSTRUCTOR
  constructor(ns: NS, lvl = 1) {
    this.ns = ns;
    this.done = false;
    this.pMult = ns.getPlayer().mults.hacknet_node_money || 1;
    this.pMultBN =
      getBitNodeMults(ns.getResetInfo().currentNode, lvl).HacknetNodeMoney || 1;
    this.nodesLevel = 0;
    this.nodesMaxed = 0; // maxNumNodes()
    this.shoppinglist = [];
  }

  // ******** METHODS
  get nodesCount() {
    return this.ns.hacknet.numNodes();
  }

  get list() {
    return this.shoppinglist;
  }

  get updateNodes() {
    const s: any = [];
    let nLevel = 0;
    let nMaxed = 0;

    if (this.nodesCount < hnTCount) {
      const cNew = this.ns.hacknet.getPurchaseNodeCost();
      s.push({
        id: this.nodesCount,
        type: 'NEW',
        msg: '💰 New',
        cost: cNew,
        value: calcPayBack(cNew, 0, this.calcProduction(1, 1, 1)),
      });
    }

    // Go through all existing ones
    for (let i = 0; i < this.nodesCount; i += 1) {
      const n = this.ns.hacknet.getNodeStats(i);

      // Node is maxed
      if (n.level >= hnTLevel && n.ram >= hnTRam && n.cores >= hnTCores) {
        nMaxed += 1;
      }
      nLevel += n.level;

      // Node can level
      if (n.level < hnTLevel) {
        const cLevel = this.ns.hacknet.getLevelUpgradeCost(i, 1);
        s.push({
          id: i,
          type: 'LVL',
          msg: `🌿 ${n.level + 1}`,
          cost: cLevel,
          value: calcPayBack(
            cLevel,
            n.production,
            this.calcProduction(n.level + 1, n.ram, n.cores)
          ),
        });
      }

      // Node can ram
      if (n.ram < hnTRam) {
        const cRam = this.ns.hacknet.getRamUpgradeCost(i, 1);
        s.push({
          id: i,
          type: 'RAM',
          msg: `🔋 ${n.ram * 2}`,
          cost: cRam,
          value: calcPayBack(
            cRam,
            n.production,
            this.calcProduction(n.level, n.ram + 1, n.cores)
          ),
        });
      }

      // Node can core
      if (n.cores < hnTCores) {
        const cCores = this.ns.hacknet.getCoreUpgradeCost(i, 1);
        s.push({
          id: i,
          type: 'CORES',
          msg: `🖲️ ${n.cores + 1}`,
          cost: cCores,
          value: calcPayBack(
            cCores,
            n.production,
            this.calcProduction(n.level, n.ram, n.cores + 1)
          ),
        });
      }
    }

    if (nMaxed >= hnTCount) this.done = true;
    this.nodesLevel = nLevel;
    this.nodesMaxed = nMaxed;
    this.shoppinglist = s.sort((a: any, b: any) => a.cost - b.cost);
    return s;
  }

  async updatePorts() {
    const portdata = {
      done: this.done,
      nodesCount: this.nodesCount,
      nodesLevel: this.nodesLevel,
      nodesMaxed: this.nodesMaxed,
      // list: this.shoppinglist, // Add back for debug
    };
    this.ns.clearPort(PORTS.HACKNET);
    await this.ns.tryWritePort(PORTS.HACKNET, portdata);
  }

  // ******** FUNCTIONS
  calcProduction(level: number, ram: number, cores: number): number {
    const levelMult = level * 1.5;
    const ramMult = 1.035 ** (ram - 1);
    const coresMult = (cores + 5) / 6;
    return levelMult * ramMult * coresMult * this.pMult * this.pMultBN;
  }
}

// ******** Main function
export async function main(ns: NS) {
  // ******** Setup
  const xWidth = 200;
  const xHeight = 90;
  const xBufferY = 52; // Bottom terminal
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  ns.disableLog('disableLog');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('sleep');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Hacknet');
  ns.resizeTail(xWidth, xHeight);
  ns.moveTail(wWidth - xWidth, wHeight - xHeight - xBufferY - 190 - 90);

  // ******** Initialize (One Time Code)
  if (ns.hacknet.numNodes() === 0) {
    ns.hacknet.purchaseNode();
  }
  const hacknet = new Hacknets(ns);

  // ******** Primary (Loop Time Code)
  while (!hacknet.done) {
    ns.clearLog();
    // ******** Consts
    const control = ControlCache.read(ns, 'control');
    const isShopHN = control?.isShopHN || true;
    const reserve = control?.isReserve || 0;

    // ******** Display
    ns.print(
      `${isShopHN ? '🟢' : '🟥'}👾${hacknet.nodesMaxed} ${
        hacknet.nodesCount
      }/${hnTCount} 💸${ns.formatNumber(reserve, 1)}`
    );
    if (isShopHN) {
      const list = hacknet.updateNodes;
      await hacknet.updatePorts();
      if (hacknet.done) ns.exit();
      // Process
      const { id, type, msg, cost } = list[0];
      if (Number.isFinite(cost) && cost) {
        // Styling
        ns.printf(
          '%2s %-16s',
          id,
          `${msg} (${ns.formatNumber(cost - hnMoney(ns, reserve), 1)})`
        );

        // Wait if we cant afford it
        while (hnMoney(ns, reserve) < cost) {
          await ns.sleep(TIME.HACKNET);
        }

        switch (type) {
          case 'NEW':
            ns.hacknet.purchaseNode();
            break;
          case 'LVL':
            ns.hacknet.upgradeLevel(id, 1);
            break;
          case 'RAM':
            ns.hacknet.upgradeRam(id, 1);
            break;
          case 'CORES':
            ns.hacknet.upgradeCore(id, 1);
            break;
          default:
            break;
        }
      }
    }

    await ns.sleep(TIME.HACKNET);
  }
}
