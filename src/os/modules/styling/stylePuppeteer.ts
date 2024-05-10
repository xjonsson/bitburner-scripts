/* eslint-disable */
import { NS } from '@ns';
import { DEPLOY } from '/os/configs';
import { TServer } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
import { Banner, BG, Text } from '/os/utils/colors';
/* eslint-enable */

// ******** Globals
const { HACK, WEAK, GROW, WAIT, RISK } = DEPLOY;

// ******** Styling
const rowStyle =
  '%4s ' + // Level
  '%-18s' + // Server
  '%1s ' + // Action Icon
  '%4s ' + // Cash
  '%4s ' + // Cash %
  '%5s ' + // Sec
  '%4s ' + // Chance
  // '%1s ' + // Prep
  '%4s ' + // Hack Threads
  '%4s ' + // Weak Threads
  '%4s ' + // Grow Threads
  '%4s ' + // Meak Threads (Weak after Grow)
  '%7s ' + // Action Time
  '%5s ' + // Batch Ram
  '%4s ' + // VPRS (Value Per Ram Second)
  '%4s ' + // HWGW (Batches)
  // '%5s ' + // Action
  '%9s'; // Update

export function updateHeaders(ns: NS) {
  ns.printf(
    rowStyle,
    Text.header('LVL'.padStart(4, ' ')), // Level
    Text.header('Server'.padEnd(18, ' ')), // Server
    Text.header('📝'), // Action Icon
    Text.header('Cash'), // Cash
    Text.header('%'.padStart(4, ' ')), // Cash %
    Text.header('+Sec'.padStart(5, ' ')), // Sec
    Text.header('HC'.padStart(4, ' ')), // Chance
    // Text.header('💎'), // Prep
    Text.header('Hack'), // Hack Threads
    Text.header('Weak'), // Weak Threads
    Text.header('Grow'), // Grow Threads
    Text.header('Meak'), // Meak Threads (Weak after Grow)
    Text.header('Time'.padStart(7, ' ')), // Action Time
    Text.header('Batch'), // Batch Ram
    Text.header('VPRS'), // VPRS (Value Per Ram Second)
    Text.header('HWGW'), // HWGW (Batches)
    // 'Step', // Action
    Text.header('Update'.padStart(9, ' ')), // Update
  );
}

export function updateRow(ns: NS, st: TServer, now: number) {
  const { now: mNow, max: mMax } = st.money;
  const { now: sNow, min: sMin } = st.sec;
  const { action: mA, icon: mI } = st.status;
  let mLevel = st.level.toString().padStart(4, ' '); // Level
  let mHostname = st.hostname.padEnd(18, ' '); // Server
  // const mIcon = `${BG.arg(mI)}`; // Action Icon
  const mCash = ns.formatNumber(mMax, 0).padStart(4, ' ');
  let mMoney = ''; // Cash %
  let mSec = ''; // Sec
  let mChance = st.hChance < 1 ? ns.formatNumber(st.hChance, 1) : ''; // Chance
  // let mPrepped = '❌'; // Prep
  let mHack = ns.formatNumber(st.hTh, 0);
  let mWeak = ns.formatNumber(st.wTh, 0);
  let mGrow = ns.formatNumber(st.gTh, 0);
  let mWeakAG = ns.formatNumber(st.wagTh, 0);
  let mTime = st.wTime > 0 ? formatTime(ns, st.wTime) : st.wTime;
  mTime = Text.yellow(mTime.toString().padStart(7, ' '));
  let mRam = '';
  const mVPRS = Text.insert(
    ns.formatNumber(st.bValue, 0).toString().padStart(4, ' '),
  ); // VPRS (Value Per Ram Second)
  const mBatches =
    st.batches > 0 ? Text.arg(st.batches.toString().padStart(4, ' ')) : ''; // HWGW (Batches)
  // let // mA, // Action
  let mUpdate = Number.isFinite(st.updateAt)
    ? formatTime(ns, st.updateAt - now)
    : 'ERROR'; // Update

  switch (mA) {
    case HACK.A: {
      mLevel = BG.magenta(mLevel);
      mHostname = Text.magenta(mHostname);
      // mPrepped = '✅';
      mHack = Text.magenta(mHack.padStart(4, ' '));
      mWeak = Text.magenta(mWeak.padStart(4, ' '));
      mGrow = Text.magenta(mGrow.padStart(4, ' '));
      mWeakAG = Text.magenta(mWeakAG.padStart(4, ' '));
      mRam = ns.formatRam(st.bRam, 0).toString().padStart(5, ' ');
      mRam = Text.magenta(mRam);
      mUpdate = Text.magenta(mUpdate.padStart(9, ' '));
      break;
    }
    case WEAK.A: {
      mLevel = BG.yellow(mLevel);
      mHostname = Text.yellow(mHostname);
      const sec = `+${ns.formatNumber(sNow - sMin, 1)}`.padStart(5, ' ');
      mSec = Text.yellow(sec);
      mHack = '';
      mWeak = st.pwTh > 0 ? ns.formatNumber(st.pwTh, 0) : '';
      mWeak = Text.yellow(mWeak.padStart(4, ' '));
      mGrow = st.pgTh > 0 ? ns.formatNumber(st.pgTh, 0) : '';
      mGrow = Text.bGreen(mGrow.padStart(4, ' '));
      mWeakAG = ns.formatNumber(st.wagTh, 0);
      mWeakAG = Text.yellow(mWeakAG.padStart(4, ' '));
      mUpdate = Text.yellow(mUpdate.padStart(9, ' '));
      break;
    }
    case GROW.A: {
      mLevel = BG.bGreen(mLevel);
      mHostname = Text.bGreen(mHostname);
      mMoney = Text.bGreen(ns.formatPercent(mNow / mMax, 0).padStart(4, ' '));
      mHack = '';
      mWeak = '';
      mGrow = st.pgTh > 0 ? ns.formatNumber(st.pgTh, 0) : '';
      mGrow = Text.bGreen(mGrow.padStart(4, ' '));
      mWeakAG = ns.formatNumber(st.wagTh, 0);
      mWeakAG = Text.yellow(mWeakAG.padStart(4, ' '));
      mTime = st.gTime > 0 ? formatTime(ns, st.gTime) : st.gTime;
      mTime = Text.bGreen(mTime.toString().padStart(7, ' '));
      mUpdate = Text.bGreen(mUpdate.padStart(9, ' '));
      break;
    }
    case WAIT.A: {
      mLevel = BG.show(mLevel);
      mHostname = Text.show(mHostname);
      mHack = '';
      mWeak = st.pwTh > 0 ? ns.formatNumber(st.pwTh, 0) : '';
      mGrow = st.pgTh > 0 ? ns.formatNumber(st.pgTh, 0) : '';
      mWeakAG = ns.formatNumber(st.wagTh, 0);
      mUpdate = Text.white(mUpdate.padStart(9, ' '));
      break;
    }
    case RISK.A: {
      mLevel = BG.red(mLevel);
      mHostname = Text.red(mHostname);
      mChance = Text.red(mChance);
      mHack = '';
      mWeak = st.pwTh > 0 ? ns.formatNumber(st.pwTh, 0) : '';
      mGrow = st.pgTh > 0 ? ns.formatNumber(st.pgTh, 0) : '';
      mWeakAG = ns.formatNumber(st.wagTh, 0);
      mUpdate = Text.red(mUpdate.padStart(9, ' '));
      break;
    }
    default:
  }

  ns.printf(
    rowStyle,
    mLevel, // Level
    mHostname, // Server
    mI, // Action Icon
    Text.insert(mCash), // Cash
    mMoney, // Cash %
    mSec, // Sec
    Text.insert(mChance.padStart(4, ' ')), // Chance
    // mPrepped, // Prep
    mHack, // Hack Threads
    mWeak, // Weak Threads
    mGrow, // Grow Threads
    mWeakAG, // Meak Threads (Weak after Grow)
    mTime, // Action Time
    mRam, // Batch Ram
    mVPRS, // VPRS (Value Per Ram Second)
    mBatches, // HWGW (Batches)
    // mA, // Action
    mUpdate, // Update
  );
}
