/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
import { formatTime } from '/os/utils/formatTime';
import { ServerTarget, X } from '/os/modules/ServerTarget';
/* eslint-enable */

// ******** Globals

// ******** Styling
// const rowStyle =
//   '%4s %-18s %2s %4s %4s|%5s| %4s %4s %4s %4s|%7s| %5s | %4s %9s %4s %5s';
const rowStyle =
  '%4s ' + // Level
  '%-18s' + // Server
  '%1s ' + // Action Icon
  '%4s ' + // Cash
  '%4s ' + // Cash %
  '%5s ' + // Sec
  '%3s ' + // Chance
  '%1s ' + // Prep
  '%4s ' + // Hack Threads
  '%4s ' + // Weak Threads
  '%4s ' + // Grow Threads
  '%4s ' + // Meak Threads (Weak after Grow)
  '%7s ' + // Action Time
  '%5s ' + // Batch Ram
  '%4s ' + // VPRS (Value Per Ram Second)
  // '%4s ' + // HWGW (Batches)
  '%5s '; // Action

function updateHeaders(ns: NS) {
  ns.printf(
    rowStyle,
    'LVL', // Level
    'Server', // Server
    '📝', // Action Icon
    'Cash', // Cash
    '%', // Cash %
    '+Sec', // Sec
    'HC', // Chance
    '💎', // Prep
    'Hack', // Hack Threads
    'Weak', // Weak Threads
    'Grow', // Grow Threads
    'Meak', // Meak Threads (Weak after Grow)
    'Time', // Action Time
    'Batch', // Batch Ram
    'VPRS', // VPRS (Value Per Ram Second)
    // 'HWGW', // HWGW (Batches)
    'Step' // Action
  );
}

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('getHackingLevel');
  ns.clearLog();
  ns.tail();

  // ******** Initialize (One Time Code)
  const start = performance.now();
  let pup: any = await ns.peek(PORTS.PUPPETEER);
  let cLevel = -1;

  // ******** Primary (Loop Time Code)
  while (true) {
    ns.clearLog();
    // ******** Consts
    const now = performance.now();
    const { hacking: pLevel } = ns.getPlayer().skills;
    if (pLevel > cLevel) {
      cLevel = pLevel;
      pup = await ns.peek(PORTS.PUPPETEER);
    }
    // const control = ControlCache.read(ns, 'control');
    // const focus = control?.hackTargets;

    // ******** Display
    ns.print(`[Time] ${formatTime(ns, now - start)} | 🎯${pup.targetCount}`);

    if (pup) {
      updateHeaders(ns);
      pup.targets.forEach((sst: ServerTarget) => {
        const st = new ServerTarget(ns, sst.hostname);
        let mMoney = '';
        if (st.money.now < st.money.max) {
          mMoney = ns.formatPercent(st.money.now / st.money.max, 0);
        }

        let mSec = '';
        if (st.sec.now > st.sec.min) {
          mSec = `+${ns.formatNumber(st.sec.now - st.sec.min, 1)}`;
        }

        let mPrepped = '✅';
        let mHack = ns.formatNumber(st.x.hThreads, 0);
        let mWeak = ns.formatNumber(st.x.wThreads, 0);
        let mGrow = ns.formatNumber(st.x.gThreads, 0);
        let mWeakAG = ns.formatNumber(st.x.wagThreads, 0);
        let mRam = ns.formatRam(st.x.bRam, 0);

        if (st.status.action !== X.HACK.A) {
          mPrepped = '❌';
          mHack = '';
          mWeak = st.x.pwThreads > 0 ? ns.formatNumber(st.x.pwThreads, 0) : '';
          mGrow = st.x.pgThreads > 0 ? ns.formatNumber(st.x.pgThreads, 0) : '';
          mWeakAG = ns.formatNumber(st.x.wagThreads, 0);
          mRam = '';
        }

        ns.printf(
          rowStyle,
          st.level, // Level
          st.hostname, // Server
          st.status.icon, // Action Icon
          ns.formatNumber(st.money.max, 0), // Cash
          mMoney, // Cash %
          mSec, // Sec
          st.x.hackChance < 1 ? ns.formatNumber(st.x.hackChance, 1) : '', // Chance
          mPrepped, // Prep
          mHack, // Hack Threads
          mWeak, // Weak Threads
          mGrow, // Grow Threads
          mWeakAG, // Meak Threads (Weak after Grow)
          formatTime(ns, st.x.wTime), // Action Time
          mRam, // Batch Ram
          ns.formatNumber(st.x.bValue, 0), // VPRS (Value Per Ram Second)
          // st.batches, // 'HWGW', // HWGW (Batches)
          st.status.action // Action
        );
      });
    }

    // This creates a new server target every second. Only use for monitoring.
    await ns.asleep(1000);
  }
}
