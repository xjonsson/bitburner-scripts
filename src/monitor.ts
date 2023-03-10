/* eslint-disable-next-line */
import { NS } from '@ns';

export default class Monitor {
  ns: NS;
  hostname: string;
  sec: number;
  secMin: number;
  moneyAvailable: number;
  moneyMax: number;
  hackThreads: number;
  hackTime: number;
  weakThreads: number;
  weakTime: number;
  growThreads: number;
  growTime: number;

  constructor(ns: NS, hostname: string) {
    this.ns = ns;
    this.hostname = hostname;
    this.moneyAvailable = this.getMoneyAvailable;
    this.moneyMax = this.getMoneyMax;
    this.sec = this.getSec;
    this.secMin = this.getSecMin;
    this.hackThreads = this.getHackThreads;
    this.hackTime = this.getHackTime;
    this.weakThreads = this.getWeakThreads;
    this.weakTime = this.getWeakTime;
    this.growThreads = this.getGrowThreads;
    this.growTime = this.getGrowTime;
  }

  get getMoneyAvailable() {
    this.moneyAvailable = this.ns.getServerMoneyAvailable(this.hostname);
    if (this.moneyAvailable === 0) {
      this.moneyAvailable = 1;
    }
    return this.moneyAvailable;
  }

  get getMoneyMax() {
    this.moneyMax = this.ns.getServerMaxMoney(this.hostname);
    return this.moneyMax;
  }

  get getSec() {
    this.sec = this.ns.getServerSecurityLevel(this.hostname);
    return this.sec;
  }

  get getSecMin() {
    this.secMin = this.ns.getServerMinSecurityLevel(this.hostname);
    return this.secMin;
  }

  get getHackThreads() {
    this.hackThreads = Math.ceil(
      this.ns.hackAnalyzeThreads(this.hostname, this.moneyAvailable)
    );
    return this.hackThreads;
  }

  get getHackTime() {
    this.hackTime = this.ns.getHackTime(this.hostname);
    return this.hackTime;
  }

  get getWeakThreads() {
    this.weakThreads = Math.ceil((this.sec - this.secMin) * 20);
    return this.weakThreads;
  }

  get getWeakTime() {
    this.weakTime = this.ns.getWeakenTime(this.hostname);
    return this.weakTime;
  }

  get getGrowThreads() {
    this.growThreads = Math.ceil(
      this.ns.growthAnalyze(this.hostname, this.moneyMax / this.moneyAvailable)
    );
    return this.growThreads;
  }

  get getGrowTime() {
    this.growTime = this.ns.getGrowTime(this.hostname);
    return this.growTime;
  }
}

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 500],
    ['silent', false],
    ['help', false],
  ]);

  const target = ns.args[0] as string;
  const xmon = new Monitor(ns, target);

  if (!target || flags.help) {
    ns.tprint('Monitor for a single server.');
    ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  ns.tail();
  ns.disableLog('ALL');

  function updateDisplay() {
    ns.clearLog();
    ns.print(
      `[Monitor] ${target} | Refresh (${(flags.refresh as number) / 1000} sec)`
    );

    const rowMonitor = ' %6s | %8s | %8s | %8s | %8s | %8s ';
    ns.printf(rowMonitor, 'Sec', 'Money', 'Max', 'Hack', 'Weak', 'Grow');
    ns.printf(
      rowMonitor,
      `+${(xmon.getSec - xmon.getSecMin).toFixed(2)}`,
      `${((xmon.getMoneyAvailable / xmon.getMoneyMax) * 100).toFixed(2)}%`,
      `${ns.formatNumber(xmon.getMoneyMax, 2)}`,
      `${xmon.getHackThreads}`,
      `${xmon.getWeakThreads}`,
      `${xmon.getGrowThreads}`
    );
    ns.print(`[Hack Time] ${ns.tFormat(xmon.getHackTime)}`);
    ns.print(`[Weak Time] ${ns.tFormat(xmon.getWeakTime)}`);
    ns.print(`[Grow Time] ${ns.tFormat(xmon.getGrowTime)}`);
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
