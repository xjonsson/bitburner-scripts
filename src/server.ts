/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import { CONSTANTS } from './zCalc.js';
import { growthAnalyzeAccurate } from './zCalc.js';
import { timeFormat } from './zUtils.js';
/* eslint-enable */

const hackRamR = 1.71;
const weakRamR = 1.76;
const growRamR = 1.76;
const shareRamR = 4.3;

export default class Server {
  ns: NS;
  p: Player;
  hostname: string;

  constructor(ns: NS, player: Player, hostname: string) {
    this.ns = ns;
    this.p = player;
    this.hostname = hostname;
  }

  get data(): any {
    return this.ns.getServer(this.hostname);
  }

  // ******** Classification
  get home(): boolean {
    return this.data.hostname === 'home';
  }

  get server(): boolean {
    return this.data.purchasedByPlayer;
  }

  get bot(): boolean {
    return this.server || (this.root && this.ram.max > 0);
  }

  get target(): boolean {
    return (
      !this.home &&
      !this.server &&
      this.money.max > 0 &&
      this.open >= this.challenge &&
      this.root &&
      this.level <= this.p.challenge
    );
  }

  get reclaimed(): boolean {
    return !this.home && !this.server && this.root && this.ram.max > 0;
  }

  // ******** Decision
  get canReclaim(): boolean {
    return this.challenge <= this.p.challenge;
  }

  get canDoor(): boolean {
    return (
      this.level <= this.p.hacking && this.root && !this.server && !this.home
    );
  }

  get canFocus(): boolean {
    return (
      this.level >= this.p.hackingRange.min &&
      this.level <= this.p.hackingRange.max
    );
  }

  get canAttack(): boolean {
    return (
      this.money.now === this.money.max &&
      this.sec.now === this.sec.min &&
      this.hackChance === 1
    );
  }

  get action(): string {
    if (this.canAttack) {
      return 'Hack';
    }
    if (this.sec.now > this.sec.min) {
      return 'Weak';
    }
    if (this.money.now < this.money.max) {
      return 'Grow';
    }
    return '';
  }

  // ******** Computed
  // TODO: get value
  // TODO: get valueTime
  // TODO: get valueEffort
  get value(): object {
    const batch = this.batch(1);
    const moneyPerBatch = this.money.max * configs.hackAmount;
    const ramPerBatchSecond = batch.batchRam * (batch.deployTime / 1000);
    const roiPerRamSecond =
      moneyPerBatch / ramPerBatchSecond / (batch.deployTime / 1000);
    return {
      total: roiPerRamSecond,
      time: batch.deployTime,
      effort: ramPerBatchSecond,
      hackRam: batch.hackRam,
      weakRam: batch.weakRam,
      growRam: batch.growRam,
      batchTime: batch.batchTime,
      moneyMax: this.money.max,
      hackamount: configs.hackAmount,
      weakAfterGrowRam: batch.weakAfterGrowRam,
    };
  }

  threads(scriptRam: number): number {
    return Math.floor(this.ram.now / scriptRam);
  }

  batch(cores = 1): any {
    const buffer = configs.hackBuffer;
    const deployStart = performance.now() + configs.hackDelay;
    const deployEnd = deployStart + this.weakTime + buffer;
    const deployTime = deployEnd - deployStart;
    const weakDeployAfterGrow = deployEnd - (this.weakTime + buffer);
    const growDeploy = deployEnd - buffer * 1 - (this.growTime + buffer);
    const weakDeploy = deployEnd - buffer * 2 - (this.weakTime + buffer);
    const hackDeploy = deployEnd - buffer * 3 - (this.hackTime + buffer);

    const { hackThreads } = this;
    const weakThreads = Math.ceil(hackThreads / 25);
    const growThreads = this.growThreads(cores, true);
    const weakThreadsAfterGrow = this.weakThreadsAfterGrow(cores, true);

    const batch = {
      deployStart,
      batchRam: -1,
      deployTime,
      hackThreads,
      hackRam: hackThreads * hackRamR,
      hackDeploy,
      weakThreads,
      weakRam: weakThreads * weakRamR,
      weakDeploy,
      growThreads,
      growRam: growThreads * growRamR,
      growDeploy,
      weakThreadsAfterGrow,
      weakAfterGrowRam: weakThreadsAfterGrow * weakRamR,
      weakDeployAfterGrow,
      deployEnd,
    };
    batch.batchRam =
      batch.hackRam + batch.weakRam + batch.growRam + batch.weakAfterGrowRam;
    return batch;
  }

  get hackAmountSingle(): number {
    return this.ns.hackAnalyze(this.hostname);
  }

  get hackThreads(): number {
    return Math.ceil(
      this.ns.hackAnalyzeThreads(
        this.hostname,
        this.money.max * configs.hackAmount
      )
    );
  }

  get hackTime(): number {
    return this.ns.getHackTime(this.hostname);
  }

  get hackChance(): number {
    return this.ns.hackAnalyzeChance(this.hostname);
  }

  get hackSecInc(): number {
    return this.ns.hackAnalyzeSecurity(this.hackThreads, this.hostname);
  }

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

  growThreads(cores = 1, batch = false): number {
    return growthAnalyzeAccurate(
      this.ns,
      this.p,
      this.sec.now,
      this.money.growth,
      this.money.max,
      batch ? this.money.max * (1 - configs.hackAmount) : this.money.now,
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

  // ******** Details
  get ip(): string {
    return this.data.ip;
  }

  get cores(): number {
    return this.data.cpuCores;
  }

  get ram(): any {
    return {
      max: this.data.maxRam,
      used: this.data.ramUsed,
      now: Math.max(
        0,
        this.data.maxRam -
          this.data.ramUsed -
          (this.data.hostname === 'home' ? configs.reserveRAM : 0)
      ),
    };
  }

  get money(): any {
    return {
      max: this.data.moneyMax,
      now: this.data.moneyAvailable,
      growth: this.data.serverGrowth,
    };
  }

  get sec(): any {
    return {
      min: this.data.minDifficulty,
      now: this.data.hackDifficulty,
      base: this.data.baseDifficulty,
    };
  }

  get root(): boolean {
    return this.data.hasAdminRights;
  }

  get door(): boolean {
    return this.data.backdoorInstalled;
  }

  get open(): number {
    return this.data.openPortCount;
  }

  get ports(): any {
    return {
      ssh: this.data.sshPortOpen,
      ftp: this.data.ftpPortOpen,
      smtp: this.data.smtpPortOpen,
      http: this.data.httpPortOpen,
      sql: this.data.sqlPortOpen,
    };
  }

  get challenge(): number {
    return this.data.numOpenPortsRequired;
  }

  get level(): number {
    return this.data.requiredHackingSkill;
  }
}

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 500],
    ['help', false],
  ]);

  const hostname = ns.args[0] as string;
  const p = new Player(ns);
  const xserver = new Server(ns, p, hostname);
  // const ramMin = ns.getScriptRam(configs.xMin);
  const ramHack = ns.getScriptRam(configs.xHack);
  const ramWeak = ns.getScriptRam(configs.xWeak);
  const ramGrow = ns.getScriptRam(configs.xGrow);
  const ramShare = ns.getScriptRam(configs.xShare);

  if (!hostname || flags.help) {
    ns.tprint('Server class');
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  ns.tail();
  ns.clearLog();
  ns.disableLog('ALL');

  function updateDisplay() {
    ns.clearLog();

    let mHSBT = xserver.home ? 'H' : ' ';
    mHSBT += xserver.server ? 'S' : ' ';
    mHSBT += xserver.bot ? 'B' : ' ';
    mHSBT += xserver.target ? 'T' : ' ';

    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s | %-32s ',
      mHSBT,
      `P${xserver.challenge}`,
      `C${xserver.cores}`,
      `L${xserver.level}`,
      `${ns.formatRam(xserver.ram.now, 1)}`,
      `${ns.formatRam(xserver.ram.max, 1)}`,
      `${((xserver.ram.used / xserver.ram.max) * 100).toFixed(2)}%`,
      `${xserver.hostname} (${xserver.ip})`
    );
    let mRoot = xserver.root ? 'Root' : 'X';
    mRoot += !xserver.root && xserver.canReclaim ? '*' : '';
    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s | %-32s ',
      mRoot,
      `O${xserver.open}${!xserver.root && xserver.canReclaim ? '*' : ''}`,
      `${xserver.door ? 'D' : 'X'}${
        !xserver.door && xserver.canDoor ? '*' : ''
      }`,
      'V1000',
      ns.formatNumber(xserver.money.now, 2),
      ns.formatNumber(xserver.money.max, 2),
      `${((xserver.money.now / xserver.money.max) * 100).toFixed(2)}%`,
      `${(xserver.hackChance * 100).toFixed(2)}% chance\n`
    );
    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s %8s | %-32s ',
      'Type',
      '',
      '',
      '',
      'Hack',
      'Weak',
      'Grow',
      'Weak',
      'Share'
    );
    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s %8s | %-32s ',
      'Bot',
      '',
      '',
      '',
      xserver.threads(ramHack),
      xserver.threads(ramWeak),
      xserver.threads(ramGrow),
      xserver.threads(ramWeak),
      xserver.threads(ramShare)
    );
    const homeCores = ns.getServer('home').cpuCores;
    const mGrowThreads = xserver.growThreads();
    const mGrowThreadsH = xserver.growThreads(homeCores);
    const mWeakThreadsAfter = xserver.weakThreadsAfterGrow();
    const mWeakThreadsAfterH = xserver.growThreads(homeCores);
    ns.printf(
      ' %-5s %6s %-5s | %8s %8s %8s %8s ',
      'Prey',
      `+${(xserver.sec.now - xserver.sec.min).toFixed(2)}`,
      xserver.action,
      xserver.canAttack ? xserver.hackThreads : '',
      xserver.weakThreads > 0 ? xserver.weakThreads : '',
      `${mGrowThreads > 0 ? mGrowThreads : ''} ${
        mGrowThreadsH > 0 ? `H${mGrowThreadsH}` : ''
      }`,
      `${mWeakThreadsAfter > 0 ? mWeakThreadsAfter : ''} ${
        mWeakThreadsAfterH > 0 ? `H${mWeakThreadsAfterH}` : ''
      }`
    );
    ns.printf(
      '  %-6s %10s | %8s %8s %8s %8s | ',
      'Time',
      'VT9999',
      timeFormat(ns, xserver.hackTime),
      timeFormat(ns, xserver.weakTime),
      timeFormat(ns, xserver.growTime),
      timeFormat(ns, xserver.weakTime)
    );
    ns.printf(
      '  %-6s %10s | %8s %8s %8s %8s | ',
      'Sec',
      'Vt9999',
      xserver.canAttack ? xserver.hackSecInc : '',
      '',
      xserver.growThreads() > 0 ? xserver.growSecInc() : '',
      ''
    );
    ns.printf('  %-6s %10s | %8s %8s %8s %8s | ', 'Effort', 'VE9999');
    ns.print(xserver.value);
    ns.print(xserver.money.growth);
    ns.print(
      `[Min] ${xserver.sec.min} [Now] ${xserver.sec.now} [+] ${
        xserver.sec.now - xserver.sec.min
      }`
    );

    // const now = performance.now();
    // ns.print(`[Now] ${now}`);
    // ns.print(
    //   `[HackT] ${xserver.batch().hackDeploy} (${
    //     xserver.batch().hackDeploy - now
    //   })`
    // );
    // ns.print(
    //   `[WeakT] ${xserver.batch().weakDeploy} (${
    //     xserver.batch().weakDeploy - now
    //   })`
    // );
    // ns.print(
    //   `[GrowT] ${xserver.batch().growDeploy} (${
    //     xserver.batch().growDeploy - now
    //   })`
    // );
    // ns.print(
    //   `[WeakT] ${xserver.batch().weakDeployAfterGrow} (${
    //     xserver.batch().weakDeployAfterGrow - now
    //   })`
    // );
  }

  while (true) {
    updateDisplay();

    await ns.sleep(flags.refresh as number);
  }
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}

/* eslint-disable-next-line */
// const sample = {
//   contracts: [],
//   cpuCores: 1,
//   ftpPortOpen: false,
//   hasAdminRights: true,
//   hostname: 'CSEC',
//   httpPortOpen: false,
//   ip: '61.2.0.1',
//   isConnectedTo: false,
//   maxRam: 8,
//   messages: [],
//   organizationName: 'CyberSec',
//   programs: [],
//   ramUsed: 7.2,
//   runningScripts: [],
//   scripts: [],
//   serversOnNetwork: [],
//   smtpPortOpen: false,
//   sqlPortOpen: false,
//   sshPortOpen: true,
//   textFiles: [],
//   purchasedByPlayer: false,
//   backdoorInstalled: true,
//   baseDifficulty: 1,
//   hackDifficulty: 1,
//   minDifficulty: 1,
//   moneyAvailable: 0,
//   moneyMax: 0,
//   numOpenPortsRequired: 1,
//   openPortCount: 1,
//   requiredHackingSkill: 58,
//   serverGrowth: 1,
// };

const sample = {
  total: 0.08812339788039224,
  time: 5.141119032342083,
  effort: 992.9258528905301,
  hackRam: 51.3,
  weakRam: 3.52,
  growRam: 1.76,
  moneyMax: 1750000,
  hackamount: 0.05,
  weakAfterGrowRam: 1.76,
};
