/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS } from '/os/configs';
import { Scan } from '/os/utils/scan';
/* eslint-enable */

const { ramReserve } = CONFIGS;

export class Server {
  // ******** Base
  hostname: string;
  id: string;
  data: any;
  // ******** Details
  level: number;
  cores: number;
  challenge: number;
  open: number;
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
  // ******** Classification
  isRoot: boolean;
  isDoor: boolean;
  isHome: boolean;
  isServer: boolean;
  isBot: boolean;
  isCash: boolean;
  isNode: boolean;
  isTarget: boolean;

  // ******** Constructor
  constructor(ns: NS, hostname: string) {
    this.hostname = hostname;
    this.id = hostname;
    this.data = ns.getServer(hostname);

    // ******** Details
    this.level = this.data.requiredHackingSkill;
    this.cores = this.data.cpuCores;
    this.challenge = this.data.numOpenPortsRequired;
    this.open = this.data.openPortCount;
    this.ram = {
      max: this.data.maxRam - (this.data.hostname === 'home' ? ramReserve : 0),
      maxReal: this.data.maxRam,
      used: this.data.ramUsed,
      now: Math.max(
        0,
        this.data.maxRam -
          this.data.ramUsed -
          (this.data.hostname === 'home' ? ramReserve : 0)
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

    // ******** Classification
    this.isRoot = this.data.hasAdminRights;
    this.isDoor = this.data.backdoorInstalled;
    this.isHome = this.data.hostname === 'home';
    this.isServer =
      this.data.purchasedByPlayer && this.data.hostname !== 'home';
    this.isBot = !this.isHome && !this.isServer && this.ram.max > 0;
    this.isNode = this.isServer || (this.isBot && this.isRoot); // Dont use Home
    this.isCash = !this.isHome && !this.isServer && this.money.max > 0;
    this.isTarget =
      !this.isHome &&
      !this.isServer &&
      this.isCash &&
      this.isRoot &&
      this.open >= this.challenge &&
      this.level <= ns.getHackingLevel();
  }
}

export const ServerInfo = {
  all(ns: NS): any {
    return ServerInfo.list(ns).map((s: string) => ServerInfo.details(ns, s));
  },
  details(ns: NS, hostname: string) {
    return new Server(ns, hostname);
  },
  list(ns: NS) {
    const servers = Scan.list(ns);
    return servers;
  },
};

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
