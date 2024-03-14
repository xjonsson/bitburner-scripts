/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
// import { CONSTANTS } from '/os/data/constants';
// import { Player } from '/os/modules/Player';
// import { formatTime } from '/os/utils/formatTime';
// import { growthAnalyzeAccurate } from '/os/utils/growthAnalyzeAccurate';
// import { serversData } from '/os/data/servers';
import { Scan } from '/os/utils/scan';
/* eslint-enable */

const { xMin, xHack, xWeak, xGrow, xShare } = DEPLOY;
// const { xMinRam, xHackRam, xWeakRam, xGrowRam, xShareRam } = DEPLOY;
const xReservedRam = CONFIGS.ramReserve.home;

export class Server {
  // ns: NS; // FIXME: DEBUG
  // p: Player; // FIXME: DEBUG
  hostname: string;
  id: string;
  ip: string;
  organization: string;
  data: any;
  root: boolean;
  isConnected: boolean;
  isHome: boolean;
  isServer: boolean;
  isBot: boolean;
  isCash: boolean;
  isNode: boolean;
  isTarget: boolean;
  // isReclaimed: boolean; // FIXME: DEBUG
  // isMilestone: boolean;
  // isFaction: boolean;
  isDoored: boolean;
  // canReclaim: boolean; // FIXME: DEBUG
  // canDoor: boolean; // FIXME: DEBUG
  // canFocus: boolean; // FIXME: DEBUG
  // canAttack: boolean; // FIXME: DEBUG
  cores: number;
  // power: number;
  level: number;
  open: number;
  challenge: number;
  ram: {
    max: number;
    maxReal: number;
    used: number;
    now: number;
  };
  money: {
    max: number;
    now: number;
    growth: number;
  };
  sec: {
    min: number;
    now: number;
    base: number;
  };
  ports: {
    ssh: boolean;
    ftp: boolean;
    smtp: boolean;
    http: boolean;
    sql: boolean;
  };

  // ******** Constructor
  // constructor(ns: NS, player: Player, hostname: string) {
  constructor(ns: NS, hostname: string) {
    // this.ns = ns; // // NOTE: Computed
    // this.p = player; // NOTE: Computed
    this.hostname = hostname; // "iron-gym"
    this.id = hostname; // "iron-gym"
    this.data = ns.getServer(hostname);

    // ******** Details
    this.ip = this.data.ip;
    this.organization = this.data.organizationName;
    this.cores = this.data.cpuCores;
    // this.power = Math.max(0, Math.log2(this.data.maxRam)); // NOTE: Computed
    this.level = this.data.requiredHackingSkill;
    this.open = this.data.openPortCount;
    this.challenge = this.data.numOpenPortsRequired;
    this.ram = {
      max:
        this.data.maxRam - (this.data.hostname === 'home' ? xReservedRam : 0),
      maxReal: this.data.maxRam,
      used: this.data.ramUsed,
      now: Math.max(
        0,
        this.data.maxRam -
          this.data.ramUsed -
          (this.data.hostname === 'home' ? xReservedRam : 0)
      ),
    };
    this.money = {
      max: this.data.moneyMax,
      now: this.data.moneyAvailable,
      growth: this.data.serverGrowth,
    };

    this.sec = {
      min: this.data.minDifficulty,
      now: this.data.hackDifficulty,
      base: this.data.baseDifficulty,
    };

    this.ports = {
      ssh: this.data.sshPortOpen,
      ftp: this.data.ftpPortOpen,
      smtp: this.data.smtpPortOpen,
      http: this.data.httpPortOpen,
      sql: this.data.sqlPortOpen,
    };

    // ******** Classification
    this.isHome = this.data.hostname === 'home';
    this.isServer =
      this.data.purchasedByPlayer && this.data.hostname !== 'home';
    this.isBot = !this.isHome && !this.isServer && this.ram.max > 0;
    this.isCash = !this.isHome && !this.isServer && this.money.max > 0;
    this.root = this.data.hasAdminRights;
    this.isDoored = this.data.backdoorInstalled;
    this.isConnected = this.data.isConnectedTo;
    this.isNode = this.isServer || (this.root && this.ram.max > 0);
    this.isTarget =
      !this.isHome &&
      !this.isServer &&
      this.money.max > 0 &&
      this.open >= this.challenge &&
      this.root &&
      // this.level <= this.p.level; // FIXME: DEBUG
      this.level <= ns.getHackingLevel(); // NOTE: Computed
    // this.isMilestone = [
    //   'CSEC',
    //   'avmnite-02h',
    //   'I.I.I.I',
    //   'run4theh111z',
    //   'The-Cave',
    //   'w0r1d_d43m0n',
    // ].includes(this.hostname); // NOTE: Moving to backdoor logic
    // this.isFaction = [
    //   'CSEC',
    //   'avmnite-02h',
    //   'I.I.I.I',
    //   'run4theh111z',
    //   '.',
    //   'fulcrumassets',
    // ].includes(this.hostname); // NOTE: Moving to control logic

    // ******** Decision
    // NOTE: Moving to backdoor logic
    // this.canReclaim =
    //   this.challenge <= this.p.challenge && // NOTE: Computed
    //   !this.root &&
    //   !this.isHome &&
    //   !this.isServer;
    // NOTE: Moving to backdoor logic
    // this.canDoor =
    //   // this.level <= this.p.hack.level && // NOTE: Computed
    //   this.level <= ns.getHackingLevel() &&
    //   this.root &&
    //   !this.isDoored &&
    //   !this.isHome &&
    //   !this.isServer;
    // NOTE: Distance logic will take over
    // this.canFocus =
    //   this.level >= this.p.levelRange.min &&
    //   this.level <= this.p.levelRange.max;
    // NOTE: Computed and moving to hack logic. Not for every server
    // this.canAttack =
    //   this.money.now === this.money.max &&
    //   this.sec.now === this.sec.min &&
    //   this.hackChance(ns) === 1;
  }

  // ******** Actions
  deployScripts(ns: NS): any {
    ns.scp([xMin, xHack, xWeak, xGrow, xShare], this.hostname, 'home');
  }

  // NOTE: Moving to focus logic
  // get distance(): any {
  //   const value = this.level - this.p.level / 2;
  //   if (this.level > this.p.level) return { value, message: `❌ High` };
  //   if (value < -20) return { value, message: `🔵 Low` };
  //   if (value > 30) return { value, message: `🔴 Hard` };
  //   if (value > 20) return { value, message: `🟠 Med ` };
  //   if (value > 10) return { value, message: `🟡 Next` };
  //   if (value >= -20) return { value, message: `🟢 Spam` };
  //   return { value, message: `😒 NOT SURE` };
  // }

  // NOTE: Spliting this logic to other locations
  // get action(): string {
  //   if (this.isHome || this.isServer) return '';
  //   if (this.canReclaim) return '👾 RECLAIM';
  //   if (this.isMilestone && this.canDoor) return '🚪 BACKDOOR';
  //   if (this.challenge > this.p.challenge) return '💎 PROGRAMS';
  //   // if (this.challenge > this.p.challenge) return this.distance.message;
  //   if (this.isMilestone && this.level > this.p.level) return '🧠 LEVEL UP';
  //   if (this.isTarget) {
  //     if (this.canAttack) return `${this.distance.message} 💰 Hack`;
  //     if (this.sec.now > this.sec.min)
  //       return `${this.distance.message} 🔓 Weak`;
  //     if (this.money.now < this.money.max)
  //       return `${this.distance.message} 🌿 Grow`;
  //   }
  //   if (this.isBot) return '🤖 BOT';
  //   return 'UNSURE';
  // }

  // ******** Computed
  // NOTE: Heavy computed, move to attack server
  // get value(): any {
  //   const batch = this.batch(1);
  //   const moneyPerBatch = this.money.max * CONFIGS.hacking.skim;
  //   const deploySeconds = batch.deployTime / 1000;
  //   const netGainPerSecond = moneyPerBatch / deploySeconds;
  //   const investedRamPerSecond = batch.batchRam / deploySeconds;
  //   const valuePerSecond = netGainPerSecond / investedRamPerSecond;

  //   return {
  //     total: valuePerSecond > 0 ? valuePerSecond : 0,
  //     time: deploySeconds,
  //     effort: investedRamPerSecond,
  //     batchRam: batch.batchRam,
  //     hackRam: batch.hackRam,
  //     weakRam: batch.weakRam,
  //     growRam: batch.growRam,
  //     batchTime: batch.batchTime,
  //     moneyMax: this.money.max,
  //     hackAmount: CONFIGS.hacking.skim,
  //     weakAfterGrowRam: batch.weakAfterGrowRam,
  //   };
  // }

  // NOTE: Heavy computed, move to attack server
  // batch(cores = 1, partial = true): any {
  //   const { buffer, delay } = CONFIGS.hacking;
  //   const deployStart = performance.now() + delay;
  //   const deployEnd = deployStart + this.weakTime + buffer;
  //   const deployTime = deployEnd - deployStart;
  //   const weakDeployAfterGrow = deployEnd - (this.weakTime + buffer);
  //   const growDeploy = deployEnd - buffer * 1 - (this.growTime + buffer);
  //   const weakDeploy = deployEnd - buffer * 2 - (this.weakTime + buffer);
  //   const hackDeploy = deployEnd - buffer * 3 - (this.hackTime + buffer);

  //   const { hackThreads } = this;
  //   const weakThreads = Math.ceil(hackThreads / 25);
  //   const growThreads = this.growThreads(cores, partial);
  //   const weakThreadsAfterGrow = this.weakThreadsAfterGrow(cores, partial);

  //   const batch = {
  //     deployStart,
  //     batchRam: 0,
  //     deployTime,
  //     hackThreads,
  //     hackRam: hackThreads * xHackRam,
  //     hackDeploy,
  //     weakThreads,
  //     weakRam: weakThreads * xWeakRam,
  //     weakDeploy,
  //     growThreads,
  //     growRam: growThreads * xGrowRam,
  //     growDeploy,
  //     weakThreadsAfterGrow,
  //     weakAfterGrowRam: weakThreadsAfterGrow * xWeakRam,
  //     weakDeployAfterGrow,
  //     deployEnd,
  //   };
  //   batch.batchRam =
  //     batch.hackRam + batch.weakRam + batch.growRam + batch.weakAfterGrowRam;
  //   return batch;
  // }

  // FIXME: Move elsewhere
  // threads(script = 1.6): number {
  //   return Math.floor(this.ram.now / script);
  // }

  // NOTE: Heavy computed, move to attack server
  // ******** Computed Hack
  // FIXME: DEBUG
  // get hackThreads(): number {
  //   return Math.ceil(
  //     this.ns.hackAnalyzeThreads(
  //       this.hostname,
  //       this.money.max * CONFIGS.hacking.skim
  //     )
  //   );
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // get hackTime(): number {
  //   return this.ns.getHackTime(this.hostname);
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // hackChance(ns: NS): number {
  //   return ns.hackAnalyzeChance(this.hostname);
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // get hackSecInc(): number {
  //   return this.ns.hackAnalyzeSecurity(this.hackThreads, this.hostname);
  // }

  // ******** Computed Weak
  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // get weakThreads(): number {
  //   return Math.ceil(
  //     (this.sec.now - this.sec.min) / CONSTANTS.ServerWeakenAmount
  //   );
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // weakThreadsAfterGrow(cores = 1, batch = false): number {
  //   return Math.ceil(this.growThreads(cores, batch) / 12.5);
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // get weakTime(): number {
  //   return this.ns.getWeakenTime(this.hostname);
  // }

  // NOTE: Heavy computed, move to attack server
  // ******** Computed Grow
  // FIXME: DEBUG
  // growThreads(cores = 1, batch = false): number {
  //   return growthAnalyzeAccurate(
  //     this.ns,
  //     this.p,
  //     this.sec.now,
  //     this.money.growth,
  //     this.money.max,
  //     batch ? this.money.max * (1 - CONFIGS.hacking.skim) : this.money.now,
  //     this.money.max,
  //     cores
  //   );
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // get growTime(): number {
  //   return this.ns.getGrowTime(this.hostname);
  // }

  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // growSecInc(cores = 1): number {
  //   return this.ns.growthAnalyzeSecurity(
  //     this.growThreads(cores),
  //     this.hostname,
  //     cores
  //   );
  // }

  // ******** Display
  // NOTE: Heavy computed, move to attack server
  // FIXME: DEBUG
  // get mHSBC(): any {
  //   let m = '';
  //   m += this.isHome ? '🏠' : '〰️';
  //   m += this.isServer ? '🖥️' : '〰️';
  //   m += this.isBot ? '🤖' : '〰️';
  //   m += this.isCash ? '💵' : '〰️';
  //   return m;
  // }

  //     this.hackTime = Math.ceil(ns.getHackTime(data.hostname));
  //     this.growTime = Math.ceil(ns.getHackTime(data.hostname) * 3.2);
  //     this.weakenTime = Math.ceil(ns.getHackTime(data.hostname) * 4);
}

export const ServerInfo = {
  all(ns: NS): any {
    // const p = new Player(ns); // FIXME: DEBUG
    // return ServerInfo.list(ns).map((s: string) => ServerInfo.details(ns, p, s)); // FIXME: DEBUG
    return ServerInfo.list(ns).map((s: string) => ServerInfo.details(ns, s));
  },
  details(ns: NS, hostname: string) {
    // return new Server(ns, p, hostname); // FIXME: DEBUG
    return new Server(ns, hostname);
  },
  list(ns: NS) {
    const servers = Scan.list(ns);
    return servers;
  },
};

/**
 * DEBUG: Main is for debug, should be removed for less ram usage
 */
// export async function main(ns: NS) {
//   const flags = ns.flags([
//     ['refresh', 1000],
//     ['help', false],
//   ]);

//   const hostname = ns.args[0] as string;
//   const p = new Player(ns);
//   // const s = new Server(ns, p, hostname);
//   const servers = Scan.list(ns);

//   if (!hostname || flags.help) {
//     ns.tprint('Server class');
//     ns.tprint(`> run ${ns.getScriptName()} n00dles`);
//   }

//   ns.tail();
//   ns.clearLog();
//   ns.disableLog('ALL');

//   // const sample = [
//   //   'home',
//   //   'ps-01',
//   //   'joesguns',
//   //   'neo-net',
//   //   'iron-gym',
//   //   'CSEC',
//   //   'phantasy',
//   //   'avmnite-02h',
//   //   'computek',
//   //   'I.I.I.I',
//   //   'aevum-police',
//   //   '.',
//   //   'run4theh111z',
//   //   'vitalife',
//   //   'The-Cave',
//   //   'blade',
//   //   'fulcrumassets',
//   //   'fulcrumtech',
//   //   'megacorp',
//   // ];

//   const serversHeader =
//     ' %1s%-1s %-18s |%-4s|%2s|%2s|%5s|%5s|%6s|%4s| %-14s|%4s|%4s|%4s|%4s|%4s|%8s|';

//   const sampleData = [];
//   serversData
//     .filter((s) => s.challenge < 5)
//     .forEach((s) => {
//       sampleData.push(s.hostname);
//     });

//   function updateDisplay() {
//     ns.clearLog();

//     ns.printf(
//       serversHeader,
//       '🔐',
//       ' ',
//       'Server',
//       '🏠🖥️🤖💰',
//       '🖲️',
//       ' 🔋',
//       'RAM',
//       'Cash',
//       '💰Cash',
//       '🧠LVL',
//       'Action',
//       '🎲',
//       '👾🧵',
//       '🔓🧵',
//       '🌿🧵',
//       '🔓🧵🌿',
//       '💎 Value'
//     );

//     sampleData.forEach((name) => {
//       const s = new Server(ns, p, name);
//       ns.printf(
//         serversHeader,
//         s.root ? (s.isDoored ? '🥷' : '🧑‍💻') : '👾',
//         s.root ? ' ' : s.challenge,
//         s.hostname,
//         s.mHSBC,
//         s.cores,
//         s.power > 0 ? s.power : ' ',
//         s.ram.max > 0 ? ns.formatRam(s.ram.max, 0) : ' ',
//         s.money.max > 0 ? ns.formatNumber(s.money.max, 0) : ' ',
//         s.money.max > 0 ? ns.formatPercent(s.money.now / s.money.max, 1) : ' ',
//         s.level,
//         s.action,
//         ns.formatPercent(s.hackChance, 0),
//         ns.formatNumber(s.hackThreads, 0),
//         ns.formatNumber(s.weakThreads, 0),
//         ns.formatNumber(s.growThreads(1, false), 0),
//         ns.formatNumber(s.weakThreadsAfterGrow(1, false), 0),
//         ns.formatNumber(s.value.total, 1)
//       );
//     });
//   }

//   // ******** Update loop
//   while (true) {
//     updateDisplay();

//     await ns.sleep(flags.refresh as number);
//   }
// }

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
