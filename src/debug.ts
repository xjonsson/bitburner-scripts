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
  const homeFocus = ns.args[0] as string;
  const p = new Player(ns);
  const focus = new Server(ns, p, homeFocus);
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('scan');
  ns.disableLog('sleep');

  // const target = new Server(ns, p, 'n00dles');
  const machine = new Server(ns, p, 'home');
  // const sources = ns
  //   .getPurchasedServers()
  //   .map((s: string) => new Server(ns, p, s));
  // sources.forEach((s: any) => {
  //   ns.scp([xMin, xHack, xWeak, xGrow, xShare], s.hostname, 'home');
  // });
  // sources.push(new Server(ns, p, 'home'));
  let recheck = performance.now();
  let tHack = recheck;
  let tWeak = recheck;
  let tGrow = recheck;
  let tWeakAfterGrow = recheck;
  let tHackN = 0;
  let tWeakN = 0;
  let tGrowN = 0;
  let tWeakAfterGrowN = 0;
  ns.print(recheck);

  function flow(now: number, source: any, target: Server, partial = false) {
    if (!partial) {
      const batch = target.batch(source.cores, partial);
      // ns.print(batch);
      if (source.ram.now > batch.batchRam && now >= recheck) {
        if (batch.weakThreads > 0) {
          ns.exec(
            'xweak.js',
            source.hostname,
            batch.weakThreads,
            target.hostname,
            false,
            batch.weakDeploy
          );
          tWeak = batch.weakDeploy;
          tWeakN = batch.weakThreads;
        }

        if (batch.growThreads > 0) {
          ns.exec(
            'xgrow.js',
            source.hostname,
            batch.growThreads,
            target.hostname,
            false,
            batch.growDeploy
          );
          tGrow = batch.growDeploy;
          tGrowN = batch.growThreads;
        }

        if (batch.weakThreadsAfterGrow > 0) {
          ns.exec(
            'xweak.js',
            source.hostname,
            batch.weakThreadsAfterGrow,
            target.hostname,
            false,
            batch.weakDeployAfterGrow
          );
          tWeakAfterGrow = batch.weakDeployAfterGrow;
          tWeakAfterGrowN = batch.weakThreads;
        }

        if (recheck < batch.deployEnd) {
          recheck = batch.deployEnd;
        }
      }
    } else {
      switch (target.action) {
        case 'Weak': {
          if (now >= recheck && target.weakThreads > 0) {
            ns.exec(
              'xweak.js',
              source.hostname,
              target.weakThreads,
              target.hostname
            );
            if (recheck < now + target.weakTime) {
              recheck = now + target.weakTime;
              tWeak = recheck;
            }
          }
          break;
        }
        case 'Grow': {
          if (now >= recheck && target.growThreads(source.cores) > 0) {
            ns.exec(
              'xweak.js',
              source.hostname,
              target.growThreads(source.cores),
              target.hostname
            );
            if (recheck < now + target.growTime) {
              recheck = now + target.growTime;
              tGrow = recheck;
            }
          }
          break;
        }
        case 'Hack': {
          const batch = target.batch(source.cores);
          // ns.print(batch);
          if (source.ram.now > batch.batchRam && target.canAttack) {
            if (batch.hackThreads > 0) {
              ns.exec(
                'xhack.js',
                source.hostname,
                batch.hackThreads,
                target.hostname,
                false,
                batch.hackDeploy
              );
              tHackN = batch.hackThreads;
            }

            if (batch.weakThreads > 0) {
              ns.exec(
                'xweak.js',
                source.hostname,
                batch.weakThreads,
                target.hostname,
                false,
                batch.weakDeploy
              );
              tWeakN = batch.weakThreads;
            }

            if (batch.growThreads > 0) {
              ns.exec(
                'xgrow.js',
                source.hostname,
                batch.growThreads,
                target.hostname,
                false,
                batch.growDeploy
              );
              tGrowN = batch.growThreads;
            }

            if (batch.weakThreadsAfterGrow > 0) {
              ns.exec(
                'xweak.js',
                source.hostname,
                batch.weakThreadsAfterGrow,
                target.hostname,
                false,
                batch.weakDeployAfterGrow
              );
              tWeakAfterGrowN = batch.weakThreadsAfterGrow;
            }

            if (recheck < batch.deployEnd) {
              recheck = batch.deployEnd;
              tHack = batch.hackDeploy;
              tWeak = batch.weakDeploy;
              tGrow = batch.growDeploy;
              tWeakAfterGrow = batch.weakDeployAfterGrow;
            }
          }
          break;
        }
        default:
      }
    }
  }

  while (true) {
    // ns.print(sources);
    const now = performance.now();

    // sources.forEach((s: any) => {
    //   flow(now, s);
    // });
    flow(now, machine, focus, false);

    ns.clearLog();
    ns.print(focus.hostname);
    ns.print(`[Now] ${now}`);
    ns.print(`[Recheck] ${recheck}`);
    ns.print(`[Update] ${timeFormat(ns, recheck - now)}`);
    ns.print(`[Hack] ${timeFormat(ns, tHack - now)} [t=${tHackN}]`);
    ns.print(`[Weak] ${timeFormat(ns, tWeak - now)} [t=${tWeakN}]`);
    ns.print(`[Grow] ${timeFormat(ns, tGrow - now)} [t=${tGrowN}]`);
    ns.print(
      `[Weak] ${timeFormat(ns, tWeakAfterGrow - now)} [t=${tWeakAfterGrowN}]`
    );
    await ns.sleep(3000);
  }

  // const servers = ns.getPurchasedServers().length;

  // for (let i = 1; i <= 20; i += 1) {
  //   const ram = 2 ** i;
  //   const cost = ns.getPurchasedServerCost(ram);

  //   ns.print(
  //     `[Level ${i}] ${ns.formatRam(ram)} ${ns.formatNumber(
  //       cost,
  //       2
  //     )} x${servers} [${ns.formatNumber(cost * servers, 2)}]  Raw $(${cost})`
  //   );
  // }

  // while (true) {
  //   await ns.sleep(3000);
  // }
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
