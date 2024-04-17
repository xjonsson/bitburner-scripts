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
  return c / (n - o);
}

function hnMoney(ns: NS, r: number): number {
  return (ns.getServerMoneyAvailable('home') - mReserve - r) * hnMoneyRatio;
}

function hnShopItem(i: number, t: string, m: string, c: number, v: number) {
  return {
    id: i,
    type: t,
    msg: m,
    cost: c,
    value: v,
  };
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
    const cBN = ns.getResetInfo().currentNode;
    this.ns = ns;
    this.done = false;
    this.pMult = ns.getPlayer().mults.hacknet_node_money || 1;
    this.pMultBN = getBitNodeMults(cBN, lvl).HacknetNodeMoney || 1;
    this.nodesLevel = 0;
    this.nodesMaxed = 0;
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

    // ******** NODE NEW
    if (this.nodesCount < hnTCount) {
      const cNew = this.ns.hacknet.getPurchaseNodeCost();
      const vNew = calcPayBack(cNew, 0, this.calcProduction(1, 1, 1));
      const mNew = '💰 New';
      const sNew = hnShopItem(this.nodesCount, 'NEW', mNew, cNew, vNew);
      s.push(sNew);
    }

    // Go through all existing ones
    for (let i = 0; i < this.nodesCount; i += 1) {
      const n = this.ns.hacknet.getNodeStats(i);

      // ******** NODE MAXED
      if (n.level >= hnTLevel && n.ram >= hnTRam && n.cores >= hnTCores) {
        nMaxed += 1;
      }
      nLevel += n.level;

      // ******** NODE LEVEL
      if (n.level < hnTLevel) {
        const cLevel = this.ns.hacknet.getLevelUpgradeCost(i, 1);
        const uLevel = this.calcProduction(n.level + 1, n.ram, n.cores);
        const vLevel = calcPayBack(cLevel, n.production, uLevel);
        const mLevel = `🌿 ${n.level + 1}`;
        const sLevel = hnShopItem(i, 'LVL', mLevel, cLevel, vLevel);
        s.push(sLevel);
      }

      // ******** NODE RAM
      if (n.ram < hnTRam) {
        const cRam = this.ns.hacknet.getRamUpgradeCost(i, 1);
        const uRam = this.calcProduction(n.level, n.ram + 1, n.cores);
        const vRam = calcPayBack(cRam, n.production, uRam);
        const mRam = `🔋 ${n.ram * 2}`;
        const sRam = hnShopItem(i, 'RAM', mRam, cRam, vRam);
        s.push(sRam);
      }

      // ******** NODE CORES
      if (n.cores < hnTCores) {
        const cCores = this.ns.hacknet.getCoreUpgradeCost(i, 1);
        const uCores = this.calcProduction(n.level, n.ram, n.cores + 1);
        const vCores = calcPayBack(cCores, n.production, uCores);
        const mCores = `🖲️ ${n.cores + 1}`;
        const sCores = hnShopItem(i, 'CORES', mCores, cCores, vCores);
        s.push(sCores);
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
      // list: this.shoppinglist, // NOTE: Add back for full shopping list
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
    const dStatus = isShopHN ? '🟢' : '🟥';
    const dNodesMax = `👾${hacknet.nodesMaxed}`;
    const dNodesCount = hacknet.nodesCount;
    const dReserve = `💸${ns.formatNumber(reserve, 1)}`;
    ns.print(`${dStatus}${dNodesMax} ${dNodesCount}/${hnTCount} ${dReserve}}`);

    // ******** Shopping Loop
    if (isShopHN) {
      const list = hacknet.updateNodes;
      await hacknet.updatePorts();
      if (hacknet.done) ns.exit();
      // Process
      const { id, type, msg, cost } = list[0];
      if (Number.isFinite(cost) && cost) {
        // Styling
        const price = ns.formatNumber(cost - hnMoney(ns, reserve), 1);
        ns.print(`${id} ${msg} (${price})`);

        // Wait if we cant afford it
        while (hnMoney(ns, reserve) < cost) {
          await ns.sleep(TIME.HACKNET);
        }

        // Buy it if we can
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

/* ******** SAMPLE HACKNET
 *  This can be read on port data. List needs to be uncommented for full
 * sampleHacknet = {
 *    done: false,         // [false, true] if hacknets maxed to config
 *    nodesCount: 15,      // current amount of nodes purchased
 *    nodesLevel: 2811,    // sum of all node levels (Netburners requirement)
 *    nodesMaxed: 10,      // sum of all maxed nodes (lvl, ram, cores)
 *                         // Sorted shoping list of next best purchase
 *    list: [
 *      {
 *        id: 14,          // ID of the node purchase relates to
 *        type: 'LVL',     // [LVL, RAM, CORES, NEW] type of purcahse
 *        msg: '🌿 12',    // Display msg. (current + 1)
 *        cost: 601.34,    // Cost of the upgrade
 *        value: 1252.81,  // Seconds until cost is paid back (lower is better)
 *      },
 *      {
 *        type: 'RAM',
 *        msg: '🔋 2',
 *      },
 *      {
 *        type: 'CORES',
 *        msg: '🖲️ 2',
 *      },
 *      {
 *        type: 'NEW',
 *        msg: '💰 New',
 *      },
 *    ],
 *  };
 */
