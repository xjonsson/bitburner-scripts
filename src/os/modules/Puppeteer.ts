/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT } from '/os/configs';
import { Server, ServerInfo } from '/os/modules/Server';
import { ServerTarget } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Globals

// ******** PUPPETEER UTILITY FUNCTIONS

// ******** PUPPETEER CLASS
export default class Puppeteer {
  ns: NS;
  aHosts: Array<string>;
  tHosts: Array<string>;
  nHosts: Array<string>;
  nodes: Array<{ hostname: string; ramMax: number; ramNow: number }>;
  nRam: number;
  nRamNow: number;
  targets: Array<any>; // FIXME:

  // ******** CONSTRUCTOR
  constructor(ns: NS) {
    this.ns = ns;

    // Hosts
    this.aHosts = ServerInfo.list(ns);
    this.tHosts = [];
    this.nHosts = [];
    this.updateHosts();

    // Nodes
    this.nRam = 0;
    this.nRamNow = 0;
    this.nodes = this.updateNodes();

    // Targets
    // this.targets = this.updateTargets();
    this.targets = [];
  }

  // ******** METHODS
  updateHosts() {
    const t: string[] = [];
    const n: string[] = [];

    this.aHosts.forEach((h: string) => {
      const s = new Server(this.ns, h);
      if (s.isCash) t.push(s.hostname);
      if (s.isNode) n.push(s.hostname);
    });

    this.tHosts = t;
    this.nHosts = n;
    return { targetHosts: t, nodeHosts: n };
  }

  updateNodes() {
    let ram = 0;
    let ramNow = 0;
    const n = this.nHosts
      .map((h: string) => {
        const s = ServerInfo.details(this.ns, h);
        ram += s.ram.max;
        ramNow += s.ram.now;
        return {
          hostname: s.hostname,
          ramMax: s.ram.max,
          ramNow: s.ram.now,
        };
      })
      .sort((a: any, b: any) => b.ramMax - a.ramMax);

    this.nRam = ram;
    this.nRamNow = ramNow;
    return n;
  }

  async updateTargets(_targets = ['n00dles']) {
    const targets = this.tHosts.reduce((ts: ServerTarget[], h: string) => {
      const st = new ServerTarget(this.ns, h);
      if (st.isTarget) ts.push(st);
      return ts;
    }, []);
    this.targets = targets;
    await this.updatePorts();
    return targets;
  }

  async updatePorts() {
    const targets = this.targets.map((st: ServerTarget) => {
      const { ns, pMult, pMultBN, ...t } = st; // Strips NS but also functions
      return t;
    });
    const portData = {
      targetCount: targets.length,
      targets,
    };
    this.ns.clearPort(PORTS.PUPPETEER);
    await this.ns.tryWritePort(PORTS.PUPPETEER, portData);
  }

  // ******** FUNCTIONS
}

// ******** Main function
export async function main(ns: NS) {
  // ******** Setup
  // const { bufferX, bufferY } = LAYOUT;
  const { xW, xH, xOX, xOY } = LAYOUT.PUPPETEER;
  const wWidth = ns.ui.windowSize()[0];
  // const wHeight = ns.ui.windowSize()[1];
  // ns.disableLog('ALL');
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.disableLog('asleep');
  ns.disableLog('scan');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Puppeteer X3');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW - xOX, 0);
  const start = performance.now();

  // ******** Initialize (One Time Code)
  // console.time('Puppeteer');
  // console.profile('Puppeteer'); // FIXME:
  const puppeteer = new Puppeteer(ns);
  await puppeteer.updateTargets();
  // console.timeEnd('Puppeteer');

  // ******** DEBUG ONETIME ********
  // ns.tprint(puppeteer.hosts);
  // ns.tprint(puppeteer.tHosts);
  // ns.tprint(puppeteer.nHosts);
  // ns.tprint(puppeteer.nodes);
  // ns.tprint(puppeteer.targets[0]);

  let profiler = 0;
  console.log(`==== New Profiler ====`);
  // ******** DEBUG ONETIME END ********

  // ******** Primary (Loop Time Code)
  // while (profiler < 10) {
  while (true) {
    ns.clearLog();
    // ******** Consts
    const now = performance.now();
    // puppeteer.updateNodes(); // FIXME: remove this, should not be every tick
    const { nRam, nRamNow } = puppeteer;

    // ******** Display
    const dRamNow = ns.formatRam(nRamNow, 1);
    const dRam = ns.formatRam(nRam, 1);
    ns.print(`[Time] ${formatTime(ns, now - start)} | 🔋${dRamNow}/${dRam}`);

    ns.print('===== DEBUG =====');
    const sample = puppeteer.targets[0];
    // ns.print(performance.now());
    // ns.print(sample.updateAt);
    // ns.print(sample.status);
    // ns.print(sample.getStatus());

    // ns.print(formatTime(ns, now - start));
    // ns.print('===== DEBUG =====');
    const rowHeader = '%6s %1s %8s %8s %-18s';
    ns.printf(rowHeader, 'Mine', '🎲', 'Note', 'Update', 'Server');
    console.time('Puppeteer :: Targets');
    puppeteer.targets.forEach((st: ServerTarget) => {
      const mine = ns.formatNumber(st.hackChance, 2);
      const can = st.hackChance === 1 ? '✅' : '❌';
      const msg = `${st.status.icon} ${st.status.action}`;
      const upd = formatTime(ns, st.nextUpdate - now);
      ns.printf(rowHeader, mine, can, msg, upd, st.hostname);

      if (st.nextUpdate < now) {
        st.update = TIME.SERVERS;
      }
    });
    console.timeEnd('Puppeteer :: Targets');
    profiler += 1;

    await ns.asleep(TIME.PUPPETEER);
  }
  // console.profileEnd('Puppeteer'); // FIXME:
  // console.profileEnd();
}
