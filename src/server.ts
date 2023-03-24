/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
/* eslint-enable */

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
    return this.open <= this.p.challenge;
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
    return this.money.now === this.money.max && this.sec.now === this.sec.min;
  }

  // ******** Computed
  // TODO: get value
  // TODO: get valueTime
  // TODO: get valueEffort
  threads(scriptRam: number): number {
    return Math.floor(this.ram.now / scriptRam);
  }
  // TODO: get hackThreads
  // TODO: get hackTime
  // TODO: get hackChance
  // TODO: get hackAmount
  // TODO: get hackSec
  // TODO: get weakThreads
  // TODO: get weakTime
  // TODO: get weakSec?
  // TODO: get growThreads
  // TODO: get growTime
  // TODO: get growSec

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
        !xserver.root && xserver.canDoor ? '*' : ''
      }`,
      'V1000',
      ns.formatNumber(xserver.money.now, 2),
      ns.formatNumber(xserver.money.max, 2),
      `${((xserver.money.now / xserver.money.max) * 100).toFixed(2)}%`,
      'B500\n'
    );
    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s | %-32s ',
      'Type',
      '',
      '',
      '',
      'Hack',
      'Weak',
      'Grow',
      'Share'
    );
    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s | %-32s ',
      'Bot',
      '',
      '',
      '',
      xserver.threads(ramHack),
      xserver.threads(ramWeak),
      xserver.threads(ramGrow),
      xserver.threads(ramShare),
      ''
    );
    ns.printf(
      ' %-5s %2s %-3s %-5s | %8s %8s %8s | %-32s ',
      'Prey',
      '',
      '',
      '',
      xserver.threads(ramHack),
      xserver.threads(ramWeak),
      xserver.threads(ramGrow),
      xserver.threads(ramShare),
      ''
    );

    // Root (R)	5*	D*	V9999	$25.00M	$50.00M	50.00%
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
