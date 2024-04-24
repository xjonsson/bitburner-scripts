/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { ServerConstants } from '/os/data/constants';
import { Server } from '/os/modules/Server';
import { getBitNodeMults } from '/os/modules/BitNodes';
/* eslint-enable */

// ******** Globals
const { xSkim, xBuffer, xDelay } = CONFIGS.hacking;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;
const { ServerBaseGrowthIncr: sBaseGrowth } = ServerConstants;
const { ServerMaxGrowthLog: sMaxGrowth } = ServerConstants;
const { ServerWeakenAmount: sWeakAmount } = ServerConstants;
export const X = {
  HACK: {
    A: 'HACK',
    I: '💰',
  },
  WEAK: {
    A: 'WEAK',
    I: '🔓',
  },
  GROW: {
    A: 'GROW',
    I: '🌿',
  },
  CHECK: {
    A: 'CHECK',
    I: '🔎',
  },
  WAIT: {
    A: 'WAIT',
    I: '⏱️',
  },
  RISK: {
    A: 'RISK',
    I: '🎲',
  },
  ERROR: {
    A: 'ERROR',
    I: '🟥',
  },
};

// ******** SERVER TARGET UTILITY FUNCTIONS

// ******** Computed GROW
function calcCycleForGrowth(
  _startMoney: number,
  _targetMoney: number,
  mGrow: number,
  secNow: number,
  c = 1,
  pMult: number,
  pMultBN: number
): number {
  // const { hacking_grow: pGrow } = this.ns.getPlayer().mults;
  // const { growth } = this.money;
  const sNow = secNow ?? 100;
  const mMax = _targetMoney ?? 1;
  let targetMoney = _targetMoney; // Target Money
  let startMoney = _startMoney; // Start Money
  if (!mGrow) return Infinity;
  if (startMoney < 0) startMoney = 0; // servers "can't" have less than 0 dollars on them
  if (targetMoney > mMax) targetMoney = mMax; // can't grow a server to more than its moneyMax
  if (targetMoney <= startMoney) return 0; // no growth --> no threads

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

  const guess =
    (targetMoney - startMoney) /
    (1 + (targetMoney * (1 / 16) + startMoney * (15 / 16)) * k);
  let x = guess;
  let diff;
  do {
    const ox = startMoney + x;
    const newx = (x - ox * Math.log(ox / targetMoney)) / (1 + ox * k);
    diff = newx - x;
    x = newx;
  } while (diff < -1 || diff > 1);
  const ccycle = Math.ceil(x);
  if (ccycle - x > 0.999999) {
    const fcycle = ccycle - 1;
    if (targetMoney <= (startMoney + fcycle) * Math.exp(k * fcycle)) {
      return fcycle;
    }
  }
  if (ccycle >= x + ((diff <= 0 ? -diff : diff) + 0.000001)) {
    return ccycle;
  }
  if (targetMoney <= (startMoney + ccycle) * Math.exp(k * ccycle)) {
    return ccycle;
  }
  return ccycle + 1;
}

function growThreads(
  b = false,
  c = 1,
  _mNow: number,
  mMax: number,
  mGrow: number,
  secNow: number,
  pMult: number,
  pMultBN: number
): number {
  const mNow = b ? mMax * (1 - xSkim - 0.01) : _mNow;
  return calcCycleForGrowth(mNow, mMax, mGrow, secNow, c, pMult, pMultBN);
}

// ******** SERVER TARGET CLASS
export class ServerTarget extends Server {
  ns: NS;
  pMult: number; // Player multiplier for growth
  pMultBN: number; // Bitnode multiplier for growth
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
  batches: number; // Number of active batches
  status: { action: string; icon: string };
  updateAt: number; // Next update

  // ******** CONSTRUCTOR
  constructor(ns: NS, hostname: string) {
    super(ns, hostname);
    this.ns = ns;
    this.pMult = ns.getPlayer().mults.hacking_grow;
    this.pMultBN =
      getBitNodeMults(ns.getResetInfo().currentNode, 1).ServerGrowthRate || 1;
    this.hTime = ns.getHackTime(hostname);
    this.wTime = this.hTime * 4;
    this.gTime = this.hTime * 3.2;
    this.hackChance = this.ns.hackAnalyzeChance(this.hostname);
    this.pwThreads = Math.ceil((this.sec.now - this.sec.min) / sWeakAmount);
    this.pgThreads = growThreads(
      false,
      1,
      this.money.now,
      this.money.max,
      this.money.growth,
      this.sec.now,
      this.pMult,
      this.pMultBN
    );
    this.hThreads = Math.ceil(
      ns.hackAnalyzeThreads(hostname, this.money.max * xSkim)
    );
    this.wThreads = Math.ceil(this.hThreads / 25);
    this.gThreads = growThreads(
      true,
      1,
      this.money.now,
      this.money.max,
      this.money.growth,
      this.sec.now,
      this.pMult,
      this.pMultBN
    );
    this.wagThreads = Math.ceil(this.gThreads / 12.5);
    this.bRam =
      this.hThreads * xHackRam +
      this.wThreads * xWeakRam +
      this.gThreads * xGrowRam +
      this.wagThreads * xWeakRam;
    this.bValue =
      (this.money.max * xSkim) /
      (this.wTime / 1000) /
      (this.bRam / (this.wTime / 1000));
    this.batches = 0;
    const { a, i } = this.getStatus();
    this.status = {
      action: a,
      icon: i,
    };
    this.updateAt = performance.now();

    // Initiatlize the batch
    // this.update = 0;
  }

  // ******** METHODS
  get nextUpdate(): number {
    return this.updateAt;
  }

  getStatus(): { a: string; i: string } {
    if (this.sec.now > this.sec.min) {
      this.status = { action: X.WEAK.A, icon: X.WEAK.I };
      return { a: X.WEAK.A, i: X.WEAK.I };
    }

    if (this.money.now < this.money.max) {
      this.status = { action: X.GROW.A, icon: X.GROW.I };
      return { a: X.GROW.A, i: X.GROW.I };
    }

    if (this.hackChance < 1) {
      this.status = { action: X.RISK.A, icon: X.RISK.I };
      return { a: X.RISK.A, i: X.RISK.I };
    }

    if (
      this.sec.now <= this.sec.min &&
      this.money.now >= this.money.max &&
      this.hackChance >= 1
    ) {
      this.status = { action: X.HACK.A, icon: X.HACK.I };
      return { a: X.HACK.A, i: X.HACK.I };
    }

    this.status = { action: X.WAIT.A, icon: X.WAIT.I };
    return { a: X.WAIT.A, i: X.WAIT.I };
  }

  set update(delay: number) {
    // const delay = _delay > 1000 ? _delay : 1000;
    // const batch = this.getBatch(true, 1);
    this.hTime = this.ns.getHackTime(this.hostname);
    this.wTime = this.hTime * 4;
    this.gTime = this.hTime * 3.2;
    this.hackChance = this.ns.hackAnalyzeChance(this.hostname);
    // this.pwThreads = weakThreads(this.sec.now, this.sec.min);
    this.pwThreads = Math.ceil((this.sec.now - this.sec.min) / sWeakAmount);
    this.pgThreads = growThreads(
      false,
      1,
      this.money.now,
      this.money.max,
      this.money.growth,
      this.sec.now,
      this.pMult,
      this.pMultBN
    );
    this.hThreads = Math.ceil(
      this.ns.hackAnalyzeThreads(this.hostname, this.money.max * xSkim)
    );
    this.wThreads = Math.ceil(this.hThreads / 25);
    this.gThreads = growThreads(
      true,
      1,
      this.money.now,
      this.money.max,
      this.money.growth,
      this.sec.now,
      this.pMult,
      this.pMultBN
    );
    this.wagThreads = Math.ceil(this.gThreads / 12.5);
    this.bRam =
      this.hThreads * xHackRam +
      this.wThreads * xWeakRam +
      this.gThreads * xGrowRam +
      this.wagThreads * xWeakRam;
    this.bValue =
      (this.money.max * xSkim) /
      (this.wTime / 1000) /
      (this.bRam / (this.wTime / 1000));
    this.batches = 0;

    const { a, i } = this.getStatus();
    this.status = {
      action: a,
      icon: i,
    };
    this.updateAt = performance.now() + delay;
  }

  set setBatches(count: number) {
    this.batches = count;
  }
}
