/* eslint-disable */
import { NS } from '@ns';
import { Corp } from '/os/modules/Corporation';
import { CORP } from '/os/configs';
/* eslint-enable */

const { corpName, farmName, smokeName } = CORP;
const UPGRADES = [
  'FocusWires', // 0
  'Neural Accelerators', // 1
  'Speech Processor Implants', // 2
  'Nuoptimal Nootropic Injector Implants', // 3
  'Smart Factories', // 4
  'Smart Storage', // 5
  'DreamSense', // 6
  'Wilson Analytics', // 7
  'ABC SalesBots', // 8
  'Project Insight', // 9
];

// ******** Styling

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  // const start = performance.now(); // DEBUG

  // ******** Single run code
  const c = new Corp(ns);

  // const sample = ns.corporation.getCorporation();
  const sCities = ns.corporation.getDivision(farmName).cities;
  // sCities.forEach((city) => {
  //   // ns.print(ns.corporation.getWarehouse(farmName, city));
  //   // ns.print(ns.corporation.getOffice(farmName, city));
  //   ns.print(ns.corporation.getMaterial(farmName, city, 'Hardware'));
  // });

  ns.print(
    ns.corporation.getCorporation().numShares /
      ns.corporation.getCorporation().totalShares >=
      0.6
  );
  // ns.print(sample);
  ns.print(`P${c.phase} `, `S${c.stage}`);

  // ******** Loop run code
  // while (true) {
  //   ns.clearLog();
  //   // const now = performance.now(); // DEBUG

  //   // ******** Each tick
  //   ns.print('========DEBUG========');

  //   await ns.asleep(1000);
  // }
}
