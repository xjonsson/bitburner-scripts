/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT } from '/os/configs';
import { ControlCache, HostingCache, IHList } from '/os/modules/Cache';
import deployScripts from '/os/utils/deploy';
import { Banner, BG, Text } from '/os/utils/colors';
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
  id: string;
  ns: NS;
  done: boolean;
  nodesCount: number;
  nodesMaxed: number;
  ramTotal: number;
  ramHighest: number;
  shoppingList: IHList[];

  // ******** CONSTRUCTOR
  constructor(ns: NS) {
    // ******** Defaults
    this.id = 'hosting';
    this.ns = ns;
    this.done = false;
    this.nodesCount = ns.getPurchasedServers().length;
    this.nodesMaxed = 0;
    this.ramTotal = 0;
    this.ramHighest = 0;
    this.shoppingList = this.updateNodes();
  }

  // ******** METHODS
  updateNodes(): IHList[] {
    const { nodesCount: nCount } = this;
    const s: IHList[] = [];
    let nMaxed = 0;
    let rTotal = 0;
    let rHighest = 0;

    // ******** NODE NEW
    if (nCount < hTCount) {
      s.push({
        id: nCount,
        name: `ps-${nCount}`,
        type: 'NEW',
        ram: hSRam,
        msg: '💰 New',
        cost: this.ns.getPurchasedServerCost(hSRam),
      });
    }

    // ******** NODE EXISTING
    this.ns.getPurchasedServers().forEach((h: string, i: number) => {
      const node = {
        id: i,
        name: h,
        type: 'MAX',
        ram: this.ns.getServerMaxRam(h),
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
    this.shoppingList = s.sort((a, b) => a.cost - b.cost);
    this.updatePorts();
    return s;
  }

  updatePorts() {
    return HostingCache.update(
      this.ns,
      this.done,
      this.nodesCount,
      this.nodesMaxed,
      this.ramTotal,
      this.ramHighest,
      this.shoppingList,
    );
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
    const isShopH = control?.isShopH || false;
    const reserve = control?.isReserve || 0;
    const { nodesMaxed, nodesCount, ramTotal, ramHighest } = hosting;

    // ******** Display
    const mStatus = isShopH ? BG.info(' 🖥️ ') : BG.warning(' 🖥️ ');
    const mMax = BG.normal(` ⭐️${nodesMaxed} `);
    const mCount = BG.arg(` ${nodesCount}/${hTCount} `);
    const mRTotal = BG.show(` 🔋${ns.formatRam(ramTotal, 1)} `);
    const mRHigh = BG.show(` 💎${ns.formatRam(ramHighest, 1)} `);
    const nReserve = `💸${Text.arg(ns.formatNumber(reserve, 1))}`;
    ns.print(`${mRTotal}${mRHigh}`);
    ns.print(`${mStatus}${mMax}${mCount} ${nReserve}`);

    // ******** Shopping Loop
    if (isShopH) {
      const list = hosting.updateNodes();
      if (hosting.done) break;
      const { name, ram, type, msg, cost } = list[0];
      if (Number.isFinite(cost) && cost) {
        const price = ns.formatNumber(cost - hMoney(ns, reserve), 1);
        ns.print(Banner.info(`${name}`, `${msg} (${price})`));
        while (hMoney(ns, reserve) < cost) await ns.sleep(TIME.HOSTING);

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
  const msg = `Complete ${hTCount} Nodes at Ram ${ns.formatRam(hTRam, 2)}`;
  ns.tprint(Banner.insert('Hacknet', `${msg}`));
}

export const HostingInfo = {
  details(ns: NS) {
    return new Hosting(ns);
  },
};

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
