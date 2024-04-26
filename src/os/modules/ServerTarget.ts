/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { ServerConstants } from '/os/data/constants';
import { getBitNodeMults } from '/os/modules/BitNodes';
import { Server } from '/os/modules/Server';
/* eslint-enable */

// ******** Globals
const { xSkim } = CONFIGS.hacking;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;
const { ServerBaseGrowthIncr: sBaseGrowth } = ServerConstants;
const { ServerMaxGrowthLog: sMaxGrowth } = ServerConstants;
const { ServerWeakenAmount: sWeakAmount } = ServerConstants;
export const X = {
  HACK: { A: 'HACK', I: '💰' },
  WEAK: { A: 'WEAK', I: '🔓' },
  GROW: { A: 'GROW', I: '🌿' },
  WAIT: { A: 'WAIT', I: '⏱️' },
  RISK: { A: 'RISK', I: '🎲' },
};

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
export class ServerTarget extends Server {
  ns: NS;
  pMult: number; // Player multiplier for growth
  pMultBN: number; // Bitnode multiplier for growth
  x: {
    hTime: number; // Hack Time
    wTime: number; // Weak Time
    gTime: number; // Grow Time
    hackChance: number; // The chance to hack the target
    pwThreads: number; // Prepare Weak Threads
    pgThreads: number; // Prepare Grow Threads
    hThreads: number; // Hack Threads
    wThreads: number; // Weak Threads
    gThreads: number; // Grow Threads
    wagThreads: number; // Weak after Grow Threads
    bRam: number; // RAM for a complete batch
    bValue: number; // Value of HWGW batch
  };
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
    this.x = {
      hTime: -1,
      wTime: -1,
      gTime: -1,
      hackChance: -1,
      pwThreads: -1,
      pgThreads: -1,
      hThreads: -1,
      wThreads: -1,
      gThreads: -1,
      wagThreads: -1,
      bRam: -1,
      bValue: -1,
    };
    this.batches = 0;
    this.status = { action: '', icon: '' };
    this.updateAt = update;

    // Initiatlize the batch
    if (update < performance.now()) this.update();
  }

  // ******** METHODS
  get nextUpdate(): number {
    return this.updateAt;
  }

  set setBatches(count: number) {
    this.batches = count;
  }

  setUpdate(delay: number) {
    if (delay < 10 * 1000) {
      this.updateAt = performance.now() + 10 * 1000;
    } else {
      this.updateAt = performance.now() + delay;
    }
  }

  // ******** Functions
  async update() {
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
    const bRam =
      hTh * xHackRam + wTh * xWeakRam + gTh * xGrowRam + wagTh * xWeakRam;

    this.x.hTime = hTime;
    this.x.wTime = hTime * 4;
    this.x.gTime = hTime * 3.2;
    this.x.hackChance = hChance;
    this.x.pwThreads = Math.ceil((sNow - sMin) / sWeakAmount);
    this.x.pgThreads = cgThreads(mNow, mMax, mGrow, sNow, 1, pMult, pMultBN);
    this.x.hThreads = hTh;
    this.x.wThreads = wTh;
    this.x.gThreads = gTh;
    this.x.wagThreads = wagTh;
    this.x.bRam = bRam;
    this.x.bValue =
      (mMax * xSkim) / ((hTime * 4) / 1000) / (bRam / ((hTime * 4) / 1000));
    this.batches = 0;

    if (sNow > sMin) this.status = { action: X.WEAK.A, icon: X.WEAK.I };
    else if (mNow < mMax) this.status = { action: X.GROW.A, icon: X.GROW.I };
    else if (hChance < 1) this.status = { action: X.RISK.A, icon: X.RISK.I };
    else if (sNow <= sMin && mNow >= mMax && hChance >= 1) {
      this.status = { action: X.HACK.A, icon: X.HACK.I };
    } else this.status = { action: X.WAIT.A, icon: X.WAIT.I };

    this.updateAt = performance.now();
  }
}
