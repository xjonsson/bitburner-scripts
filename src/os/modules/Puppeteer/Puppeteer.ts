/* eslint-disable */
import { NS } from '@ns';
import { updateRow, updateHeaders } from '/os/modules/Puppeteer/display';
import { CONFIGS, TIME, PORTS, LAYOUT, DEPLOY } from '/os/configs';
import { Server, ServerInfo } from '/os/modules/Server';
import { TServer } from '/os/modules/ServerTarget';
import { formatTime } from '/os/utils/formatTime';
import { Banner, BG, Text } from '/os/utils/colors';
import { PTList, PuppeteerCache } from '/os/modules/Cache';
/* eslint-enable */

// ******** Globals
const { xBuffer, xDelay, xBatches, xBatchesMax, xTargets, xPrimed } =
  CONFIGS.hacking;
const { wRamRatio, sRamRatio } = CONFIGS.ramRatio;
const { HACK, WEAK, GROW, WAIT, RISK } = DEPLOY;

// ******** PUPPETEER INTERFACES
interface SNode {
  id: string;
  ramMax: number;
  ramNow: number;
}

// ******** PUPPETEER CLASS
export default class Puppeteer {
  ns: NS;
  aHosts: string[];
  tHosts: string[];
  nHosts: string[];
  nRam: number;
  nRamNow: number;
  nRamMax: number;
  dBRam: number[];
  dBatch: number;
  nodes: SNode[];
  targets: TServer[];

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
    this.dBRam = [];
    this.dBatch = xBatches;
    this.nodes = [];
    this.updateNodes();
    this.targets = [];
  }

  // ******** METHODS
  updateDRam(): number {
    const { dBRam } = this;
    if (dBRam.length === 0) this.dBatch = xBatches;
    while (dBRam.length > 10) dBRam.shift();
    const avg = dBRam.reduce((sum, curr) => sum + curr, 0) / dBRam.length;
    let { dBatch } = this;
    if (avg >= wRamRatio) dBatch += 8;
    if (avg < sRamRatio) dBatch -= 8;
    if (dBatch > xBatchesMax) dBatch = xBatchesMax;
    if (dBatch < xBatches) dBatch = xBatches;
    this.dBatch = dBatch;
    return this.dBatch;
  }

  updateHosts() {
    const tHosts: string[] = [];
    const nHosts: string[] = [];

    this.aHosts.forEach((h: string) => {
      const s = new Server(this.ns, h);
      if (s.isCash) tHosts.push(s.hostname);
      if (s.isNode) nHosts.push(s.hostname);
    });

    this.tHosts = tHosts;
    this.nHosts = nHosts;
    return { tHosts, nHosts };
  }

  updateNodes(): SNode[] {
    let nRam = 0;
    let nRamNow = 0;
    let nRamMax = 0;
    const nodes = this.nHosts
      .map((h: string) => {
        const s = ServerInfo.details(this.ns, h);
        nRam += s.ram.max;
        nRamNow += s.ram.now;
        if (s.ram.max > nRamMax) nRamMax = s.ram.max;
        return {
          id: s.hostname,
          ramMax: s.ram.max,
          ramNow: s.ram.now,
        };
      })
      .sort((a, b) => b.ramMax - a.ramMax);

    this.nRam = nRam;
    this.nRamNow = nRamNow;
    this.nRamMax = nRamMax;
    this.dBRam.push(nRamNow / nRam);
    this.updateDRam();
    this.nodes = nodes;
    return nodes;
  }

  updateTargets() {
    const { ns, targets: ct } = this;

    if (ct.length === 0) {
      ns.tprint(Banner.arg('Targets', 'No targets'));
      const pTargets = PuppeteerCache.read(ns).targets;
      if (pTargets.length === 0) {
        ns.tprint(Banner.arg('Targets', 'No Port targets'));
        ns.tprint(Text.insert(':: Adding n00dles'));
        ct.push(new TServer(ns, 'n00dles'));
      } else {
        ns.tprint(Banner.arg('Targets', 'Port Targets'));
        for (let pti = 0; pti < pTargets.length; pti += 1) {
          const pt = pTargets[pti]; // Port Target
          const ot = new TServer(ns, pt.hostname, pt.updateAt); // Old Target
          if (ot.status.action !== RISK.A) {
            ns.tprint(Text.insert(`:: Adding ${ot.hostname}`));
            ct.push(ot);
          }
        }
      }
    }

    const ctPrimes = ct.filter((st) => st.status.action === HACK.A);
    let ctPrimed = ctPrimes.length;
    const ctRisks = ct.filter((st) => st.status.action === RISK.A);
    const ctRisked = ctRisks.length;
    if (ct.length < xTargets || ctPrimed >= xPrimed || ctRisked > 0) {
      const aTargets = this.tHosts
        .reduce((ast: TServer[], h) => {
          const st = new TServer(ns, h);
          if (st.isTarget) ast.push(st);
          return ast;
        }, [])
        .sort((a, b) => b.bValue - a.bValue);

      while (aTargets.length > 0) {
        const qt = aTargets.pop() as TServer;
        const { hostname, bValue } = qt;
        const prime = qt.status.action === HACK.A;
        const risk = qt.status.action === RISK.A;
        const cIndex = ct.findIndex((pt) => pt.hostname === hostname);

        if (risk && cIndex > -1) ct.splice(cIndex, 1);
        else if (prime && cIndex < 0) {
          if (ctPrimed < xPrimed) {
            ct.push(qt);
            ctPrimed += 1;
            ns.tprint(Banner.cyan('Prime', `Under adding ${qt.hostname}`));
          } else {
            const dIndex = ct.reduce((pqI, dT, qI, aST) => {
              const { action } = dT.status;
              if (action === HACK.A && dT.bValue < aST[pqI].bValue) return qI;
              return pqI;
            }, 0);
            const dPrime = ct[dIndex];
            if (bValue > dPrime.bValue) {
              ns.tprint(
                Banner.red(
                  'Prime',
                  `Swap ${dPrime.hostname} with ${qt.hostname}`,
                ),
              );
              ct[dIndex] = qt;
            }
          }
        } else if (cIndex < 0) {
          if (ct.length < xTargets) {
            ct.push(qt);
            ns.tprint(Banner.blue('Next', `Under adding ${qt.hostname}`));
          } else {
            const dIndex = ct.reduce((pqI, dT, qI, aST) => {
              const { action } = dT.status;
              const valid = action !== HACK.A && action !== RISK.A;
              if (aST[pqI].status.action === HACK.A) return qI;
              if (valid && dT.bValue < aST[pqI].bValue) return qI;
              return pqI;
            }, 0);
            const dNext = ct[dIndex];
            if (bValue > dNext.bValue) {
              ns.tprint(
                Banner.red(
                  'Next',
                  `Swap ${dNext.hostname} with ${qt.hostname}`,
                ),
              );
              ct[dIndex] = qt;
            }
          }
        }
      }
    }
    this.updatePorts();
  }

  updatePorts() {
    const targets = this.targets.map((st) => {
      const { ns, pMult, pMultBN, ...t } = st; // Strips NS but also functions
      return t;
    });
    const { ns, dBatch } = this;
    return PuppeteerCache.update(ns, dBatch, targets.length, targets);
  }

  // ******** FUNCTIONS
  hack(st: TServer) {
    if (st.updateAt < performance.now()) {
      st.batches = 0;
      const { ns } = this;
      const nodes = this.updateNodes().filter((n: SNode) => n.ramNow > st.bRam);
      const { hTh, wTh, gTh, wagTh, bRam } = st;
      // this.ns.tprint(nodes);
      const sTime = performance.now() + xDelay;
      const eTime = sTime + st.wTime + xBuffer;
      const hTime = eTime - xBuffer * 3 - (st.hTime + xBuffer);
      const wTime = eTime - xBuffer * 2 - (st.wTime + xBuffer);
      const gTime = eTime - xBuffer * 1 - (st.gTime + xBuffer);
      const wagTime = eTime - (st.wTime + xBuffer);
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
            const nhTime = hTime + nBuffer * xBuffer;
            const nwTime = wTime + nBuffer * xBuffer;
            const ngTime = gTime + nBuffer * xBuffer;
            const nwagTime = wagTime + nBuffer * xBuffer;
            ns.exec(HACK.X, nID, hTh, tID, false, nhTime);
            ns.exec(WEAK.X, nID, wTh, tID, false, nwTime);
            ns.exec(GROW.X, nID, gTh, tID, false, ngTime);
            ns.exec(WEAK.X, nID, wagTh, tID, false, nwagTime);
            nBuffer += 1;
            st.setBatches = st.batches + 1;
          }
        });
        return eTime - sTime + nBuffer * xBuffer + xDelay;
      }
      if (this.nRamNow > st.bRam) {
        const split = this.updateNodes().filter(
          (n: SNode) => n.ramNow > WEAK.R,
        );
        let pBatches = Math.floor((this.nRamNow * 0.8) / st.bRam);
        // ns.tprint(`Split batch ${st.hostname} (${pBatches})`);
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
              if (rhTh > 0 && n.ram.now > HACK.R) {
                let nhTh = Math.floor(n.ram.now / HACK.R);
                nhTh = rhTh > nhTh ? nhTh : rhTh;
                const nhTime = hTime + nBuffer * xBuffer;
                ns.exec(HACK.X, nID, nhTh, tID, false, nhTime);
                rhTh -= nhTh;
              }
              if (rwTh > 0 && n.ram.now > WEAK.R) {
                let nwTh = Math.floor(n.ram.now / WEAK.R);
                nwTh = rwTh > nwTh ? nwTh : rwTh;
                const nwTime = wTime + nBuffer * xBuffer;
                ns.exec(WEAK.X, nID, nwTh, tID, false, nwTime);
                rwTh -= nwTh;
              }
              if (rgTh > 0 && n.ram.now > GROW.R) {
                let ngTh = Math.floor(n.ram.now / GROW.R);
                ngTh = rgTh > ngTh ? ngTh : rgTh;
                const ngTime = gTime + nBuffer * xBuffer;
                ns.exec(GROW.X, nID, ngTh, tID, false, ngTime);
                rgTh -= ngTh;
              }
              if (rwagTh > 0 && n.ram.now > WEAK.R) {
                let nwagTh = Math.floor(n.ram.now / WEAK.R);
                nwagTh = rwagTh > nwagTh ? nwagTh : rwagTh;
                const nwagTime = wagTime + nBuffer * xBuffer;
                ns.exec(WEAK.X, nID, nwagTh, tID, false, nwagTime);
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
    return TIME.SERVERS;
  }

  weak(st: TServer) {
    const nodes = this.updateNodes().filter((n: SNode) => n.ramNow > WEAK.R);
    const wTime = performance.now() + xDelay;
    let { pwTh: rwTh } = st;
    let fWeak = false;
    if (rwTh > 0) {
      for (let i = 0; i < nodes.length; i += 1) {
        const n = new Server(this.ns, nodes[i].id);
        let nwTh = Math.floor(n.ram.now / WEAK.R);
        nwTh = rwTh > nwTh ? nwTh : rwTh;
        if (nwTh > 0 && n.ram.now > WEAK.R) {
          this.ns.exec(WEAK.X, n.id, nwTh, st.hostname, false, wTime);
          rwTh -= nwTh;
          fWeak = true;
        }
        if (rwTh <= 0) break;
      }
    }
    if (fWeak) return st.wTime + xDelay * 3; // TODO: Check timings, could break
    return TIME.SERVERS;
  }

  grow(st: TServer) {
    const nodes = this.updateNodes().filter((n: SNode) => n.ramNow > WEAK.R);
    // const dTime = performance.now() + xDelay;
    const { hostname: tID } = st;
    const sTime = performance.now() + xDelay;
    const eTime = sTime + st.wTime + xBuffer;
    const gTime = eTime - xBuffer * 1 - (st.gTime + xBuffer);
    const wagTime = eTime - (st.wTime + xBuffer);
    let { pgTh: rgTh } = st;
    let rwagTh = Math.ceil(rgTh / 12.5);
    let fGrow = false;
    let fWeak = false;
    if (rgTh > 0) {
      for (let i = 0; i < nodes.length; i += 1) {
        const n = new Server(this.ns, nodes[i].id);
        const { hostname: nID } = n;
        if (rgTh > 0 && n.ram.now > GROW.R) {
          let ngTh = Math.floor(n.ram.now / GROW.R);
          ngTh = rgTh > ngTh ? ngTh : rgTh;
          this.ns.exec(GROW.X, nID, ngTh, tID, false, gTime);
          rgTh -= ngTh;
          fGrow = true;
        }
        if (rwagTh > 0 && n.ram.now > WEAK.R) {
          let nwagTh = Math.floor(n.ram.now / WEAK.R);
          nwagTh = rwagTh > nwagTh ? nwagTh : rwagTh;
          this.ns.exec(WEAK.X, nID, nwagTh, tID, false, wagTime);
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
  const { xW, xH, xOX, xOY } = LAYOUT.PUPPETEER;
  const wWidth = ns.ui.windowSize()[0];
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.disableLog('asleep');
  ns.disableLog('scan');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Puppeteer');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW - xOX, xOY - 0);
  const start = performance.now();

  // ******** Initialize (One Time Code)
  let cLevel = -1;
  const puppeteer = new Puppeteer(ns);
  ns.tprint(Banner.class('Puppeteer', 'Starting...'));

  // ******** Primary (Loop Time Code)
  while (true) {
    ns.clearLog();
    // ******** Consts
    const now = performance.now();
    const { nRam, nRamNow, nRamMax } = puppeteer;

    // ******** Display
    const mRam = ns.formatRam(nRam, 1);
    const mRamNow = ns.formatRam(nRamNow, 1);
    const mRamMax = ns.formatRam(nRamMax, 1);
    const mStats = `🔋${mRamNow}/${mRam} | 💎${mRamMax}`;
    const mBatch = `⚔️${puppeteer.dBatch}`;
    ns.print(`[Time] ${formatTime(ns, now - start)} | ${mStats} ${mBatch}`);
    updateHeaders(ns);

    const { hacking: pLevel } = ns.getPlayer().skills;
    // ******** Update Nodes & Servers on change
    if (pLevel > cLevel) {
      cLevel = pLevel;
      puppeteer.updateHosts();
      puppeteer.updateTargets();
    }

    // Using for of so we can await
    // ******** Puppeteer (loop time code)
    for (const st of puppeteer.targets) {
      // Display
      updateRow(ns, st, now);
      if (st.updateAt < now) {
        st.update();
        const { action } = st.status;
        switch (action) {
          case HACK.A: {
            const delay = puppeteer.hack(st);
            st.setUpdate(delay);
            // st.setUpdate(TIME.SERVERS); // FIXME:
            // ns.tprint(Banner.magenta('HACK', st.hostname));
            break;
          }
          case WEAK.A: {
            const delay = puppeteer.weak(st);
            st.setUpdate(delay);
            // st.setUpdate(TIME.SERVERS); // FIXME:
            // ns.tprint(Banner.yellow('WEAK', st.hostname));
            break;
          }
          case GROW.A: {
            const delay = puppeteer.grow(st);
            st.setUpdate(delay);
            // st.setUpdate(TIME.SERVERS); // FIXME:
            // ns.tprint(Banner.bGreen('GROW', st.hostname));
            break;
          }
          case WAIT.A: {
            st.setUpdate(TIME.SERVERS);
            // ns.tprint(Banner.show('WAIT', st.hostname));
            break;
          }
          case RISK.A: {
            st.setUpdate(TIME.SERVERS);
            // ns.tprint(Banner.red('RISK', st.hostname));
            break;
          }
          default:
        }
      }
      if (Number.isNaN(st.updateAt)) st.setUpdate(TIME.SERVERS);
    }

    await ns.asleep(TIME.PUPPETEER);
  }
}
