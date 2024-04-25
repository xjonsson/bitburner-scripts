/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT } from '/os/configs';
import { Server, ServerInfo } from '/os/modules/Server';
import { ServerTarget, X } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Globals
const { xBuffer, xDelay, xBatches, xTargets, xPrimed } = CONFIGS.hacking;

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
interface SFocus {
  id: string;
  value: number;
  primed: boolean;
}

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
  tPrimed: Array<SFocus>;
  tNext: Array<SFocus>;

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
    this.tPrimed = [];
    this.tNext = [];
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
      primedCount: this.tPrimed.length,
      primed: this.tPrimed,
      nextCount: this.tNext.length,
      next: this.tNext,
    };
    this.ns.clearPort(PORTS.PUPPETEER);
    await this.ns.tryWritePort(PORTS.PUPPETEER, portData); // FIXME: await
  }

  // ******** FUNCTIONS
  // ******** TEST FUNCTIONS
  // _primed: SFocus[] = [],
  //   _next: SFocus[] = [{ id: 'n00dles', value: -1, primed: false }]
  async xTargets() {
    const qHosts: string[] = [];
    const primed = [...this.tPrimed]; // Shallow copy
    const next = [...this.tNext]; // Shallow copy
    this.ns.tprint(`Primed ========`); // FIXME: remove
    this.ns.tprint(primed); // FIXME: remove
    this.ns.tprint(`Next ========`); // FIXME: remove
    this.ns.tprint(next); // FIXME: remove

    // Sorted list of all available targets from [0] high value to [end] low value
    const aTargets = this.tHosts
      .reduce((ast: ServerTarget[], h: string) => {
        const st = new ServerTarget(this.ns, h);
        if (st.isTarget) ast.push(st);
        return ast;
      }, [])
      .sort((a: ServerTarget, b: ServerTarget) => b.x.bValue - a.x.bValue);

    // Create a set of ready primed [hwgw ready] and next [w/g] targets
    while (aTargets.length > 0) {
      const qt = aTargets.pop() as ServerTarget;
      const sf: SFocus = {
        id: qt.hostname,
        value: qt.x.bValue,
        primed: qt.status.action === X.HACK.A,
      };

      const pIndex = primed.findIndex((pt: SFocus) => pt.id === sf.id);
      const nIndex = next.findIndex((nt: SFocus) => nt.id === sf.id);
      // this.ns.tprint(
      //   `Checking [${aTargets.length}] ${sf.id} | ${sf.value.toFixed(2)} | ${
      //     sf.primed
      //   }`
      // );
      // if (pIndex > -1) this.ns.tprint(`:: In Primed at ${pIndex}`);
      // if (nIndex > -1) this.ns.tprint(`:: In Next at ${nIndex}`);

      if (sf.primed) {
        // Its primed
        // this.ns.tprint(':: Its primed');
        if (primed.length < xPrimed && pIndex < 0) {
          // this.ns.tprint(`:: Primed [${primed.length}/${xPrimed}] Adding`);
          primed.push(sf);
        } else if (
          primed.length >= xPrimed &&
          pIndex < 0 &&
          sf.value > primed[primed.length - 1].value
        ) {
          // this.ns.tprint(`:: Primed [${primed.length}/${xPrimed}] and better`);
          // const dPrime = primed[primed.length - 1];
          // this.ns.tprint(
          //   `:: ${dPrime.id}: ${dPrime.value.toFixed(2)} | ${
          //     sf.id
          //   }: ${sf.value.toFixed(2)} (${sf.value > dPrime.value})`
          // );
          while (primed.length > xPrimed) primed.shift();
          primed.shift();
          primed.push(sf);
        }

        if (nIndex > -1) next.splice(nIndex, 1);
      } else if (primed.length + next.length < xTargets && nIndex < 0) {
        // const tTotal = primed.length + next.length;
        // this.ns.tprint(
        //   `:: Need [${xTargets - tTotal}] Under Target: ${tTotal} (${
        //     primed.length
        //   }|${next.length})`
        // );
        next.push(sf);
      } else if (primed.length + next.length >= xTargets && nIndex < 0) {
        while (primed.length + next.length > xTargets) next.shift();
        if (sf.value > primed[primed.length - 1].value) {
          next.shift();
          next.push(sf);
        }
      }
      // const debug = primed.length + next.length;
      // this.ns.tprint(`DEBUG: ${debug} (${primed.length}|${next.length})`);
    }

    // Create a list of targets to focus from easy to hard
    primed.forEach((sf: SFocus) => qHosts.push(sf.id));
    next.forEach((sf: SFocus) => qHosts.push(sf.id));
    const targets = qHosts.map((h: string) => new ServerTarget(this.ns, h));
    this.tPrimed = primed;
    this.tNext = next;
    this.targets = targets;
    await this.updatePorts();
    return targets;

    // this.ns.tprint('Primed End ========');
    // this.ns.tprint(primed);
    // this.ns.tprint('Next End ========');
    // this.ns.tprint(next);
    // this.ns.tprint(`qTargets ========`); // FIXME: remove
    // const debug = qTargets.map((st: ServerTarget) => ({
    //   hostname: st.hostname,
    //   value: st.x.bValue,
    //   primed: st.status.action === X.HACK.A,
    // }));
    // this.ns.tprint(debug);
  }
}

// ******** Main function
export async function main(ns: NS) {
  ns.ui.clearTerminal(); // FIXME:
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
  // await puppeteer.updateTargets(); // FIXME: await
  await puppeteer.xTargets(); // TODO: DEBUG
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

const samplePrimed = [
  { id: 'nectar-net', value: 232.86534455603163, primed: true },
  { id: 'neo-net', value: 416.75349031048137, primed: true },
  { id: 'harakiri-sushi', value: 488.8899753110562, primed: true },
  { id: 'max-hardware', value: 955.7214263186567, primed: true },
];

const sampleNext = [
  { id: 'neo-net', value: 416.75349031048137, primed: true },
  { id: 'nectar-net', value: 232.86534455603163, primed: true },
  { id: 'harakiri-sushi', value: 488.8899753110562, primed: true },
];
