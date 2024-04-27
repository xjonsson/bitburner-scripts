/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT } from '/os/configs';
import { ControlCache } from '/os/modules/Cache';
import deployScripts from '/os/utils/deploy';
/* eslint-enable */

// ******** Globals
const mReserve = CONFIGS.moneyReserve;
const { hMoneyRatio, hTCount, hSRam, hTRam } = CONFIGS.hosting;

// ******** HOSTING UTILITY FUNCTIONS
function hMoney(ns: NS, r: number): number {
  return (ns.getServerMoneyAvailable('home') - mReserve - r) * hMoneyRatio;
}

// ******** HOSTING CLASS
export default class Hosting {
  ns: NS;
  done: boolean;
  nodesMaxed: number;
  ramTotal: number;
  ramHighest: number;
  shoppingList: Array<{
    id: number;
    name: string;
    ram: number;
    type: string;
    msg: string;
    cost: number;
  }>;

  // ******** CONSTRUCTOR
  constructor(ns: NS) {
    this.ns = ns;
    this.done = false;
    this.nodesMaxed = 0;
    this.ramTotal = 0;
    this.ramHighest = 0;
    this.shoppingList = this.updateNodes;
  }

  // ******** METHODS
  get nodesCount() {
    return this.ns.getPurchasedServers().length;
  }

  get updateNodes() {
    const nCount = this.nodesCount;
    const s: any = [];
    let nMaxed = 0;
    let rTotal = 0;
    let rHighest = 0;

    // ******** NODE NEW
    if (nCount < hTCount) {
      s.push({
        id: nCount,
        name: `ps-${nCount}`,
        ram: hSRam,
        type: 'NEW',
        msg: '💰 New',
        cost: this.ns.getPurchasedServerCost(hSRam),
      });
    }

    // ******** NODE EXISTING
    this.ns.getPurchasedServers().forEach((h: string, i: number) => {
      const node = {
        id: i,
        name: h,
        ram: this.ns.getServerMaxRam(h),
        type: 'MAX',
        msg: `🔋 ${this.ns.formatRam(hTRam, 0)}`,
        cost: 0,
      };

      if (node.ram >= hTRam) nMaxed += 1;
      if (node.ram > rHighest) rHighest = node.ram;

      if (node.ram < hTRam) {
        node.type = 'RAM';
        node.msg = `🌿 ${this.ns.formatRam(node.ram * 2, 0)}`;
        node.cost = this.ns.getPurchasedServerUpgradeCost(h, node.ram * 2);
        s.push(node);
      }

      rTotal += node.ram;
    });

    if (nMaxed >= hTCount) this.done = true;
    this.nodesMaxed = nMaxed;
    this.ramTotal = rTotal;
    this.ramHighest = rHighest;
    this.shoppingList = s.sort((a: any, b: any) => a.cost - b.cost);
    return s;
  }

  async updatePorts() {
    const portData = {
      done: this.done,
      nodesCount: this.nodesCount,
      nodesMaxed: this.nodesMaxed,
      ramTotal: this.ramTotal,
      ramHighest: this.ramHighest,
      // list: this.shoppingList, // NOTE: Add back for full shopping list
    };
    this.ns.clearPort(PORTS.HOSTING);
    await this.ns.tryWritePort(PORTS.HOSTING, portData);
  }

  // ******** FUNCTIONS
}

// ******** Main function
export async function main(ns: NS) {
  // ******** Setup
  const { bufferY } = LAYOUT;
  const { xW, xH, xOX, xOY } = LAYOUT.HOSTING;
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  // ns.disableLog('ALL');
  ns.disableLog('disableLog');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('purchaseServer');
  ns.disableLog('sleep');
  ns.disableLog('scp');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Hosting');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW - xOX, wHeight - xH - bufferY - xOY);

  // ******** Initialize (One Time Code)
  const hosting = new Hosting(ns);

  // ******** Primary (Loop Time Code)
  while (!hosting.done) {
    ns.clearLog();
    // ******** Consts
    const control = ControlCache.read(ns, 'control');
    const isShopHosting = control?.isShopHN || true;
    const reserve = control?.isReserve || 0;

    // ******** Display
    const dStatus = isShopHosting ? '🟢' : '🟥';
    const dNodesMax = `🖥️${hosting.nodesMaxed}`;
    const dNodesCount = hosting.nodesCount;
    const dReserve = `💸${ns.formatNumber(reserve, 1)}`;
    const dRamTotal = `🔋${ns.formatRam(hosting.ramTotal, 1)}`;
    const dRamHighest = `💎${ns.formatRam(hosting.ramHighest, 1)}`;
    ns.print(`${dStatus}${dNodesMax} ${dNodesCount}/${hTCount} ${dReserve}`);
    ns.print(`${dRamTotal} | ${dRamHighest}`);

    // ******** Shopping Loop
    if (isShopHosting) {
      const list = hosting.updateNodes;
      await hosting.updatePorts();
      if (hosting.done) ns.exit();

      // Process
      const { name, ram, type, msg, cost } = list[0];
      if (Number.isFinite(cost) && cost) {
        // Styling
        const price = ns.formatNumber(cost - hMoney(ns, reserve), 1);
        ns.print(`${name} ${msg} (${price})`);

        // Wait if we cant affort it
        while (hMoney(ns, reserve) < cost) {
          await ns.sleep(TIME.HOSTING);
        }

        // Buy it if we can
        switch (type) {
          case 'NEW':
            ns.purchaseServer(name, ram);
            deployScripts(ns, name);
            break;
          case 'RAM':
            ns.upgradePurchasedServer(name, ram * 2);
            break;
          default:
            break;
        }
      }
    }

    await ns.sleep(TIME.HOSTING);
  }
}

/* ******** SAMPLE HOSTING
 *  This can be read on port data. List needs to be uncommented for full
 * sampleHosting = {
 *    done: false,         // [false, true] if hosting maxed to config
 *    nodesMaxed: 10,      // sum of all maxed nodes (ram)
 *    ramTotal: 45472,     // sum of all purchased ram
 *    ramHighest: 4096,    // highets server ram available (hwgw batching)
 *                         // Sorted shoping list of next best purchase
 *    list: [
 *      {
 *        id: 14,          // ID of the node purchase relates to
 *        name: "ps-12",   // Name of the server
 *        ram: 32,         // Current level or ram
 *        type: 'RAM',     // [NEW, RAM] type of purcahse
 *        msg: '🌿 64GB',  // Display msg. (current * 2)
 *        cost: 601.34,    // Cost of the upgrade
 *      },
 *      {
 *        type: 'NEW',
 *        msg: '💰 New',
 *      },
 *    ],
 *  };
 */
