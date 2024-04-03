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
  ns: NS;

  // ******** Constructor
  constructor(ns: NS, hostname: string) {
    this.hostname = hostname;
    this.id = hostname;
    this.ns = ns;

    // ******** Classification
  }

  // ******** Refreshable details
  get data(): any {
    return this.ns.getServer(this.hostname);
  }

  get level(): number {
    return this.data.requiredHackingSkill;
  }

  get cores(): number {
    return this.data.cpuCores;
  }

  get challenge(): number {
    return this.data.numOpenPortsRequired;
  }

  get open(): number {
    return this.data.openPortCount;
  }

  get ram(): any {
    return {
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

  // ******** Classification
  get isRoot(): boolean {
    return this.data.hasAdminRights;
  }

  get isDoor(): boolean {
    return this.data.backdoorInstalled;
  }

  get isHome(): boolean {
    return this.data.hostname === 'home';
  }

  get isServer(): boolean {
    return this.data.purchasedByPlayer && this.data.hostname !== 'home';
  }

  get isBot(): boolean {
    return !this.isHome && !this.isServer && this.ram.max > 0;
  }

  get isNode(): boolean {
    // NOTE: Dont use home as node
    return this.isServer || (this.isBot && this.isRoot);
  }

  get isCash(): boolean {
    return !this.isHome && !this.isServer && this.money.max > 0;
  }

  get isTarget(): boolean {
    return (
      !this.isHome &&
      !this.isServer &&
      this.isCash &&
      this.isRoot &&
      this.open >= this.challenge &&
      this.level <= this.ns.getHackingLevel()
    );
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
