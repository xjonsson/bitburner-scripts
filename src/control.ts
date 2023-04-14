/* eslint-disable */
import { NS } from '@ns';
import { BitnodeDB } from './system/cache/DB';
import { BITNODE } from '/configs';
import Player from '/old/zPlayer';
import { CONFIGS, DEPLOY } from '/configs';
import Network from '/old/zNetwork';
import Server from '/old/server';
import { timeFormat } from '/old/zUtils';
/* eslint-enable */

// import { TermLogger } from 'lib/Logger';
// import { ServerInfo } from 'modules/servers/Servers';
// import { CORE_RUNTIMES, SYS_SCRIPTS } from 'lib/Variables';
// import { CACHE_SCRIPTS } from 'lib/Database';
// import { ReservedRam } from 'lib/Swap';
// import { DaemonStrategy } from 'modules/Daemon';
// import { BitNodeCache } from 'modules/bitnodes/BitnodeCache';

const init = async (ns: NS) => {
  const bitnode = BitnodeDB.read(ns, 'bitnode');
  ns.print(`[Bitnode] ${bitnode.node}:${bitnode.level} (${bitnode.done})`);
  // const BitNode = JSON.parse(ns.read(BITNODE.TMP));
  // ns.print(`[BitNode] ${BitNode.node}:${BitNode.level}`);
  // ns.print('BitNode: ', BitNodeCache.read(ns, 'current').number);
  // const servers = ServerInfo.all(ns);
  // servers
  //   .filter((s) => s.id !== 'home')
  //   .forEach((s) => s.pids.forEach((p) => ns.kill(p.pid)));
  // servers
  //   .filter((s) => s.id === 'home')
  //   .forEach((s) =>
  //     s.pids
  //       .filter(
  //         (p) =>
  //           p.filename !== CORE_RUNTIMES.KEEPALIVE &&
  //           p.filename !== CORE_RUNTIMES.PHOENIX
  //       )
  //       .forEach((p) => ns.kill(p.pid))
  //   );
  // ReservedRam.launch_max_reserve_shares(ns);
};

const launch = async (ns: NS, script: string, threads = 1, args = []) => {
  const pid = ns.exec(script, 'home', threads, ...args);
  await ns.asleep(100);
  while (ns.isRunning(pid)) {
    await ns.asleep(10);
  }
};

// const updateBitNode = async (ns: NS) => {
//   while (true) {
//     // await launch_and_wait(ns, CACHE_SCRIPTS.PLAYERS);
//     ns.print('[Bitnode] Loop');
//     await launch(ns, BITNODE.CACHE);
//     await ns.asleep(1000);
//   }
// };

// const updatePlayer = async (ns: NS) => {
//   while (true) {
//     // await launch_and_wait(ns, CACHE_SCRIPTS.PLAYERS);
//     ns.print('[Player] Loop');
//     await ns.asleep(1000);
//   }
// };

export const main = async (ns: NS) => {
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();

  // const logger = new TermLogger(ns);
  const timeStart = performance.now();
  await init(ns);
  // await DaemonStrategy.init(ns);
  ns.print(
    `Initialization completed in ${ns.formatNumber(
      performance.now() - timeStart,
      2
    )} milliseconds`
  );
  // updatePlayer(ns).catch(console.error);
  // updateBitNode(ns).catch(console.error);
  // update_players(ns).catch(console.error);
  // update_servers(ns).catch(console.error);
  // update_augmentations(ns).catch(console.error);
  // update_factions(ns).catch(console.error);
  // update_corporations(ns).catch(console.error);
  // update_crimes(ns).catch(console.error);
  // update_sleeves(ns).catch(console.error);
  // update_leetcode(ns).catch(console.error);
  // DaemonStrategy.loop(ns).catch(console.error);
  while (true) {
    // await heartbeat(ns);
    // ns.print('[Control] Loop');
    await ns.asleep(1000);
  }
};

// const launch_and_wait = async (ns, script, threads = 1, args = []) => {
//   const pid = ns.exec(script, 'home', threads, ...args);
//   await ns.asleep(100);
//   while (ns.isRunning(pid)) {
//     await ns.asleep(10);
//   }
// };

// const update_players = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.PLAYERS);
//     await ns.asleep(1000);
//   }
// };

// const update_servers = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.SERVERS);
//     await ns.asleep(500);
//   }
// };

// const update_augmentations = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.AUGMENTATIONS);
//     await ns.asleep(80000);
//   }
// };

// const update_factions = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.FACTIONS);
//     await ns.asleep(30000);
//   }
// };

// const update_corporations = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.CORPORATIONS);
//     await ns.asleep(20000);
//   }
// };

// const update_crimes = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.CRIMES);
//     await ns.asleep(2000);
//   }
// };

// const update_sleeves = async (ns) => {
//   while (true) {
//     await launch_and_wait(ns, CACHE_SCRIPTS.SLEEVES);
//     await ns.asleep(2000);
//   }
// };

// const update_leetcode = async (ns) => {
//   while (true) {
//     ns.exec(SYS_SCRIPTS.LEETCODE, 'home');
//     await ns.asleep(80000);
//   }
// };
