/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT, DEPLOY } from '/os/configs';
import { Server, ServerInfo } from '/os/modules/Server';
import { ServerTarget, X } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Globals
const { xBuffer, xDelay, xBatches, xTargets, xPrimed } = CONFIGS.hacking;
const { xHack, xWeak, xGrow } = DEPLOY;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;

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
    st.batches, // > 0 ? st.batches : '', // HWGW (Batches)
    mA, // Action
    mUpdate // Update
  );
}

// ******** PUPPETEER INTERFACES
interface SNode {
  id: string;
  ramMax: number;
  ramNow: number;
}

interface SFocus {
  id: string;
  value: number;
  primed: boolean;
}

// ******** PUPPETEER UTILITY FUNCTIONS
function cThreads(ram: number, script = 1.6): number {
  return Math.floor(ram / script);
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
  nRamMax: number;
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
    this.nRamMax = 0;
    this.nodes = []; // this.updateNodes();

    // Targets
    this.targets = [];
    this.tPrimed = [];
    this.tNext = [{ id: 'n00dles', value: -1, primed: false }];
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

  updateNodes(): SNode[] {
    let ram = 0;
    let ramNow = 0;
    let ramMax = 0;
    const n = this.nHosts
      .map((h: string) => {
        const s = ServerInfo.details(this.ns, h);
        ram += s.ram.max;
        ramNow += s.ram.now;
        if (s.ram.max > ramMax) ramMax = s.ram.max;
        return {
          id: s.hostname,
          ramMax: s.ram.max,
          ramNow: s.ram.now,
        };
      })
      .sort((a: any, b: any) => b.ramMax - a.ramMax);

    this.nRam = ram;
    this.nRamNow = ramNow;
    this.nRamMax = ramMax;
    return n;
  }

  async updateTargets() {
    const qHosts: string[] = [];
    const primed = [...this.tPrimed]; // Shallow copy
    const next = [...this.tNext]; // Shallow copy

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

      if (sf.primed) {
        if (primed.length < xPrimed && pIndex < 0) {
          primed.push(sf);
        } else if (
          primed.length >= xPrimed &&
          pIndex < 0 &&
          sf.value > primed[primed.length - 1].value
        ) {
          while (primed.length > xPrimed) primed.shift();
          primed.shift();
          primed.push(sf);
        }

        if (nIndex > -1) next.splice(nIndex, 1);
      } else if (
        primed.length + next.length < xTargets &&
        nIndex < 0 &&
        pIndex < 0
      ) {
        next.push(sf);
      } else if (
        primed.length + next.length >= xTargets &&
        nIndex < 0 &&
        pIndex < 0
      ) {
        while (primed.length + next.length > xTargets) next.shift();
        if (sf.value > primed[primed.length - 1].value) {
          next.shift();
          next.push(sf);
        }
      }
    }

    // Create a list of targets to focus from easy to hard as simple strings for speed filter
    primed.forEach((sf: SFocus) => qHosts.push(sf.id));
    next.forEach((sf: SFocus) => qHosts.push(sf.id));
    const targets = qHosts.map((h: string) => new ServerTarget(this.ns, h));
    this.tPrimed = primed;
    this.tNext = next;
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
      primedCount: this.tPrimed.length,
      primed: this.tPrimed,
      nextCount: this.tNext.length,
      next: this.tNext,
    };
    this.ns.clearPort(PORTS.PUPPETEER);
    await this.ns.tryWritePort(PORTS.PUPPETEER, portData);
  }

  // ******** FUNCTIONS
  hack(st: ServerTarget) {
    // this.ns.tprint(`We would HACK ${st.hostname}`);
    if (st.nextUpdate < performance.now()) {
      const nodes = this.updateNodes().filter(
        (n: SNode) => n.ramNow > xWeakRam
      );
      const { nRamNow } = this;
      const { hThreads, wThreads, gThreads, wagThreads } = st.x;
      const sTime = performance.now() + xDelay * 2;
      const eTime = sTime + st.x.wTime;
      const hTime = eTime - st.x.hTime - xBuffer * 3;
      const wTime = eTime - st.x.wTime - xBuffer * 2;
      const gTime = eTime - st.x.gTime - xBuffer * 1;
      const wagTime = sTime;
      let dBuff = 1;
      let fBatch = false;
      st.setBatches = 0;
      // this.ns.tprint(`Batches Pre: ${st.batches}`);

      if (nRamNow > st.x.bRam) {
        // We have the potential for partial batch nodes
        let pBatches = Math.floor((nRamNow * 0.8) / st.x.bRam);
        pBatches = pBatches > xBatches ? xBatches : pBatches;
        // this.ns.tprint(`We can do ${pBatches} Batches`);
        let rhThreads = hThreads;
        let rwThreads = wThreads;
        let rgThreads = gThreads;
        let rwagThreads = wagThreads;
        for (let i = 0; i < nodes.length; i += 1) {
          const n = new Server(this.ns, nodes[i].id);
          while (pBatches > 0 && n.ram.now > xWeakRam) {
            if (rhThreads > 0 && n.ram.now > xHackRam) {
              // Do Hack
              let nhT = Math.floor(n.ram.now / xHackRam);
              const nhTime = hTime + dBuff * xDelay;
              nhT = rhThreads > nhT ? nhT : rhThreads;
              if (nhT > 0) {
                this.ns.exec(
                  xHack,
                  n.hostname,
                  nhT,
                  st.hostname,
                  false,
                  nhTime
                );
                rhThreads -= nhT;
                fBatch = true;
                // this.ns.tprint(
                //   `Batch: [${dBuff}]${n.hostname} fired ${nhT} Hack threads (${rhThreads}) Remain`
                // );
              }
            }

            if (rwThreads > 0 && n.ram.now > xWeakRam) {
              // Do Weak
              let nwT = Math.floor(n.ram.now / xWeakRam);
              const nwTime = wTime + dBuff * xDelay;
              nwT = rwThreads > nwT ? nwT : rwThreads;
              if (nwT > 0) {
                this.ns.exec(
                  xWeak,
                  n.hostname,
                  nwT,
                  st.hostname,
                  false,
                  nwTime
                );
                rwThreads -= nwT;
                fBatch = true;
                // this.ns.tprint(
                //   `Batch: [${dBuff}]${n.hostname} fired ${nwT} Weak threads (${rwThreads}) Remain`
                // );
              }
            }

            if (rgThreads > 0 && n.ram.now > xGrowRam) {
              // Do Grow
              let ngT = Math.floor(n.ram.now / xGrow);
              const ngTime = gTime + dBuff * xDelay;
              ngT = rwThreads > ngT ? ngT : rgThreads;
              if (ngT > 0) {
                this.ns.exec(
                  xGrow,
                  n.hostname,
                  ngT,
                  st.hostname,
                  false,
                  ngTime
                );
                rgThreads -= ngT;
                fBatch = true;
                // this.ns.tprint(
                //   `Batch: [${dBuff}]${n.hostname} fired ${ngT} Grow threads (${rgThreads}) Remain`
                // );
              }
            }

            if (rwagThreads > 0 && n.ram.now > xWeakRam) {
              // Do Weak after grow
              let nwagT = Math.floor(n.ram.now / xWeakRam);
              const nwagTime = wagTime + dBuff * xDelay;
              nwagT = rwagThreads > nwagT ? nwagT : rwagThreads;
              if (nwagT > 0) {
                this.ns.exec(
                  xWeak,
                  n.hostname,
                  nwagT,
                  st.hostname,
                  false,
                  nwagTime
                );
                rwagThreads -= nwagT;
                fBatch = true;
                // this.ns.tprint(
                //   `Batch: [${dBuff}]${n.hostname} fired ${nwagT} Weak after threads (${rwagThreads}) Remain`
                // );
              }
            }

            if (
              rhThreads <= 0 &&
              rwThreads <= 0 &&
              rgThreads <= 0 &&
              rwagThreads <= 0
            ) {
              rhThreads = hThreads;
              rwThreads = wThreads;
              rgThreads = gThreads;
              rwagThreads = wagThreads;
              pBatches -= 1;
              st.setBatches = dBuff;
              dBuff += 1;
              fBatch = true;
            }
          }
        }
      }
      // else if (nRamNow > xHackRam) {
      //   this.ns.tprint('Partial hack:');
      //   this.ns.tprint(nodes);
      // }

      // this.ns.tprint(`Batches Post: ${st.batches}`);
      if (fBatch) st.update(st.x.wTime + xDelay + dBuff * xDelay + 3000);
      // st.update(TIME.SERVERS);
    } else st.update(TIME.SERVERS);
  }

  weak(st: ServerTarget) {
    // this.ns.tprint(`We would WEAK ${st.hostname}`);
    if (st.nextUpdate < performance.now()) {
      const nodes = this.updateNodes().filter(
        (n: SNode) => n.ramNow > xWeakRam
      );
      const dTime = performance.now() + xDelay;
      let { pwThreads: rwThreads } = st.x;
      let fWeak = false;
      if (rwThreads > 0) {
        for (let i = 0; i < nodes.length; i += 1) {
          const n = nodes[i];
          let nwThreads = Math.floor(n.ramNow / xWeakRam);
          nwThreads = rwThreads > nwThreads ? nwThreads : rwThreads;
          if (nwThreads > 0) {
            this.ns.exec(xWeak, n.id, nwThreads, st.hostname, false, dTime); // FIXME:
            rwThreads -= nwThreads;
            fWeak = true;
          }
          if (rwThreads <= 0) break;
        }
        // this.ns.tprint(`Still need: ${rwThreads}`);
      }
      if (fWeak) st.update(st.x.wTime + xDelay * 3);
      // else st.update(TIME.SERVERS);
    } else st.update(TIME.SERVERS);
  }

  // async grow(st: ServerTarget) {
  grow(st: ServerTarget) {
    // this.ns.tprint(`We would GROW ${st.hostname}`);
    if (st.nextUpdate < performance.now()) {
      const nodes = this.updateNodes().filter(
        (n: SNode) => n.ramNow > xWeakRam
      );
      const dTime = performance.now() + xDelay;
      let { pgThreads: rgThreads } = st.x;
      let fGrow = false;
      if (rgThreads > 0) {
        for (let i = 0; i < nodes.length; i += 1) {
          const n = nodes[i];
          let ngThreads = Math.floor(n.ramNow / xGrowRam);
          ngThreads = rgThreads > ngThreads ? ngThreads : rgThreads;
          if (ngThreads > 0) {
            this.ns.exec(xGrow, n.id, ngThreads, st.hostname, false, dTime);
            rgThreads -= ngThreads;
            fGrow = true;
          }
          if (rgThreads <= 0) break;
        }
        // this.ns.tprint(`Still need: ${rwThreads}`);
      }
      if (fGrow) st.update(st.x.gTime + xDelay * 3);
      // else st.update(TIME.SERVERS);
    } else st.update(TIME.SERVERS);
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
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Puppeteer X3');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW - xOX, 0);
  const start = performance.now();

  // ******** Initialize (One Time Code)
  let cLevel = -1;
  // console.profile('Puppeteer'); // FIXME:
  const puppeteer = new Puppeteer(ns);
  // console.time('Puppeteer :: updateTargets'); // FIXME:
  // await puppeteer.updateTargets();
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
    const { nRam, nRamNow, nRamMax } = puppeteer;

    // ******** Display
    const mRam = ns.formatRam(nRam, 1);
    const mRamNow = ns.formatRam(nRamNow, 1);
    const mRamMax = ns.formatRam(nRamMax, 1);
    const mStats = `🔋${mRamNow}/${mRam} | 💎${mRamMax}`;
    ns.print(`[Time] ${formatTime(ns, now - start)} | ${mStats}`);
    updateHeaders(ns);

    const { hacking: pLevel } = ns.getPlayer().skills;
    // ******** Update Nodes & Servers on change
    if (pLevel > cLevel) {
      cLevel = pLevel;
      await puppeteer.updateTargets();
    }

    // ns.print('===== DEBUG =====');
    // const sample = puppeteer.targets[0];
    // ns.print(performance.now());
    // ns.print(sample.updateAt);
    // ns.print(sample.status);
    // ns.print(sample.getStatus());

    // ns.print('===== DEBUG =====');

    // Using for of so we can await
    // ******** Puppeteer (loop time code)
    // console.time('Puppeteer :: DisplayTargets'); // FIXME:
    for (const st of puppeteer.targets as ServerTarget[]) {
      // Display
      if (st.nextUpdate < now) {
        const { action } = st.status;
        switch (action) {
          case X.HACK.A: {
            // await puppeteer.hack(st);
            puppeteer.hack(st);
            // st.update(st.x.wTime + xDelay);
            break;
          }
          case X.WEAK.A: {
            // await puppeteer.weak(st);
            puppeteer.weak(st);
            // if (res) st.update(st.x.wTime + xDelay);
            break;
          }
          case X.GROW.A: {
            // await puppeteer.grow(st);
            puppeteer.grow(st);
            // st.update(st.x.gTime + xDelay);
            break;
          }
          case X.WAIT.A: {
            st.update(TIME.SERVERS);
            break;
          }
          case X.RISK.A: {
            st.update(TIME.SERVERS);
            break;
          }
          default:
            st.update(TIME.SERVERS);
            break;
        }
      }
      updateRow(ns, st, now);
    }
    // console.timeEnd('Puppeteer :: DisplayTargets'); // FIXME:
    // profiler += 1; // FIXME:

    await ns.asleep(TIME.PUPPETEER);
  }
  // console.profileEnd('Puppeteer'); // FIXME:
  // console.profileEnd();
  // console.timeEnd('Puppeteer'); // FIXME:
}
