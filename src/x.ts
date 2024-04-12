/* eslint-disable */
import { NS } from '@ns';
import { Corporation } from '/os/modules/Corporation';
import { CORP } from '/os/configs';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

const { cName, fName, sName } = CORP;

// ******** Styling

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  // const start = performance.now(); // DEBUG
  let cycles = 0;

  // ******** Single run code
  const corp = new Corporation(ns);
  let phase = 1; // FIXME: should be 0 if not debugging
  let stage = 0; // FIXME: should be 0 if not debugging

  // const sample = ns.corporation.getCorporation();
  // const sCities = ns.corporation.getDivision(farmName).cities;
  // sCities.forEach((city) => {
  //   // ns.print(ns.corporation.getWarehouse(farmName, city));
  //   // ns.print(ns.corporation.getOffice(farmName, city));
  //   ns.print(ns.corporation.getMaterial(farmName, city, 'Hardware'));
  // });

  // ns.print(
  //   ns.corporation.getCorporation().numShares /
  //     ns.corporation.getCorporation().totalShares >=
  //     0.6
  // );
  // ns.print(sample);
  // ns.print(`P${phase} `, `S${stage}`);

  // ******** Loop run code
  while (true) {
    ns.clearLog();
    // const now = performance.now(); // DEBUG
    ns.print(`[Cycles] ${cycles} | [Wait] ${corp.wait}`);

    // ******** Each tick
    // ns.print(`[Time] ${formatTime(ns, now - start)}`);
    ns.print('========DEBUG========');

    // ******** EACH START
    while (ns.corporation.getCorporation().nextState === 'START') {
      // We check the state right before start
      ({ phase, stage } = corp.state(phase, stage));
      ns.print(`[Phase] ${phase} | [Stage] ${stage}`);
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'PURCHASE') {
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'PRODUCTION') {
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'EXPORT') {
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'SALE') {
      await ns.corporation.nextUpdate();
    }
    await corp.checkEnergyMorale(ns);

    cycles += 1;
    await ns.asleep(100);
  }
}
