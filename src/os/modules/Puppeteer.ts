/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT } from '/os/configs';
import { Server, ServerInfo } from '/os/modules/Server';
import { ServerTarget, X } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Globals
const { xBuffer, xDelay, xBatches, xTargets, xPrep } = CONFIGS.hacking;

// ******** Styling
const rowStyle =
  '%4s ' + // Level
  '%-18s' + // Server
  '%1s ' + // Action Icon
  '%4s ' + // Cash
  '%4s ' + // Cash %
  '%5s ' + // Sec
  '%3s ' + // Chance
  '%1s ' + // Prep
  '%4s ' + // Hack Threads
  '%4s ' + // Weak Threads
  '%4s ' + // Grow Threads
  '%4s ' + // Meak Threads (Weak after Grow)
  '%7s ' + // Action Time
  '%5s ' + // Batch Ram
  '%4s ' + // VPRS (Value Per Ram Second)
  '%4s ' + // HWGW (Batches)
  '%5s ' + // Action
  '%9s'; // Update

function updateHeaders(ns: NS) {
  ns.printf(
    rowStyle,
    'LVL', // Level
    'Server', // Server
    '📝', // Action Icon
    'Cash', // Cash
    '%', // Cash %
    '+Sec', // Sec
    'HC', // Chance
    '💎', // Prep
    'Hack', // Hack Threads
    'Weak', // Weak Threads
    'Grow', // Grow Threads
    'Meak', // Meak Threads (Weak after Grow)
    'Time', // Action Time
    'Batch', // Batch Ram
    'VPRS', // VPRS (Value Per Ram Second)
    'HWGW', // HWGW (Batches)
    'Step', // Action
    'Update' // Update
  );
}

function updateRow(ns: NS, st: ServerTarget, now: number) {
  const { now: mNow, max: mMax } = st.money;
  const { now: sNow, min: sMin } = st.sec;
  const { action: mA, icon: mI } = st.status;
  const mUpdate = formatTime(ns, st.nextUpdate - now);
  let mMoney = '';
  let mSec = '';
  let mPrepped = '✅';
  let mHack = ns.formatNumber(st.x.hThreads, 0);
  let mWeak = ns.formatNumber(st.x.wThreads, 0);
  let mGrow = ns.formatNumber(st.x.gThreads, 0);
  let mWeakAG = ns.formatNumber(st.x.wagThreads, 0);
  let mRam = ns.formatRam(st.x.bRam, 0);

  if (mA === X.WEAK.A) mSec = `+${ns.formatNumber(sNow - sMin, 1)}`;
  if (mA === X.GROW.A) mMoney = ns.formatPercent(mNow / mMax, 0);
  if (mA !== X.HACK.A) {
    mPrepped = '❌';
    mHack = '';
    mWeak = st.x.pwThreads > 0 ? ns.formatNumber(st.x.pwThreads, 0) : '';
    mGrow = st.x.pgThreads > 0 ? ns.formatNumber(st.x.pgThreads, 0) : '';
    mWeakAG = ns.formatNumber(st.x.wagThreads, 0);
    mRam = '';
  }

  ns.printf(
    rowStyle,
    st.level, // Level
    st.hostname, // Server
    mI, // Action Icon
    ns.formatNumber(mMax, 0), // Cash
    mMoney, // Cash %
    mSec, // Sec
    st.x.hackChance < 1 ? ns.formatNumber(st.x.hackChance, 1) : '', // Chance
    mPrepped, // Prep
    mHack, // Hack Threads
    mWeak, // Weak Threads
    mGrow, // Grow Threads
    mWeakAG, // Meak Threads (Weak after Grow)
    formatTime(ns, st.x.wTime), // Action Time
    mRam, // Batch Ram
    ns.formatNumber(st.x.bValue, 0), // VPRS (Value Per Ram Second)
    st.batches > 0 ? st.batches : '', // HWGW (Batches)
    mA, // Action
    mUpdate // Update
  );
}

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

  // FIXME: Make async again
  async updateTargets(_targets = ['n00dles']) {
    const targets = this.tHosts
      .reduce((ts: ServerTarget[], h: string) => {
        const st = new ServerTarget(this.ns, h);
        if (st.isTarget) ts.push(st);
        return ts;
      }, [])
      .sort((a: ServerTarget, b: ServerTarget) => b.x.bValue - a.x.bValue);
    // .slice(0, xTargets); // FIXME:
    this.targets = targets;
    await this.updatePorts(); // FIXME:
    // this.updatePorts();
    return targets;
  }

  // FIXME: Make async again
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
    await this.ns.tryWritePort(PORTS.PUPPETEER, portData); // FIXME: await
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
  // console.profile('Puppeteer'); // FIXME:
  const puppeteer = new Puppeteer(ns);
  // console.time('Puppeteer :: updateTargets'); // FIXME:
  await puppeteer.updateTargets(); // FIXME: await
  // console.timeEnd('Puppeteer :: updateTargets'); // FIXME:

  // ******** DEBUG ONETIME ********
  // ns.tprint(puppeteer.hosts);
  // ns.tprint(puppeteer.tHosts);
  // ns.tprint(puppeteer.nHosts);
  // ns.tprint(puppeteer.nodes);
  // ns.tprint(puppeteer.targets[0]);

  // let profiler = 0;
  console.log(`==== New Profiler ====`);
  // ******** DEBUG ONETIME END ********

  // ******** Primary (Loop Time Code)
  // while (profiler < 20) {
  // FIXME:
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

    // ns.print('===== DEBUG =====');
    // const sample = puppeteer.targets[0];
    // ns.print(performance.now());
    // ns.print(sample.updateAt);
    // ns.print(sample.status);
    // ns.print(sample.getStatus());

    // ns.print(formatTime(ns, now - start));
    // ns.print('===== DEBUG =====');
    // const rowHeader = '%6s %1s %8s %8s %-18s';
    // ns.printf(rowHeader, 'Mine', '🎲', 'Note', 'Update', 'Server');
    // console.time('Puppeteer :: DisplayTargets'); // FIXME:
    updateHeaders(ns);
    // puppeteer.targets.forEach((st: ServerTarget) => {
    //   // Display
    //   updateRow(ns, st, now);

    //   if (st.nextUpdate < now) {
    //     st.update(TIME.SERVERS);
    //   }
    // });

    // NOTE: Using for of so we can await
    for (const st of puppeteer.targets as ServerTarget[]) {
      // Display
      updateRow(ns, st, now);

      if (st.nextUpdate < now) {
        // Do this switch thing here
        if (st.status.action === X.HACK.A) st.update(st.x.wTime + xDelay);
        else if (st.status.action === X.WEAK.A) st.update(st.x.wTime + xDelay);
        else if (st.status.action === X.GROW.A) st.update(st.x.gTime + xDelay);
        else if (st.status.action === X.WAIT.A) st.update(TIME.SERVERS);
        else if (st.status.action === X.RISK.A) st.update(TIME.SERVERS);
        else st.update(TIME.SERVERS);
      }
    }
    // console.timeEnd('Puppeteer :: DisplayTargets'); // FIXME:
    // profiler += 1; // FIXME:

    await ns.asleep(TIME.PUPPETEER);
  }
  // console.profileEnd('Puppeteer'); // FIXME:
  // console.profileEnd();
  // console.timeEnd('Puppeteer'); // FIXME:
}
