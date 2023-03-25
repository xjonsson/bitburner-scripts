/* eslint-disable */
import { NS } from '@ns';
import Player from './zPlayer';
import { configs } from './configs';
import Network from './zNetwork';
import Server from './server';
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
  const source = new Server(ns, p, 'ps-0');
  ns.scp([xMin, xHack, xWeak, xGrow, xShare], source.hostname, 'home');
  ns.print(performance.now());
  while (true) {
    const batch = target.batch(ns.getServer('home').cpuCores);
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
    }
    await ns.sleep(3000);
  }
}
