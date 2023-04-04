/* eslint-disable */
import { NS } from '@ns';
import { MINISAVE, BITNODE, CORE, PATHS } from './configs';
import { Bitnode } from '/system/bitnode/BitNode';
/* eslint-enable */

// import { CORE_RUNTIMES, TEMP_F } from 'lib/Variables';
// import { CACHE_SCRIPTS } from 'lib/Database';
// import { TermLogger } from 'lib/Logger';
// import { Scanner } from 'lib/Scan';
// import { partition_array } from 'structures/basics/partitions';

const launch = async (ns: NS, script: string, threads = 1, args = []) => {
  const pid = ns.exec(script, 'home', threads, ...args);
  await ns.asleep(100);
  while (ns.isRunning(pid)) {
    await ns.asleep(10);
  }
};

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const inputBNL = (ns.args[0] as string) || ''; // Check for Bitnode Input (1.1)
  const minisave = ns.fileExists(MINISAVE.FILE); // Check for savefile
  let active;
  const inputNodeLevel = {
    node: parseInt(inputBNL.toString().split('.')[0]),
    level: parseInt(inputBNL.toString().split('.')[1]),
    done: false,
  };

  ns.clearLog();

  // Quit if help is asked for
  if (flags.help) {
    ns.tprint('Provide the BitNode version and level as N.L');
    ns.tprint('You can find this under Character > Stats');
    ns.tprint('If you cannot see BitNode N (Level L) use 1.1');
    ns.tprint(`> run ${ns.getScriptName()} BITNODE.VERSION (eg 1.1)`);
    return;
  }

  // Check, Create, Read minisave file
  if (!minisave) {
    // No save file
    ns.tprint('[No Save] Checking for input');
    if (!inputNodeLevel.node || !inputNodeLevel.level) {
      // No save and no input, cant continue
      ns.tprint('[ERROR] Relaunch with current BitNode and Level');
      return;
    }
    // Theres input
    await ns.write(MINISAVE.FILE, JSON.stringify(inputNodeLevel), 'w');
    active = inputNodeLevel;
  } else {
    active = await JSON.parse(ns.read(MINISAVE.FILE));
  }

  // Check for BitNode file
  const bitnodeFilePath = `${PATHS.TMP}/BitNode_${active.node}_${active.level}.txt`;
  const bitnodeFile = ns.fileExists(bitnodeFilePath)
    ? // ns.tprint('Load bitnode file'); // FIXME: REMOVE
      await JSON.parse(ns.read(bitnodeFilePath))
    : false;
  if (!bitnodeFile) {
    ns.tprint('There is no bitnode file, creating it');
  } else {
    ns.tprint('Bitnode file exists, use it');
  }
  // If it doenst exist create a new one
  // If it exists read it

  ns.tprint(`Load the BitnodeFile ${bitnodeFile}`);

  // Cache the bitnode file
  ns.tprint('Cache bitnode data');

  // const currentNode = new Bitnode(ns, iNode.node, iNode.level);

  // await ns.write(currentNode.filename, JSON.stringify(currentNode), 'w');

  for (let portNum = 1; portNum <= 20; portNum += 1) {
    ns.clearPort(portNum);
  }

  // logger.info(`Detected BitNode ${current_bitnode}`);
  // ns.tprint(`[Bitnode] ${currentNode.node} Level ${currentNode.level}`);

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
  // await launch(ns, BITNODE.CACHE);

  // const homeMax = ns.getServerMaxRam('home');
  // const homeMaxMsg = `We have ${ns.formatRam(homeMax, 2)}`;
  // if (homeMax >= 32) {
  //   ns.tprint(`${homeMaxMsg} using full control`);
  //   ns.spawn(CORE.CONTROL); // FIXME:
  //   // ns.spawn('debug.js');
  // } else {
  //   ns.tprint(`${homeMaxMsg} using minimal`);
  //   ns.spawn(CORE.MINIMAL);
  // }
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
