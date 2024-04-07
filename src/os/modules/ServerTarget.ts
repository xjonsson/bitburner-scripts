/* eslint-disable */
import { NS } from '@ns';
import { Server } from '/os/modules/Server';
import { CONFIGS, DEPLOY } from '/os/configs';
import { CONSTANTS } from '/os/data/constants';
import { growthAnalyzeAccurate } from '/os/utils/growthAnalyzeAccurate';
/* eslint-enable */

const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;
const { hackSkim } = CONFIGS.hacking;

export default class ServerTarget extends Server {
  ns: NS;
  updatedAt: number;
  sanity: {
    action: string;
    value: number;
    tRam: number;
    tHack: number;
    tWeak: number;
    tGrow: number;
    tWeakAG: number;
    pWeak: number;
    pGrow: number;
    batches: number;
  };

  constructor(ns: NS, hostname: string) {
    super(ns, hostname);
    this.ns = ns;
    this.updatedAt = performance.now();
    this.sanity = {
      action: '',
      value: 0,
      tRam: 0,
      tHack: -1,
      tWeak: -1,
      tGrow: -1,
      tWeakAG: -1,
      pWeak: -1,
      pGrow: -1,
      batches: 0,
    };

    // Initiatlize the batch
    this.update = 0;
  }

  // ******** Batch properties
  get lastUpdate(): number {
    return this.updatedAt;
  }

  set update(delay: number) {
    const batch = this.getBatch(true, 1);
    this.sanity = {
      action: '',
      value: batch.dValue,
      tRam: batch.dRam,
      tHack: batch.tHack,
      tWeak: batch.tWeak,
      tGrow: batch.tGrow,
      tWeakAG: batch.tWeakAG,
      pWeak: 0,
      pGrow: 0,
      batches: this.sanity.batches,
    };

    if (this.sec.now > this.sec.min) {
      this.sanity.action = 'WEAK';
      this.sanity.pWeak = this.weakThreads;
    } else if (this.money.now < this.money.max) {
      this.sanity.action = 'GROW';
      this.sanity.pGrow = this.growThreads();
    } else if (
      this.sec.now <= this.sec.min &&
      this.money.now >= this.money.max &&
      this.hackChance >= 1
    ) {
      this.sanity.action = 'HACK';
    } else if (
      this.sec.now <= this.sec.min &&
      this.money.now >= this.money.max &&
      this.hackChance < 1
    ) {
      this.sanity.action = 'RISK';
    } else {
      this.sanity.action = '';
    }

    this.updatedAt = performance.now() + delay;
  }

  set setBatches(count: number) {
    this.sanity.batches = count;
  }

  // ******** Server properties
  get aWeak(): boolean {
    return this.sec.now > this.sec.min;
  }

  get aGrow(): boolean {
    return this.money.now < this.money.max;
  }

  get aHack(): boolean {
    return this.hackChance >= 1 && this.hackThreads > 0;
  }

  get aAttack(): boolean {
    return !this.aWeak && !this.aGrow && this.aHack;
  }

  // ******** Computed BATCH & VALUE
  getBatch(batch = false, cores = 1): any {
    // ******** Timings
    const { hackBuffer, hackDelay } = CONFIGS.hacking;
    const dMoney = this.money.max * hackSkim;
    const dStart = performance.now() + hackDelay;
    const dEnd = dStart + this.weakTime + hackBuffer;
    const dTime = dEnd - dStart;
    const dSeconds = dTime / 1000; // Deploy time in seconds
    const dGainPerSecond = dMoney / dSeconds; // Gain Per Second
    const dHack = dEnd - hackBuffer * 3 - (this.hackTime + hackBuffer);
    const dWeak = dEnd - hackBuffer * 2 - (this.weakTime + hackBuffer);
    const dGrow = dEnd - hackBuffer * 1 - (this.growTime + hackBuffer);
    const dWeakAG = dEnd - (this.weakTime + hackBuffer);

    // ******** Threads
    const tHack = this.hackThreads;
    const tWeak = Math.ceil(tHack / 25);
    const tGrow = this.growThreads(batch, cores);
    const tWeakAG = this.weakThreadsAfterGrow(batch, cores);

    // ******** Batch
    const result = {
      dRam: 0,
      dInvestment: 0,
      dValue: 0,
      dStart,
      dEnd,
      dTime,
      dHack,
      tHack,
      rHack: tHack * xHackRam,
      dWeak,
      tWeak,
      rWeak: tWeak * xWeakRam,
      dGrow,
      tGrow,
      rGrow: tGrow * xGrowRam,
      dWeakAG,
      tWeakAG,
      rWeakAG: tWeakAG * xWeakRam,
    };

    // ******** Value
    result.dRam = result.rHack + result.rWeak + result.rGrow + result.rWeakAG;
    result.dInvestment = result.dRam / dSeconds; // Invested Ram Per Second
    result.dValue = dGainPerSecond / result.dInvestment; // Value Per Second
    return result;
  }

  // ******** Computed HACK
  get hackChance(): number {
    return this.ns.hackAnalyzeChance(this.hostname);
  }

  get hackTime(): number {
    return this.ns.getHackTime(this.hostname);
  }

  get hackThreads(): number {
    return Math.ceil(
      this.ns.hackAnalyzeThreads(this.hostname, this.money.max * hackSkim)
    );
  }

  get hackSecInc(): number {
    return this.ns.hackAnalyzeSecurity(this.hackThreads, this.hostname);
  }

  // ******** Computed WEAK
  get weakTime(): number {
    return this.ns.getWeakenTime(this.hostname);
  }

  get weakThreads(): number {
    return Math.ceil(
      (this.sec.now - this.sec.min) / CONSTANTS.ServerWeakenAmount
    );
  }

  weakThreadsAfterGrow(batch = false, cores = 1): number {
    return Math.ceil(this.growThreads(batch, cores) / 12.5);
  }

  // ******** Computed GROW
  get growTime(): number {
    return this.ns.getGrowTime(this.hostname);
  }

  growThreads(batch = false, cores = 1): number {
    return growthAnalyzeAccurate(
      this.ns,
      this.sec.now,
      this.money.growth,
      this.money.max,
      batch ? this.money.max * (1 - hackSkim - 0.01) : this.money.now,
      this.money.max,
      cores
    );
  }

  growSecInc(batch = false, cores = 1): number {
    return this.ns.growthAnalyzeSecurity(
      this.growThreads(batch, cores),
      this.hostname,
      cores
    );
  }
}
