/* eslint-disable */
import { NS } from '@ns';
import Player from './zPlayer';
import { configs } from './configs';
import Network from './zNetwork';
import Server from './server';
import { timeFormat } from './zUtils';
/* eslint-enable */

const { xMin, xHack, xWeak, xGrow, xShare } = configs;

export async function main(ns: NS) {
  const p = new Player(ns);
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('scan');
  ns.disableLog('sleep');

  const target = new Server(ns, p, 'n00dles');
  // const source = new Server(ns, p, 'ps-0');
  const sources = ns
    .getPurchasedServers()
    .map((s: string) => new Server(ns, p, s));
  sources.forEach((s: any) => {
    ns.scp([xMin, xHack, xWeak, xGrow, xShare], s.hostname, 'home');
  });
  let recheck = performance.now();
  // ns.print(performance.now());

  function flow(now: number, source: any) {
    switch (target.action) {
      case 'Weak': {
        if (now >= recheck) {
          ns.exec(
            'xweak.js',
            source.hostname,
            target.weakThreads,
            target.hostname
          );
          if (recheck < now + target.weakTime) {
            recheck = now + target.weakTime;
          }
        }
        break;
      }
      case 'Grow': {
        if (now >= recheck) {
          ns.exec(
            'xweak.js',
            source.hostname,
            target.weakThreads,
            target.hostname
          );
          if (recheck < now + target.growTime) {
            recheck = now + target.growTime;
          }
        }
        break;
      }
      case 'Hack': {
        const batch = target.batch(1);
        // ns.print(batch);
        if (source.ram.now > batch.batchRam && target.canAttack) {
          ns.exec(
            'xhack.js',
            source.hostname,
            batch.hackThreads,
            target.hostname,
            false,
            batch.hackDeploy
          );

          ns.exec(
            'xweak.js',
            source.hostname,
            batch.weakThreads,
            target.hostname,
            false,
            batch.weakDeploy
          );

          ns.exec(
            'xgrow.js',
            source.hostname,
            batch.growThreads,
            target.hostname,
            false,
            batch.growDeploy
          );

          ns.exec(
            'xweak.js',
            source.hostname,
            batch.weakThreadsAfterGrow,
            target.hostname,
            false,
            batch.weakDeployAfterGrow
          );

          if (recheck < target.batch().deployEnd) {
            recheck = target.batch().deployEnd;
          }
        }
        break;
      }
      default:
    }
  }
  while (true) {
    ns.print(sources);
    const now = performance.now();

    sources.forEach((s: any) => {
      flow(now, s);
    });

    ns.clearLog();
    ns.print(sources.length);
    ns.print(`[Now] ${now}`);
    ns.print(`[Recheck] ${recheck}`);
    ns.print(`[Update] ${timeFormat(ns, recheck - now)}`);
    await ns.sleep(3000);
  }
}
