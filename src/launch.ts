/* eslint-disable */
import { NS } from '@ns';
import { CORE, MINISAVE, CACHE, PATHS } from './configs';
import { Bitnode } from '/system/bitnode/Bitnode';
/* eslint-enable */

// import { CORE_RUNTIMES, TEMP_F } from 'lib/Variables';
// import { CACHE_SCRIPTS } from 'lib/Database';
// import { TermLogger } from 'lib/Logger';
// import { Scanner } from 'lib/Scan';
// import { partition_array } from 'structures/basics/partitions';

const launch = async (ns: NS, script: string, threads = 1, args: any = []) => {
  const pid = ns.exec(script, 'home', threads, ...args);
  await ns.asleep(100);
  while (ns.isRunning(pid)) {
    await ns.asleep(10);
  }
};

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const input = (ns.args[0] as string) || ''; // Check for Bitnode Input (1.1)
  let minisave = ns.fileExists(MINISAVE.FILE)
    ? await JSON.parse(ns.read(MINISAVE.FILE))
    : false;
  const inputBitNodeLevel = {
    node: parseInt(input.toString().split('.')[0]),
    level: parseInt(input.toString().split('.')[1]),
    done: ns.args[1] || false,
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

  // Prefer input, but use saved minifile if it exists
  if (!inputBitNodeLevel.node || !inputBitNodeLevel.level) {
    ns.tprint('[No Input] Checking for save');
    if (!minisave) {
      // No save and no input, cant continue
      ns.tprint('[ERROR] Relaunch with current BitNode and Level');
      return;
    }
  } else {
    minisave = inputBitNodeLevel;
    await ns.write(MINISAVE.FILE, JSON.stringify(minisave), 'w');
  }

  // Check for BitNode file
  const bitnodeFilePath = `${PATHS.TMP}/BitNode_${minisave.node}_${minisave.level}.txt`;
  const saved = ns.fileExists(bitnodeFilePath)
    ? await JSON.parse(ns.read(bitnodeFilePath))
    : false;

  // If there is no input use the saved file
  const bitnode =
    saved && !ns.args[0]
      ? new Bitnode(ns, saved.node, saved.level, saved.done)
      : new Bitnode(ns, minisave.node, minisave.level, minisave.done);

  await ns.write(bitnode.filename, JSON.stringify(bitnode), 'w');

  for (let portNum = 1; portNum <= 20; portNum += 1) {
    ns.clearPort(portNum);
  }

  // Start the cache
  await launch(ns, CACHE.BITNODE, 1, [bitnode.filename]);
  // CACHE_SCRIPTS.AUGMENTATIONS,
  //   CACHE_SCRIPTS.FACTIONS,
  await launch(ns, CACHE.PLAYER);
  //   CACHE_SCRIPTS.SERVERS,
  //   CACHE_SCRIPTS.CORPORATIONS,
  //   CACHE_SCRIPTS.CRIMES,
  //   CACHE_SCRIPTS.SLEEVES;

  const homeMax = ns.getServerMaxRam('home');
  const homeMaxMsg = `We have ${ns.formatRam(homeMax, 2)}`;
  if (homeMax >= 32) {
    ns.tprint(`${homeMaxMsg} using full control`);
    ns.spawn(CORE.CONTROL); // FIXME:
    // ns.spawn('debug.js');
  } else {
    ns.tprint(`${homeMaxMsg} using minimal`);
    ns.spawn(CORE.MINIMAL);
  }
}
