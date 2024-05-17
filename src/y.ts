/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, CORE } from '/os/configs';
import { IBNMults } from '/os/modules/BitNodes';
import { Print, Banner, Text, BG } from '/os/utils/colors';
import { HostingInfo } from '/os/modules/Hosting';
import { ControlInfo } from './os/modules/Control';
/* eslint-enable */

// ******** Globals
// const { SUCCESS, INFO, WARN, ERROR, DARK } = COLORS;
// const { corpStart } = CONFIGS.shoppingPrices;
// const { hTCount } = CONFIGS.hosting;

interface IBN {
  bitnode: number;
  bnLevel: number;
  mults: IBNMults;
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
  // const c = ControlInfo.details(ns);
  // ns.tprint(Banner.warning('Control', JSON.stringify(c)));

  // const h = HostingInfo.details(ns);
  // ns.tprint(h);
  const bn = JSON.parse(ns.read(CORE.BN)) as IBN;
  ns.tprint(Banner.warning('Bitnode', JSON.stringify(bn)));
  ns.tprint(bn.mults.AgilityLevelMultiplier);

  await ns.asleep(1000);
}

export function autocomplete({ servers }: { servers: string[] }) {
  return servers;
}
