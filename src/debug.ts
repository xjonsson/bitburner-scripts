/* eslint-disable */
import { NS } from '@ns';
import { configs } from 'configs.js';
import Server from './zServer';
/* eslint-enable */

function getProposal(s: any, skim: number) {
  return {
    hack: s.nodeBatchReduced(skim.toFixed(2)).hack,
    weak1: s.nodeBatchReduced(skim.toFixed(2)).weak1,
    grow: s.nodeBatchReduced(skim.toFixed(2)).grow,
    weak2: s.nodeBatchReduced(skim.toFixed(2)).weak2,
  };
}

function getRamRequired(proposed: any) {
  let ramRequired = 1.75 * proposed.hack;
  ramRequired += 1.8 * proposed.weak1;
  ramRequired += 1.8 * proposed.grow;
  ramRequired += 1.8 * proposed.weak2;
  return ramRequired;
}

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.disableLog('ALL');

  const home = new Server(ns, 'home');
  const s = new Server(ns, 'n00dles');
  // const s = new Server(ns, 'foodnstuff');
  const nvbHack = s.nodeValueBatch.hack;
  const nvbWeak1 = s.nodeValueBatch.weak1;
  const nvbGrow = s.nodeValueBatch.grow;
  const nvbWeak2 = s.nodeValueBatch.weak2;
  // ns.print(s.nodeValueHWGW);

  while (true) {
    while (!s.nodeReady) {
      // prepare;
      ns.clearLog();
      ns.print(`[Preparing] ${s.hostname}`);
      ns.print(`[HOME] ${home.ram.now} (${home.ram.used}/${home.ram.max})`);
      ns.print(`[HWGW] H${nvbHack} W${nvbWeak1} G${nvbGrow} W${nvbWeak2}`);

      if (home.nodeThreads(1.8) >= nvbGrow + nvbWeak1 + nvbWeak2) {
        ns.print('S1 Weak');
        if (nvbWeak1 > 0 && s.sec.now > s.sec.min) {
          ns.exec('xweak.js', 'home', nvbWeak1, s.hostname);
        }

        if (nvbGrow > 0 && s.money.now < s.money.max) {
          ns.print('S1 Grow');
          ns.exec('xgrow.js', 'home', nvbGrow, s.hostname);
        }
      } else if (
        nvbWeak1 > 0 &&
        s.sec.now > s.sec.min &&
        home.nodeThreads(1.8) > 0
      ) {
        ns.print('S2 Weak1');
        ns.exec(
          'xweak.js',
          'home',
          Math.min(nvbWeak1, home.nodeThreads(1.8)),
          s.hostname
        );
      } else if (
        nvbGrow > 0 &&
        s.money.now < s.money.max &&
        home.nodeThreads(1.8) > 0
      ) {
        ns.print('S2 Grow');
        ns.exec(
          'xgrow.js',
          'home',
          Math.min(nvbGrow, home.nodeThreads(1.8)),
          s.hostname
        );
      } else if (
        nvbWeak2 > 0 &&
        s.sec.now > s.sec.min &&
        home.nodeThreads(1.8) > 0
      ) {
        ns.print('S2 Weak2');
        ns.exec(
          'xweak.js',
          'home',
          Math.min(nvbWeak2, home.nodeThreads(1.8)),
          s.hostname
        );
      }
      await ns.sleep(1000);
    }

    while (s.nodeReady) {
      const timeHack = ns.getHackTime(s.hostname);
      const timeGrow = timeHack * 3.2;
      const timeWeak = timeHack * 4;
      const timeNow = performance.now();
      const timeNext = timeWeak + 3000 + timeNow;
      const next = [];
      let proposed = {
        hack: s.nodeValueBatch.hack,
        weak1: s.nodeValueBatch.weak1,
        grow: s.nodeValueBatch.grow,
        weak2: s.nodeValueBatch.weak2,
      };

      let ramRequired = getRamRequired(proposed);
      const ramAvailable = home.ram.now;

      ns.clearLog();
      let skim = 0.1;
      while (ramRequired > ramAvailable && skim >= 0.02) {
        skim -= 0.01;
        ns.print(`Reduce by 1% (${skim * 100})`);
        proposed = getProposal(s, skim);
        ramRequired = getRamRequired(proposed);
        if (
          proposed.hack === 0 ||
          proposed.grow === 0 ||
          proposed.weak1 === 0 ||
          proposed.weak2 === 0
        ) {
          skim = 0.1;
        }
        await ns.sleep(1000);
      }
      skim = 0.1;
      ns.print(proposed);
      ns.print(
        `[Batch] Have ${ns.formatRam(ramAvailable, 2)} Need (${ns.formatRam(
          ramRequired,
          2
        )})`
      );

      if (ramAvailable > ramRequired) {
        ns.print('Firing batch');
        ns.exec('xhack.js', 'home', proposed.hack, s.hostname, false, timeNext);
        ns.exec(
          'xweak.js',
          'home',
          proposed.weak1,
          s.hostname,
          false,
          timeNext + 40
        );
        ns.exec(
          'xgrow.js',
          'home',
          proposed.grow,
          s.hostname,
          false,
          timeNext + 80
        );
        ns.exec(
          'xweak.js',
          'home',
          proposed.weak2,
          s.hostname,
          false,
          timeNext + 120
        );
      }

      await ns.sleep(5000);
    }
    ns.print('We are out of sync, reprep');
    await ns.sleep(10000);
  }
}

const sample = {};
