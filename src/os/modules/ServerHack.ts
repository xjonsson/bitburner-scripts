/* eslint-disable */
import { NS } from '@ns';
import { Server } from '/os/modules/Server';
import { CONFIGS, DEPLOY } from '/os/configs';
import { CONSTANTS } from '/os/data/constants';
import { Player } from '/os/modules/Player';
// import { formatTime } from '/os/utils/formatTime';
import { growthAnalyzeAccurate } from '/os/utils/growthAnalyzeAccurate';
// import { serversData } from '/os/data/servers';
import { Scan } from '/os/utils/scan';
/* eslint-enable */

const { xMinRam, xHackRam, xWeakRam, xGrowRam, xShareRam } = DEPLOY;
// const xReservedRam = CONFIGS.ramReserve.home;

export default class ServerHack extends Server {
  ns: NS;
  p: Player;
  canAttack: boolean;

  constructor(ns: NS, hostname: string) {
    super(ns, hostname);
    this.ns = ns;
    this.p = new Player(ns);

    // ******** Decision
    this.canAttack =
      this.money.now === this.money.max &&
      this.sec.now === this.sec.min &&
      this.hackChance() === 1;
  }

  // ******** Utility
  threads(script = 1.6): number {
    return Math.floor(this.ram.now / script);
  }

  get action(): any {
    // if (this.isHome || this.isServer) return 'HOME';
    // if (this.challenge > this.p.challenge) return this.distance.message;
    if (this.canAttack) return { action: 'HACK', msg: `💰 Hack` };
    if (this.sec.now > this.sec.min) return { action: 'WEAK', msg: `🔓 Weak` };
    if (this.money.now < this.money.max)
      return { action: 'GROW', msg: `🌿 Grow` };
    return { action: 'ERROR', msg: `❌ ERROR` };
  }

  // ******** Computed
  // NOTE: Heavy computed, move to attack server
  get value(): any {
    const batch = this.batch(1);
    const moneyPerBatch = this.money.max * CONFIGS.hacking.skim;
    const deploySeconds = batch.deployTime / 1000;
    const netGainPerSecond = moneyPerBatch / deploySeconds;
    const investedRamPerSecond = batch.batchRam / deploySeconds;
    const valuePerSecond = netGainPerSecond / investedRamPerSecond;

    return {
      total: valuePerSecond > 0 ? valuePerSecond : 0,
      time: deploySeconds,
      effort: investedRamPerSecond,
      batchRam: batch.batchRam,
      hackRam: batch.hackRam,
      weakRam: batch.weakRam,
      growRam: batch.growRam,
      batchTime: batch.batchTime,
      moneyMax: this.money.max,
      hackAmount: CONFIGS.hacking.skim,
      weakAfterGrowRam: batch.weakAfterGrowRam,
    };
  }

  // NOTE: Heavy computed
  batch(cores = 1, partial = true): any {
    const { buffer, delay } = CONFIGS.hacking;
    const deployStart = performance.now() + delay;
    const deployEnd = deployStart + this.weakTime + buffer;
    const deployTime = deployEnd - deployStart;
    const weakDeployAfterGrow = deployEnd - (this.weakTime + buffer);
    const growDeploy = deployEnd - buffer * 1 - (this.growTime + buffer);
    const weakDeploy = deployEnd - buffer * 2 - (this.weakTime + buffer);
    const hackDeploy = deployEnd - buffer * 3 - (this.hackTime + buffer);

    const { hackThreads } = this;
    const weakThreads = Math.ceil(hackThreads / 25);
    const growThreads = this.growThreads(cores, partial);
    const weakThreadsAfterGrow = this.weakThreadsAfterGrow(cores, partial);

    const batch = {
      deployStart,
      batchRam: 0,
      deployTime,
      hackThreads,
      hackRam: hackThreads * xHackRam,
      hackDeploy,
      weakThreads,
      weakRam: weakThreads * xWeakRam,
      weakDeploy,
      growThreads,
      growRam: growThreads * xGrowRam,
      growDeploy,
      weakThreadsAfterGrow,
      weakAfterGrowRam: weakThreadsAfterGrow * xWeakRam,
      weakDeployAfterGrow,
      deployEnd,
    };
    batch.batchRam =
      batch.hackRam + batch.weakRam + batch.growRam + batch.weakAfterGrowRam;
    return batch;
  }

  // ******** Computed Hack
  get hackThreads(): number {
    return Math.ceil(
      this.ns.hackAnalyzeThreads(
        this.hostname,
        this.money.max * CONFIGS.hacking.skim
      )
    );
  }

  get hackTime(): number {
    return this.ns.getHackTime(this.hostname);
  }

  hackChance(): number {
    return this.ns.hackAnalyzeChance(this.hostname);
  }

  get hackSecInc(): number {
    return this.ns.hackAnalyzeSecurity(this.hackThreads, this.hostname);
  }

  // ******** Computed Weak
  get weakThreads(): number {
    return Math.ceil(
      (this.sec.now - this.sec.min) / CONSTANTS.ServerWeakenAmount
    );
  }

  weakThreadsAfterGrow(cores = 1, batch = false): number {
    return Math.ceil(this.growThreads(cores, batch) / 12.5);
  }

  get weakTime(): number {
    return this.ns.getWeakenTime(this.hostname);
  }

  // ******** Computed Grow
  growThreads(cores = 1, batch = false): number {
    return growthAnalyzeAccurate(
      this.ns,
      this.p,
      this.sec.now,
      this.money.growth,
      this.money.max,
      batch ? this.money.max * (1 - CONFIGS.hacking.skim) : this.money.now,
      this.money.max,
      cores
    );
  }

  get growTime(): number {
    return this.ns.getGrowTime(this.hostname);
  }

  growSecInc(cores = 1): number {
    return this.ns.growthAnalyzeSecurity(
      this.growThreads(cores),
      this.hostname,
      cores
    );
  }
}
