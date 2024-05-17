/* eslint-disable */
import { NS } from '@ns';
import { CORE, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
import { ServerInfo } from '/os/modules/Server';
import deployScripts from '/os/utils/deploy';
import { getBNMults } from '/os/modules/BitNodes';
import { Banner, BG, Text } from '/os/utils/colors';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.disableLog('scan');
  ns.disableLog('scp');
  ns.clearLog();
  // ns.tail();

  ns.tprint(Banner.class('Launcher', 'Starting...'));

  // TODO: Kill all processes

  // ******** Prep non purchased servers
  ns.tprint(BG.insert(' Preparing servers '));
  ServerInfo.list(ns)
    .filter((h: string) => h !== 'home')
    .forEach((h: string) => {
      const r = deployScripts(ns, h) ? Text.normal('OK') : Text.error('Error');
      ns.tprint(Text.info(`:: Deploying on ${h} ${r}`));
    });

  // ******** Clear ports for clean run
  ns.tprint(BG.insert(' Clearing ports '));
  for (let i = 1; i <= 20; i += 1) {
    ns.clearPort(i);
  }

  // ******** Prep bitnode data
  const bitnode = ns.getResetInfo().currentNode;
  const bnLevel = Number(
    await ns.prompt(`You are on BitNode ${bitnode}, what level?`, {
      type: 'text',
    }),
  );
  if (bnLevel < 1 || Number.isNaN(bnLevel)) {
    ns.tprint(Banner.error('Bitnode', 'Not a valid number'));
    ns.exit();
  }
  ns.tprint(Banner.info('Bitnode', `Bitnode ${bitnode} (Level ${bnLevel})`));
  const bnMults = getBNMults(bitnode, bnLevel);
  const bn = { bitnode, bnLevel, bnMults: { ...bnMults } };
  ns.write(CORE.BN, JSON.stringify(bn), 'w');

  // Prepare the cache before running
  ns.tprint(BG.insert(' Starting Cache '));
  for (const cache of [CACHE.CONTROL, CACHE.PLAYER]) {
    ns.tprint(Text.info(`:: Starting ${cache}`));
    await launch(ns, cache);
  }

  const hRam = ns.getServerMaxRam('home');
  ns.tprint(BG.insert(' Starting OS '));
  if (hRam >= 32) {
    ns.tprint(Text.info(`:: Running full ${ns.formatRam(hRam, 2)} Ram`));
    ns.closeTail();
    ns.spawn(CORE.TWITCH);
  }
  // else {
  //   ns.print('We would run minimal');
  //   ns.spawn(CORE.MINIMAL); // FIXME: Doesnt exist
  // }
}
