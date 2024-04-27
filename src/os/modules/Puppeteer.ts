/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, TIME, PORTS, LAYOUT, DEPLOY } from '/os/configs';
import { Server, ServerInfo } from '/os/modules/Server';
import { ServerTarget, X } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Globals
const { xBuffer, xDelay, xBatches, xBatchesMax, xTargets, xPrimed } =
  CONFIGS.hacking;
const { wRamRatio, sRamRatio } = CONFIGS.ramRatio;
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
  '%4s ' + // Chance
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
  const mUpdate = Number.isFinite(st.updateAt)
    ? formatTime(ns, st.updateAt - now)
    : 'ERROR';
  let mMoney = '';
  // let mChance = st.x.hackChance > 0 ? st.x.hackChance : 0;
  // mChance = st.x.hackChance < 1 ? ns.formatNumber(st.x.hackChance, 1) : '';
  let mSec = '';
  let mPrepped = '✅';
  let mHack = ns.formatNumber(st.x.hThreads, 0);
  let mWeak = ns.formatNumber(st.x.wThreads, 0);
  let mGrow = ns.formatNumber(st.x.gThreads, 0);
  let mWeakAG = ns.formatNumber(st.x.wagThreads, 0);
  const mRam = ns.formatRam(st.x.bRam, 0); // FIXME: let vs const
  let mTime = st.x.wTime > 0 ? formatTime(ns, st.x.wTime) : st.x.wTime;

  if (mA === X.WEAK.A) mSec = `+${ns.formatNumber(sNow - sMin, 1)}`;
  if (mA === X.GROW.A) {
    mMoney = ns.formatPercent(mNow / mMax, 0);
    mTime = st.x.gTime > 0 ? formatTime(ns, st.x.gTime) : st.x.gTime;
  }
  if (mA !== X.HACK.A) {
    mPrepped = '❌';
    mHack = '';
    mWeak = st.x.pwThreads > 0 ? ns.formatNumber(st.x.pwThreads, 0) : '';
    mGrow = st.x.pgThreads > 0 ? ns.formatNumber(st.x.pgThreads, 0) : '';
    mWeakAG = ns.formatNumber(st.x.wagThreads, 0);
    // mRam = ''; // FIXME:
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
    mTime, // Action Time
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
  dBatchRam: Array<number>;
  dBatch: number;
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
    this.dBatchRam = [];
    this.dBatch = xBatches;
    this.nodes = []; // this.updateNodes();

    // Targets
    this.targets = [];
    this.tPrimed = [];
    this.tNext = [{ id: 'n00dles', value: -1, primed: false }];
  }

  // ******** METHODS
  updateDynBatch(): number {
    const { dBatchRam: dBRA } = this;
    if (dBRA.length === 0) this.dBatch = xBatches;
    while (dBRA.length > 10) dBRA.shift();
    const avg = dBRA.reduce((sum, curr) => sum + curr, 0) / dBRA.length;
    // this.ns.tprint(`DBR Average: ${avg}`);
    let { dBatch } = this;
    if (avg >= wRamRatio) dBatch += 8;
    if (avg < sRamRatio) dBatch -= 8;
    if (dBatch > xBatchesMax) dBatch = xBatchesMax;
    if (dBatch < xBatches) dBatch = xBatches;
    // this.ns.tprint(`DBR dBatch ${dBatch} | cdBR ${this.dBR}`);
    this.dBatch = dBatch;
    return this.dBatch;
  }

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
    this.dBatchRam.push(ramNow / ram);
    this.updateDynBatch(); // FIXME:
    return n;
  }

  updateTargets() {
    const { ns, targets: ct } = this;

    // Check for targets and reconnect
    if (ct.length === 0) {
      ns.tprint('No Puppeteer Targets');
      const pTargets = this.checkPorts().targets;
      if (pTargets.length === 0) {
        ns.tprint(':: No Port Targets - Adding n00dles');
        ct.push(new ServerTarget(ns, 'n00dles'));
      } else {
        ns.tprint(':: Port Targets');
        for (let pti = 0; pti < pTargets.length; pti += 1) {
          const pt = pTargets[pti];
          const ot = new ServerTarget(ns, pt.hostname, pt.updateAt);
          if (ot.status.action !== X.RISK.A) {
            ns.tprint(`:::: Adding ${pt.hostname}`);
            ct.push(ot);
          }
        }
      }
    }

    // Past initial check, do processing
    let ctPrimed = ct.filter(
      (st: ServerTarget) => st.status.action === X.HACK.A
    ).length;
    const ctRisk = ct.filter(
      (st: ServerTarget) => st.status.action === X.RISK.A
    );
    if (ct.length < xTargets || ctPrimed >= xPrimed || ctRisk.length > 0) {
      const aTargets = this.tHosts
        .reduce((ast: ServerTarget[], h: string) => {
          const st = new ServerTarget(ns, h);
          if (st.isTarget) ast.push(st);
          return ast;
        }, [])
        .sort((a: ServerTarget, b: ServerTarget) => b.x.bValue - a.x.bValue);

      while (aTargets.length > 0) {
        const qt = aTargets.pop() as ServerTarget;
        const { hostname: id } = qt;
        const { bValue: value } = qt.x;
        const primed = qt.status.action === X.HACK.A;
        const risk = qt.status.action === X.RISK.A;
        let cIndex = ct.findIndex((pt: ServerTarget) => pt.hostname === id);
        // ns.tprint(`${id} [${cIndex}|${primed}|${value.toFixed(0)}]`);

        if (ct.length < xTargets && cIndex < 0 && !risk && ctPrimed > 0) {
          // ns.tprint(`:: Added ${qt.hostname} Need [${xTargets - ct.length}]`);
          ct.push(qt);
          if (primed) ctPrimed += 1;
        } else if (primed && cIndex < 0) {
          if (ctPrimed < xPrimed) {
            // Under, just add it
            ct.push(qt);
            ctPrimed += 1;
          } else if (ctPrimed >= xPrimed) {
            // Primed and can replace a lower primed in list
            const dIndex = ct.reduce(
              (pI, curr: ServerTarget, i, st: ServerTarget[]) => {
                if (curr.status.action === X.HACK.A) {
                  if (curr.x.bValue < st[pI].x.bValue) return i;
                }
                return pI;
              },
              0
            );
            const dPrime = ct[dIndex];
            if (value > dPrime.x.bValue && cIndex < 0) {
              // ns.tprint(`:: PRIME ${ct[dIndex].hostname} for ${qt.hostname}`);
              ct[dIndex] = qt;
              cIndex = dIndex;
            }
          } else if (ctPrimed < xPrimed) {
            const dIndex = ct.reduce(
              (pI, curr: ServerTarget, i, st: ServerTarget[]) => {
                if (curr.status.action === X.HACK.A) {
                  if (curr.x.bValue < st[pI].x.bValue) return i;
                }
                return pI;
              },
              0
            );
            if (cIndex < 0) {
              // ns.tprint(`:: PRIME ${ct[dIndex].hostname} for ${qt.hostname}`);
              // drop a non prime for a prime if we are under FIXME:
              ct[dIndex] = qt;
              cIndex = dIndex;
            }
          }
        } else if (cIndex < 0) {
          // Not primed but can replace the lowest one
          const dIndex = ct.reduce(
            (pI, curr: ServerTarget, i, st: ServerTarget[]) => {
              const { action } = curr.status;
              if (action !== X.HACK.A && action !== X.RISK.A) {
                if (curr.x.bValue < st[pI].x.bValue) return i;
              }
              return pI;
            },
            0
          );
          const dNext = ct[dIndex];
          if (value > dNext.x.bValue && !risk) {
            // ns.tprint(`:: DROP ${ct[dIndex].hostname} for ${qt.hostname}`);
            ct[dIndex] = qt;
            cIndex = dIndex;
          }
        } else if (cIndex > -1 && risk) {
          // ns.tprint(`:: RISK ${qt.hostname}`);
          ct.splice(cIndex, 1);
        }
      }
    }
    // this.updateDynBatch(); FIXME:
    this.updatePorts();
  }

  updatePorts() {
    const targets = this.targets.map((st: ServerTarget) => {
      const { ns, pMult, pMultBN, ...t } = st; // Strips NS but also functions
      return t;
    });
    const portData = {
      dbr: this.dBatch,
      targetCount: targets.length,
      targets,
      primedCount: this.tPrimed.length,
      primed: this.tPrimed,
      nextCount: this.tNext.length,
      next: this.tNext,
    };
    this.ns.clearPort(PORTS.PUPPETEER);
    this.ns.tryWritePort(PORTS.PUPPETEER, portData);
  }

  checkPorts() {
    // this.ns.clearPort(PORTS.PUPPETEER);
    const data: any = this.ns.peek(PORTS.PUPPETEER);
    if (data === 'NULL PORT DATA') {
      return {
        targetCount: this.targets.length,
        targets: this.targets,
        primedCount: this.tPrimed.length,
        primed: this.tPrimed,
        nextCount: this.tNext.length,
        next: this.tNext,
      };
    }
    return data;
  }

  // ******** FUNCTIONS
  hack(st: ServerTarget) {
    if (st.updateAt < performance.now()) {
      st.batches = 0;
      const { ns } = this;
      const nodes = this.updateNodes().filter(
        (n: SNode) => n.ramNow > st.x.bRam
      );
      const {
        hThreads: hTh,
        wThreads: wTh,
        gThreads: gTh,
        wagThreads: wagTh,
        bRam,
      } = st.x;
      // this.ns.tprint(nodes);
      const sTime = performance.now() + xDelay;
      const eTime = sTime + st.x.wTime + xBuffer;
      const hTime = eTime - xBuffer * 3 - (st.x.hTime + xBuffer);
      const wTime = eTime - xBuffer * 2 - (st.x.wTime + xBuffer);
      const gTime = eTime - xBuffer * 1 - (st.x.gTime + xBuffer);
      const wagTime = eTime - (st.x.wTime + xBuffer);
      let nBuffer = 1;

      // Complete batch
      if (nodes.length > 0 && hTh > 0 && wTh > 0 && gTh > 0 && wagTh > 0) {
        nodes.forEach((sn: SNode) => {
          const n = new Server(ns, sn.id);
          const { hostname: nID } = n;
          const { hostname: tID } = st;
          // const nDelay = nBuffer * xBuffer;
          while (n.ram.now > bRam && st.batches < this.dBatch) {
            // while (n.ram.now > bRam && st.batches < xBatches) { // FIXME:
            ns.exec(xHack, nID, hTh, tID, false, hTime + nBuffer * xBuffer);
            ns.exec(xWeak, nID, wTh, tID, false, wTime + nBuffer * xBuffer);
            ns.exec(xGrow, nID, gTh, tID, false, gTime + nBuffer * xBuffer);
            ns.exec(xWeak, nID, wagTh, tID, false, wagTime + nBuffer * xBuffer);
            nBuffer += 1;
            st.setBatches = st.batches + 1;
          }
        });
        return eTime - sTime + nBuffer * xBuffer + xDelay;
      }
      if (this.nRamNow > st.x.bRam) {
        const split = this.updateNodes().filter(
          (n: SNode) => n.ramNow > xWeakRam
        );
        let pBatches = Math.floor((this.nRamNow * 0.8) / st.x.bRam);
        // ns.tprint(`Split batch ${st.hostname} (${pBatches})`);
        // pBatches = pBatches > xBatches ? xBatches : pBatches; // FIXME:
        pBatches = pBatches > this.dBatch ? this.dBatch : pBatches;
        if (pBatches > 0) {
          for (let c = 0; c < pBatches; c += 1) {
            let rhTh = hTh;
            let rwTh = wTh;
            let rgTh = gTh;
            let rwagTh = wagTh;
            for (let i = 0; i < split.length; i += 1) {
              const n = new Server(ns, split[i].id);
              const { hostname: nID } = n;
              const { hostname: tID } = st;
              if (rhTh > 0 && n.ram.now > xHackRam) {
                let nhTh = Math.floor(n.ram.now / xHackRam);
                nhTh = rhTh > nhTh ? nhTh : rhTh;
                const nhTime = hTime + nBuffer * xBuffer;
                ns.exec(xHack, nID, nhTh, tID, false, nhTime);
                rhTh -= nhTh;
              }
              if (rwTh > 0 && n.ram.now > xWeakRam) {
                let nwTh = Math.floor(n.ram.now / xWeakRam);
                nwTh = rwTh > nwTh ? nwTh : rwTh;
                const nwTime = wTime + nBuffer * xBuffer;
                ns.exec(xWeak, nID, nwTh, tID, false, nwTime);
                rwTh -= nwTh;
              }
              if (rgTh > 0 && n.ram.now > xGrowRam) {
                let ngTh = Math.floor(n.ram.now / xGrowRam);
                ngTh = rgTh > ngTh ? ngTh : rgTh;
                const ngTime = gTime + nBuffer * xBuffer;
                ns.exec(xGrow, nID, ngTh, tID, false, ngTime);
                rgTh -= ngTh;
              }
              if (rwagTh > 0 && n.ram.now > xWeakRam) {
                let nwagTh = Math.floor(n.ram.now / xWeakRam);
                nwagTh = rwagTh > nwagTh ? nwagTh : rwagTh;
                const nwagTime = wagTime + nBuffer * xBuffer;
                ns.exec(xWeak, nID, nwagTh, tID, false, nwagTime);
                rwagTh -= nwagTh;
              }
              if (rhTh <= 0 && rwTh <= 0 && rgTh <= 0 && rwagTh <= 0) {
                rhTh = hTh;
                rwTh = wTh;
                rgTh = gTh;
                rwagTh = wagTh;
                nBuffer += 1;
                st.setBatches = st.batches + 1;
              }
            }
          }
          return eTime - sTime + nBuffer * xBuffer + xDelay;
        }
      }
    }
  }

  weak(st: ServerTarget) {
    if (st.updateAt < performance.now()) {
      // st.update();
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
            this.ns.exec(xWeak, n.id, nwThreads, st.hostname, false, dTime);
            rwThreads -= nwThreads;
            fWeak = true;
          }
          if (rwThreads <= 0) break;
        }
      }
      if (fWeak) return st.x.wTime + xDelay * 3;
    }
    return TIME.SERVERS;
  }

  grow(st: ServerTarget) {
    const nodes = this.updateNodes().filter((n: SNode) => n.ramNow > xWeakRam);
    // const dTime = performance.now() + xDelay;
    const { hostname: tID } = st;
    const sTime = performance.now() + xDelay;
    const eTime = sTime + st.x.wTime + xBuffer;
    const gTime = eTime - xBuffer * 1 - (st.x.gTime + xBuffer);
    const wagTime = eTime - (st.x.wTime + xBuffer);
    let { pgThreads: rgTh } = st.x;
    let rwagTh = Math.ceil(rgTh / 12.5);
    let fGrow = false;
    let fWeak = false;
    if (rgTh > 0) {
      for (let i = 0; i < nodes.length; i += 1) {
        const n = new Server(this.ns, nodes[i].id);
        const { hostname: nID } = n;
        if (rgTh > 0 && n.ram.now > xGrowRam) {
          let ngTh = Math.floor(n.ram.now / xGrowRam);
          ngTh = rgTh > ngTh ? ngTh : rgTh;
          this.ns.exec(xGrow, nID, ngTh, tID, false, gTime);
          rgTh -= ngTh;
          fGrow = true;
        }
        if (rwagTh > 0 && n.ram.now > xWeakRam) {
          let nwagTh = Math.floor(n.ram.now / xWeakRam);
          nwagTh = rwagTh > nwagTh ? nwagTh : rwagTh;
          this.ns.exec(xWeak, nID, nwagTh, tID, false, wagTime);
          rwagTh -= nwagTh;
          fWeak = true;
        }
        if (rgTh <= 0 && rwagTh <= 0) break;
      }
    }
    if (fWeak || fGrow) return eTime - sTime + xDelay;
    // if (fGrow) return st.x.gTime + xDelay * 3;
    return TIME.SERVERS;
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
  ns.setTitle('Puppeteer');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW - xOX, 0);
  const start = performance.now();

  // ******** Initialize (One Time Code)
  let cLevel = -1;
  // let dTimer = 0; // FIXME:
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
  // console.log(`==== New Profiler ====`);
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
    ns.print(
      `[Time] ${formatTime(ns, now - start)} | ${mStats} ⚔️${puppeteer.dBatch}`
    ); // FIXME:
    updateHeaders(ns);

    const { hacking: pLevel } = ns.getPlayer().skills;
    // ******** Update Nodes & Servers on change
    if (pLevel > cLevel) {
      cLevel = pLevel;
      // await puppeteer.updateTargets();
      puppeteer.updateHosts();
      // puppeteer.updateNodes();
      puppeteer.updateTargets();
    }

    // if (dTimer >= 8) {
    //   // await puppeteer.updateTargets(); // FIXME:
    //   await puppeteer.xTargets(); // FIXME:
    //   dTimer = 0;
    // }

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
      updateRow(ns, st, now);
      if (st.updateAt < now) {
        st.update();
        const { action } = st.status;
        switch (action) {
          case X.HACK.A: {
            const delay = puppeteer.hack(st);
            st.setUpdate(delay);
            break;
          }
          case X.WEAK.A: {
            const delay = puppeteer.weak(st);
            st.setUpdate(delay);
            break;
          }
          case X.GROW.A: {
            const delay = puppeteer.grow(st);
            st.setUpdate(delay);
            break;
          }
          case X.WAIT.A: {
            st.setUpdate(TIME.SERVERS);
            break;
          }
          case X.RISK.A: {
            st.setUpdate(TIME.SERVERS);
            break;
          }
          default:
        }
      }
      if (Number.isNaN(st.updateAt)) st.setUpdate(TIME.SERVERS);
    }
    // console.timeEnd('Puppeteer :: DisplayTargets'); // FIXME:
    // profiler += 1; // FIXME:

    // dTimer += 1; // FIXME:

    await ns.asleep(TIME.PUPPETEER);
  }
  // console.profileEnd('Puppeteer'); // FIXME:
  // console.profileEnd();
  // console.timeEnd('Puppeteer'); // FIXME:
}
