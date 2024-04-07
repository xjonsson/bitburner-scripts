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
  const p = ns.getPlayer();
  ns.print(p);

  // while (true) {
  //   ns.clearLog();
  //   // const now = performance.now(); // DEBUG
  //   // updateHeaders(ns, now, start, networkRam);

  //   // ******** Each tick

  //   await ns.asleep(1000);
  // }
}
