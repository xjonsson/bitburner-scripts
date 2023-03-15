/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import { numCycleForGrowthCorrected } from './zCalc.js';
import Player from './zPlayer.js';
/* eslint-enable */

export default class Server {
  ns: NS;
  hostname: string;
  hackAmount: number;

  constructor(ns: NS, hostname: string) {
    this.ns = ns;
    this.hostname = hostname;
    this.hackAmount = configs.hackAmount;
  }

  get data(): any {
    return this.ns.getServer(this.hostname);
  }

  get home(): boolean {
    return this.data.hostname === 'home';
  }

  get server(): boolean {
    return this.data.purchasedByPlayer;
  }

  get bot(): boolean {
    return this.server || (this.root && this.ram.max > 0);
  }

  get reclaim(): boolean {
    return this.open <= this.challenge && !this.root;
  }

  canReclaim(programs: number) {
    return this.challenge <= programs;
  }

  get root(): boolean {
    return this.data.hasAdminRights;
  }

  target(hacking: number): boolean {
    return (
      !this.home &&
      !this.server &&
      this.money.max > 0 &&
      this.open >= this.challenge &&
      this.root &&
      this.level <= hacking
    );
  }

  get level(): number {
    return this.data.requiredHackingSkill;
  }

  get open(): number {
    return this.data.openPortCount;
  }

  get door(): boolean {
    return this.data.backdoorInstalled;
  }

  canDoor(hacking: number) {
    return this.level <= hacking && this.root && !this.server && !this.home;
  }

  get challenge(): number {
    return this.data.numOpenPortsRequired;
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

  get base(): any {
    return {
      difficulty: this.data.baseDifficulty,
      growth: this.data.serverGrowth,
    };
  }

  get sec(): any {
    return {
      min: this.data.minDifficulty,
      now: this.data.hackDifficulty,
    };
  }

  get money(): any {
    return {
      max: this.data.moneyMax,
      now: this.data.moneyAvailable,
    };
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

  get hackPercent(): number {
    return this.hackAmount;
  }

  get nodeReady(): boolean {
    return this.money.now === this.money.max && this.sec.now === this.sec.min;
  }

  nodeThreads(scriptRAM: number) {
    return Math.floor(this.ram.now / scriptRAM);
  }

  nodeValue(targetsValue: number) {
    return this.money.max / targetsValue;
  }

  get nodeValueBatch(): any {
    const homeCores = this.ns.getServer('home').cpuCores;
    const hackThreads = Math.floor(
      this.ns.hackAnalyzeThreads(
        this.hostname,
        this.money.max * this.hackPercent
      )
    );
    const growThreads = numCycleForGrowthCorrected(
      this.ns,
      this.ns.getServer(this.hostname),
      this.money.max,
      this.money.max * (1 - this.hackPercent),
      homeCores,
      this.ns.getPlayer()
    );

    return {
      hack: hackThreads,
      grow: growThreads,
      weak1: Math.ceil(hackThreads / 25),
      weak2: Math.ceil(growThreads / 12.5),
    };
  }

  get nodeValueHWGW(): number {
    // calculate $ per threadSecond
    const dollars = this.hackPercent * this.money.max;
    const nvb = this.nodeValueBatch;
    const ram =
      nvb.hack * 1.75 + nvb.grow * 1.8 + nvb.weak1 * 1.8 + nvb.weak2 * 1.8;
    const seconds = this.ns.getHackTime(this.hostname) * 4.0;
    return dollars / (ram * seconds);
  }

  nodeBatchReduced(amount: number): any {
    const homeCores = this.ns.getServer('home').cpuCores;
    const hackThreads = Math.floor(
      this.ns.hackAnalyzeThreads(this.hostname, this.money.max * amount)
    );
    const growThreads = numCycleForGrowthCorrected(
      this.ns,
      this.ns.getServer(this.hostname),
      this.money.max,
      this.money.max * (1 - amount),
      homeCores,
      this.ns.getPlayer()
    );

    return {
      hack: hackThreads,
      grow: growThreads,
      weak1: Math.ceil(hackThreads / 25),
      weak2: Math.ceil(growThreads / 12.5),
    };
  }
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);

  const hostname = ns.args[0] as string;
  const xserver = new Server(ns, hostname);
  const player = new Player(ns);

  if (!hostname || flags.help) {
    ns.tprint('Server class');
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  ns.tail();
  ns.clearLog();
  ns.disableLog('ALL');

  // ns.print(xserver.data);

  ns.print(
    `[Hostname] ${xserver.hostname} | Level ${xserver.level} | Ports ${xserver.open}/${xserver.challenge}`
  );
  ns.print(`[Home] ${xserver.home}`);
  ns.print(`[Server] ${xserver.server}`);
  ns.print(
    `[Bot] ${xserver.bot} | Reclaim ${
      xserver.reclaim
    } | Can ${xserver.canReclaim(player.challenge)}`
  );
  ns.print(
    `[Root] ${xserver.root} | Door ${xserver.door} | Can ${xserver.canDoor(
      player.hacking
    )}`
  );
  ns.print(`[Target] ${xserver.target(player.hacking)}`);
  ns.print(`[Ports]`);
  ns.print(xserver.ports);
  ns.print(
    `[Base] Difficulty ${xserver.base.difficulty} | Growth ${xserver.base.growth}`
  );
  ns.print(`[Security] Min ${xserver.sec.min} | Now ${xserver.sec.now}`);
  ns.print(
    `[Ram] ${xserver.ram.max} | Used ${xserver.ram.used} | Now ${xserver.ram.now}`
  );
  ns.print(`[Money] Max ${xserver.money.max} | Now ${xserver.money.now}`);
  ns.print(`[Hack Percent] ${xserver.hackPercent * 100} %`);
  ns.print(`[Node Ready] ${xserver.nodeReady}`);
  ns.print(`[Node Threads] ${xserver.nodeThreads(1.8)}`);
  ns.print(`[Node Value] ${xserver.nodeValue(1500000000)}`);
  ns.print(`[Node Value Batch]`);
  ns.print(xserver.nodeValueBatch);
  ns.print(`[Node Value HWGW] ${xserver.nodeValueHWGW}`);
  // nodeValueHWGW
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}

/* eslint-disable-next-line */
const sample = {
  contracts: [],
  cpuCores: 1,
  ftpPortOpen: false,
  hasAdminRights: true,
  hostname: 'CSEC',
  httpPortOpen: false,
  ip: '61.2.0.1',
  isConnectedTo: false,
  maxRam: 8,
  messages: [],
  organizationName: 'CyberSec',
  programs: [],
  ramUsed: 7.2,
  runningScripts: [],
  scripts: [],
  serversOnNetwork: [],
  smtpPortOpen: false,
  sqlPortOpen: false,
  sshPortOpen: true,
  textFiles: [],
  purchasedByPlayer: false,
  backdoorInstalled: true,
  baseDifficulty: 1,
  hackDifficulty: 1,
  minDifficulty: 1,
  moneyAvailable: 0,
  moneyMax: 0,
  numOpenPortsRequired: 1,
  openPortCount: 1,
  requiredHackingSkill: 58,
  serverGrowth: 1,
};
