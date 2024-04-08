/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo, Server } from '/os/modules/Server';
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
        expMult: nTarget.location.expMult,
        security: nTarget.location.infiltrationData.maxClearanceLevel,
        rewardRep: nTarget.reward.tradeRep,
        rewardCash: nTarget.reward.sellCash,
        rewardSOA: nTarget.reward.SoARep,
      };
    })
    .sort((a: any, b: any) => b.rewardRep - a.rewardRep);

  const rowStyle = '%3s %-9s %4s %1s %-25s %2s %4s %4s %4s';
  ns.printf(
    rowStyle,
    'lvl',
    'Location',
    '💪🎓💼',
    'x',
    'Company',
    'C',
    'Rep',
    'Cash',
    'SoA'
  );

  iTargets.forEach((i: any) => {
    // ns.print(`${i.challenge} | ${i.name} (${i.city}) [${i.type}]`);
    ns.printf(
      rowStyle,
      ns.formatNumber(i.challenge, 0),
      i.city,
      `${i.type.includes('Gym') ? '💪' : '❌'}${
        i.type.includes('University') ? '🎓' : '❌'
      }${i.type.includes('Company') ? '💼' : '❌'}`,
      i.expMult,
      i.name,
      ns.formatNumber(i.security, 0),
      ns.formatNumber(i.rewardRep, 0),
      ns.formatNumber(i.rewardCash, 0),
      ns.formatNumber(i.rewardSOA, 0)
    );
  });

  const check = ServerInfo.list(ns).includes('w0r1d_d43m0n');

  // const check = ns.getServer('w0r1d_d43m0n');
  ns.print(check);

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
