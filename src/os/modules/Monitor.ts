/* eslint-disable */
import { NS } from '@ns';
import { PORTS, DEPLOY } from '/os/configs';
import { formatTime } from '/os/utils/formatTime';
import { TServer } from '/os/modules/ServerTarget';
/* eslint-enable */

// ******** Globals
const { HACK } = DEPLOY;

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
  ns.setTitle('Monitor');

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
    ns.print(`[Times] ${formatTime(ns, now - start)} | 🎯${pup.targetCount}`);

    if (pup) {
      updateHeaders(ns);
      pup.targets.forEach((sst: TServer) => {
        const st = new TServer(ns, sst.hostname);
        let mMoney = '';
        if (st.money.now < st.money.max) {
          mMoney = ns.formatPercent(st.money.now / st.money.max, 0);
        }

        let mSec = '';
        if (st.sec.now > st.sec.min) {
          mSec = `+${ns.formatNumber(st.sec.now - st.sec.min, 1)}`;
        }

        let mPrepped = '✅';
        let mHack = ns.formatNumber(st.hTh, 0);
        let mWeak = ns.formatNumber(st.wTh, 0);
        let mGrow = ns.formatNumber(st.gTh, 0);
        let mWeakAG = ns.formatNumber(st.wagTh, 0);
        let mRam = ns.formatRam(st.bRam, 0);

        if (st.status.action !== HACK.A) {
          mPrepped = '❌';
          mHack = '';
          mWeak = st.pwTh > 0 ? ns.formatNumber(st.pwTh, 0) : '';
          mGrow = st.pgTh > 0 ? ns.formatNumber(st.pgTh, 0) : '';
          mWeakAG = ns.formatNumber(st.wagTh, 0);
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
          st.hChance < 1 ? ns.formatNumber(st.hChance, 1) : '', // Chance
          mPrepped, // Prep
          mHack, // Hack Threads
          mWeak, // Weak Threads
          mGrow, // Grow Threads
          mWeakAG, // Meak Threads (Weak after Grow)
          formatTime(ns, st.wTime), // Action Time
          mRam, // Batch Ram
          ns.formatNumber(st.bValue, 0), // VPRS (Value Per Ram Second)
          // st.batches, // 'HWGW', // HWGW (Batches)
          st.status.action // Action
        );
      });
    }

    // This creates a new server target every second. Only use for monitoring.
    await ns.asleep(1000);
  }
}
