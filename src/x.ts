/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

// ******** Styling

// function updateRow(ns: NS, s: ServerTarget, now: number, debug = '') {
//   ns.printf(
//     rowStyle,
//     s.level,
//     s.hostname,
//     /* eslint-disable */
//     s.sanity.action === 'HACK'
//       ? '💰'
//       : s.sanity.action === 'WEAK'
//       ? '🔓'
//       : s.sanity.action === 'GROW'
//       ? '🌿'
//       : s.sanity.action === 'RISK'
//       ? '🎲'
//       : '',
//     /* eslint-enable */
//     ns.formatNumber(s.money.max, 0),
//     ns.formatPercent(s.money.now / s.money.max, 0),
//     `+${ns.formatNumber(s.sec.now - s.sec.min, 1)}`,
//     s.sanity.tHack > 0 ? s.sanity.tHack : '',
//     /* eslint-disable */
//     s.sanity.action === 'HACK'
//       ? s.sanity.tWeak
//       : s.sanity.action === 'WEAK'
//       ? s.sanity.pWeak
//       : '',
//     s.sanity.action === 'HACK'
//       ? s.sanity.tGrow
//       : s.sanity.action === 'GROW'
//       ? s.sanity.pGrow
//       : '',
//     /* eslint-enable */
//     s.sanity.tWeakAG,
//     // formatTime(ns, s.hackTime),
//     formatTime(ns, s.weakTime),
//     // formatTime(ns, s.growTime),
//     ns.formatRam(s.sanity.tRam, 0),
//     ns.formatNumber(s.sanity.value, 0),
//     formatTime(ns, s.lastUpdate - now),
//     s.sanity.batches,
//     debug
//   );
// }

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  // const start = performance.now(); // DEBUG

  // ******** Single run code
  // let cLevel = -1;
  // const p = ns.getPlayer();
  // ns.print(p);

  const iLocations = ns.infiltration.getPossibleLocations();
  const iTargets = iLocations
    .map((iLoc: any) => {
      const nTarget = ns.infiltration.getInfiltration(iLoc.name);
      return {
        challenge: nTarget.difficulty,
        name: nTarget.location.name,
        city: nTarget.location.city,
        type: nTarget.location.types,
        // location: {
        //   costMult: 0,
        //   expMult: 0,
        //   techVendorMaxRam: 0,
        //   techVendorMinRam: 0,
        //   infiltrationData: {
        //     maxClearanceLevel: 12,
        //     startingSecurityLevel: 8.18,
        //   },
        // },
        // reward: {
        //   tradeRep: 23212.875441934077,
        //   sellCash: 355253920.8514189,
        //   SoARep: 2403.0552291421855,
        // },
      };
    })
    .sort((a: any, b: any) => a.challenge - b.challenge);

  iTargets.forEach((i: any) => {
    ns.print(`${i.challenge} | ${i.name} (${i.city}) [${i.type}]`);
  });

  // ns.formatNumber(
  //   ns.getPurchasedServerUpgradeCost(existing.name, existing.ram * 2),
  //   1
  // );

  // while (true) {
  //   ns.clearLog();
  //   // const now = performance.now(); // DEBUG
  //   // updateHeaders(ns, now, start, networkRam);

  //   // ******** Each tick
  //   // ns.print(`[Locations] ${iLocations.length}`);
  //   ns.print('========DEBUG========');
  //   // ns.print(iLocations[0]);
  //   // const iTarget = ns.infiltration.getInfiltration('AeroCorp');
  //   // ns.print(iTarget);

  //   await ns.asleep(1000);
  // }
}

// ******** SAMPLES
// const sampleLocation = { city: 'Aevum', name: 'AeroCorp' };
// const sampleTarget = {
//   location: {
//     city: 'Aevum',
//     costMult: 0,
//     expMult: 0,
//     name: 'AeroCorp',
//     types: ['Company'],
//     techVendorMaxRam: 0,
//     techVendorMinRam: 0,
//     infiltrationData: { maxClearanceLevel: 12, startingSecurityLevel: 8.18 },
//   },
//   reward: {
//     tradeRep: 23212.875441934077,
//     sellCash: 355253920.8514189,
//     SoARep: 2403.0552291421855,
//   },
//   difficulty: 3,
// };
