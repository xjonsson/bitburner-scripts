/* eslint-disable */
import { NS } from '@ns';
import { BITNODE, CORE } from './configs';
/* eslint-enable */

// import { CORE_RUNTIMES, TEMP_F } from 'lib/Variables';
// import { CACHE_SCRIPTS } from 'lib/Database';
// import { TermLogger } from 'lib/Logger';
// import { Scanner } from 'lib/Scan';
// import { partition_array } from 'structures/basics/partitions';

// async function launch(ns: NS, script: string, threads = 1, args = []) {
//   const pid = ns.run(script, threads, ...args);
//   await ns.sleep(10);
//   while (ns.isRunning(pid)) {
//     ns.tprint(`Waiting on ${pid}`);
//     await ns.sleep(10);
//   }
// }
// max 32gb
export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const { args } = ns;
  const iBitNode = (ns.args[0] as string) || '';
  const previous = ns.fileExists(BITNODE.CURRENT);
  let currentNode = {
    node: parseInt(iBitNode.toString().split('.')[0]),
    level: parseInt(iBitNode.toString().split('.')[1]),
  };

  ns.clearLog();

  if (flags.help) {
    ns.tprint('Provide the BitNode version and level as N.L');
    ns.tprint('You can find this under Character > Stats');
    ns.tprint('If you cannot see BitNode N (Level L) use 1.1');
    ns.tprint(`> run ${ns.getScriptName()} BITNODE.VERSION (eg 1.1)`);
    return;
  }

  // const logger = new TermLogger(ns);

  // const s = partition_array(Scanner.list(ns), function (a) {
  //   return a !== 'home';
  // });

  // s.truthy.forEach((serv) => ns.killall(serv));
  // s.falsy.forEach((serv) =>
  //   ns
  //     .ps(serv)
  //     .filter((proc) => proc.filename != CORE_RUNTIMES.LAUNCHER)
  //     .forEach((proc) => ns.kill(proc.pid))
  // );

  // ns.print(`[Bitnode] ${iBitNode}`);
  // ns.print(currentNode);
  // ns.print(savedNode);
  if (!currentNode.node) {
    if (previous) {
      const savedNode = JSON.parse(ns.read(BITNODE.CURRENT));
      if (!savedNode.node) {
        ns.tprint('[ERROR] Bad BitNode File Relaunch with BitNode and Level');
        return;
      }
      currentNode = savedNode;
    } else if (!previous) {
      ns.tprint('[ERROR] Relaunch with current BitNode and Level');
      return;
    }
  }

  await ns.write(BITNODE.CURRENT, JSON.stringify(currentNode), 'w');

  for (let portNum = 1; portNum <= 20; portNum += 1) {
    ns.clearPort(portNum);
  }

  // logger.info(`Detected BitNode ${current_bitnode}`);
  ns.tprint(`[Bitnode] ${currentNode.node} Level ${currentNode.level}`);

  // for (const script of [
  //   CACHE_SCRIPTS.BITNODES,
  //   CACHE_SCRIPTS.AUGMENTATIONS,
  //   CACHE_SCRIPTS.FACTIONS,
  //   CACHE_SCRIPTS.PLAYERS,
  //   CACHE_SCRIPTS.SERVERS,
  //   CACHE_SCRIPTS.CORPORATIONS,
  //   CACHE_SCRIPTS.CRIMES,
  //   CACHE_SCRIPTS.SLEEVES,
  // ]) {
  //   await launch_and_wait(ns, script);
  // }

  // MOTD.banner(ns);

  // if (ns.getServerMaxRam('home') >= 32) {
  //   ns.spawn(CORE_RUNTIMES.PHOENIX);
  // } else {
  //   ns.spawn(CORE_RUNTIMES.TUCSON);
  // }
  const homeMax = ns.getServerMaxRam('home');
  const homeMaxMsg = `We have ${ns.formatRam(homeMax, 2)}`;
  if (homeMax >= 32) {
    ns.tprint(`${homeMaxMsg} using full control`);
    // ns.spawn(CORE.CONTROL); // FIXME:
    ns.spawn('debug.js');
  } else {
    ns.tprint(`${homeMaxMsg} using minimal`);
    ns.spawn(CORE.MINIMAL);
  }
}
