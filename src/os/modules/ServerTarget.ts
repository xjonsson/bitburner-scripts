/* eslint-disable */
import { NS } from '@ns';
import { Server } from '/os/modules/Server';
import { CONFIGS, DEPLOY } from '/os/configs';
import { CONSTANTS } from '/os/data/constants';
// import { Player } from '/os/modules/Player';
import { growthAnalyzeAccurate } from '/os/utils/growthAnalyzeAccurate';
/* eslint-enable */

const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;

export default class ServerTarget extends Server {
  ns: NS;

  constructor(ns: NS, hostname: string) {
    super(ns, hostname);
    this.ns = ns;
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

  get aAction(): string {
    if (this.aAttack) {
      return 'HACK';
    }
    if (this.aGrow) {
      return 'GROW';
    }
    if (this.aWeak) {
      return 'WEAK';
    }
    return '';
  }

  // ******** Computed BATCH & VALUE
  getBatch(batch = false, cores = 1): any {
    // ******** Timings
    const { buffer, delay } = CONFIGS.hacking;
    const dMoney = this.money.max * CONFIGS.hacking.skim;
    const dStart = performance.now() + delay;
    const dEnd = dStart + this.weakTime + buffer;
    const dTime = dEnd - dStart;
    const dSeconds = dTime / 1000; // Deploy time in seconds
    const dGainPerSecond = dMoney / dSeconds; // Gain Per Second
    const dHack = dEnd - buffer * 3 - (this.hackTime + buffer);
    const dWeak = dEnd - buffer * 2 - (this.weakTime + buffer);
    const dGrow = dEnd - buffer * 1 - (this.growTime + buffer);
    const dWeakAG = dEnd - (this.weakTime + buffer);

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
      this.ns.hackAnalyzeThreads(
        this.hostname,
        this.money.max * CONFIGS.hacking.skim
      )
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
      batch
        ? this.money.max * (1 - CONFIGS.hacking.skim - 0.01)
        : this.money.now,
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
