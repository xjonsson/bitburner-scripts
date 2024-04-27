/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { ServerConstants } from '/os/data/constants';
import { getBitNodeMults } from '/os/modules/BitNodes';
import { Server } from '/os/modules/Server';
/* eslint-enable */

// ******** Globals
const { xSkim } = CONFIGS.hacking;
const { HACK, WEAK, GROW, WAIT, RISK, ERROR } = DEPLOY;
const { ServerBaseGrowthIncr: sBaseGrowth } = ServerConstants;
const { ServerMaxGrowthLog: sMaxGrowth } = ServerConstants;
const { ServerWeakenAmount: sWeakAmount } = ServerConstants;

// ******** SERVER TARGET UTILITY FUNCTIONS
// ******** Computed GROWTH ON SERVER
function cgThreads(
  _mNow: number,
  _mMax: number,
  mGrow: number,
  secNow: number,
  c = 1,
  pMult: number,
  pMultBN: number
): number {
  // const { hacking_grow: pGrow } = this.ns.getPlayer().mults;
  // const { growth } = this.money;
  const sNow = secNow ?? 100;
  const mMax = _mMax ?? 1;
  let mNow = _mNow; // Start Money
  if (!mGrow) return Infinity;
  if (mNow < 0) mNow = 0; // servers "can't" have less than 0 dollars on them
  if (mMax <= mNow) return 0; // no growth --> no threads

  let adj = Math.log1p(sBaseGrowth / sNow);
  if (adj >= sMaxGrowth) {
    adj = sMaxGrowth;
  }

  const k =
    adj *
    ((mGrow / 100) * pMultBN) *
    pMult *
    (1 + (c - 1) * (1 / 16)) *
    Math.max(1, 0);

  const guess = (mMax - mNow) / (1 + (mMax * (1 / 16) + mNow * (15 / 16)) * k);
  let x = guess;
  let diff;
  do {
    const ox = mNow + x;
    const newx = (x - ox * Math.log(ox / mMax)) / (1 + ox * k);
    diff = newx - x;
    x = newx;
  } while (diff < -1 || diff > 1);
  const ccycle = Math.ceil(x);
  if (ccycle - x > 0.999999) {
    const fcycle = ccycle - 1;
    if (mMax <= (mNow + fcycle) * Math.exp(k * fcycle)) {
      return fcycle;
    }
  }
  if (ccycle >= x + ((diff <= 0 ? -diff : diff) + 0.000001)) {
    return ccycle;
  }
  if (mMax <= (mNow + ccycle) * Math.exp(k * ccycle)) {
    return ccycle;
  }
  return ccycle + 1;
}

// ******** SERVER TARGET CLASS
export class TServer extends Server {
  ns: NS;
  pMult: number; // Player multiplier for growth
  pMultBN: number; // Bitnode multiplier for growth
  hTime: number; // Hack Time
  wTime: number; // Weak Time
  gTime: number; // Grow Time
  hChance: number; // Hack Chance
  pwTh: number; // Prepare Weak Threads
  pgTh: number; // Prepare Grow Threads
  hTh: number; // Hack Threads
  wTh: number; // Weak Threads
  gTh: number; // Grow Threads
  wagTh: number; // Weak after Grow Threads
  bRam: number; // Batch RAM: Ram for a complete batch
  bValue: number; // Batch Value: Value of HWGW batch
  batches: number; // Number of active batches
  status: { action: string; icon: string };
  updateAt: number; // Next update

  // ******** CONSTRUCTOR
  constructor(ns: NS, hostname: string, update = 0) {
    super(ns, hostname);
    this.ns = ns;
    this.pMult = ns.getPlayer().mults.hacking_grow;
    this.pMultBN =
      getBitNodeMults(ns.getResetInfo().currentNode, 1).ServerGrowthRate || 1;
    this.hTime = -1;
    this.wTime = -1;
    this.gTime = -1;
    this.hChance = -1;
    this.pwTh = -1;
    this.pgTh = -1;
    this.hTh = -1;
    this.wTh = -1;
    this.gTh = -1;
    this.wagTh = -1;
    this.bRam = -1;
    this.bValue = -1;
    this.batches = 0;
    this.status = { action: WAIT.A, icon: WAIT.I };
    this.updateAt = update;

    if (update < performance.now()) this.update();
  }

  // ******** METHODS
  set setBatches(count: number) {
    this.batches = count;
  }

  setUpdate(delay: number) {
    this.updateAt = performance.now() + delay;
  }

  // ******** Functions
  update() {
    // Consts & Calculations
    const { hostname, pMult, pMultBN } = this;
    const { now: sNow, min: sMin } = this.sec;
    const { now: mNow, max: mMax, growth: mGrow } = this.money;
    const mBatch = mMax * (1 - xSkim - 0.01);
    const hChance = this.ns.hackAnalyzeChance(this.hostname);
    const hTime = this.ns.getHackTime(this.hostname);
    const hTh = Math.ceil(this.ns.hackAnalyzeThreads(hostname, mMax * xSkim));
    const wTh = Math.ceil(hTh / 25);
    const gTh = cgThreads(mBatch, mMax, mGrow, sNow, 1, pMult, pMultBN);
    const wagTh = Math.ceil(gTh / 12.5);
    const bRam = hTh * HACK.R + wTh * WEAK.R + gTh * GROW.R + wagTh * WEAK.R;

    this.hTime = hTime;
    this.wTime = hTime * 4;
    this.gTime = hTime * 3.2;
    this.hChance = hChance;
    this.pwTh = Math.ceil((sNow - sMin) / sWeakAmount);
    this.pgTh = cgThreads(mNow, mMax, mGrow, sNow, 1, pMult, pMultBN);
    this.hTh = hTh;
    this.wTh = wTh;
    this.gTh = gTh;
    this.wagTh = wagTh;
    this.bRam = bRam;
    this.bValue =
      (mMax * xSkim) / ((hTime * 4) / 1000) / (bRam / ((hTime * 4) / 1000));
    this.batches = 0;

    if (sNow > sMin) this.status = { action: WEAK.A, icon: WEAK.I };
    else if (mNow < mMax) this.status = { action: GROW.A, icon: GROW.I };
    else if (hChance < 1) this.status = { action: RISK.A, icon: RISK.I };
    else if (sNow <= sMin && mNow >= mMax && hChance >= 1) {
      this.status = { action: HACK.A, icon: HACK.I };
    } else if (Number.isNaN(this.updateAt)) {
      this.status = { action: ERROR.A, icon: ERROR.I };
    } else this.status = { action: WAIT.A, icon: WAIT.I };

    // this.updateAt = performance.now();
    return this;
  }
}
