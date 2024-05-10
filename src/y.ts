/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS } from '/os/configs';
import { getBNMults } from '/os/modules/BitNodes';
import { Print, Banner, Text, BG } from '/os/utils/colors';
import { HostingInfo } from '/os/modules/Hosting';
import { ControlInfo } from './os/modules/Control';
/* eslint-enable */

// ******** Globals
// const { SUCCESS, INFO, WARN, ERROR, DARK } = COLORS;
const { corpStart } = CONFIGS.shoppingPrices;
const { hTCount } = CONFIGS.hosting;

export function getPurchaseServerCost(ns: NS, ram: number): number {
  // TODO shift checks into
  const sRam = Math.round(ram);
  const upg = Math.max(0, Math.log(sRam) / Math.log(2) - 6);
  const bnMults = getBNMults(ns.getResetInfo().currentNode, 1);
  const { PurchasedServerCost: sCost, PurchasedServerSoftcap: sCap } = bnMults;
  const ans = sRam * 55000 * sCost * sCap ** upg;

  return ans;
}

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();

  // ******** DEBUG ONETIME START ********
  // const s1 = Scan.list(ns);
  // const s2 = Scan.route(ns, 'CSEC');
  // const s3 = Scan.routeTerminal(ns, 'CSEC');
  // const s4 = Scan.routeTerminal(ns, 'CSEC', true);
  ns.print('======== Samples ========');
  const cMax = corpStart / hTCount;
  ns.tprint(
    Banner.bMagenta(
      `${ns.formatNumber(corpStart, 2)} divided by ${hTCount}`,
      ns.formatNumber(cMax, 2),
    ),
  );

  for (let i = 2; i <= 1048576; i *= 2) {
    const cost = getPurchaseServerCost(ns, i);
    if (cost < cMax)
      ns.tprint(Banner.info(`COST ${i}GB`, ns.formatNumber(cost, 2)));
  }

  const c = ControlInfo.details(ns);
  ns.tprint(Banner.warning('Control', JSON.stringify(c)));

  // const h = HostingInfo.details(ns);
  // ns.tprint(h);

  await ns.asleep(1000);
}

export function autocomplete({ servers }: { servers: string[] }) {
  return servers;
}
