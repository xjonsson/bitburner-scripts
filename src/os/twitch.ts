/* eslint-disable */
import { NS } from '@ns';
import { TIME, CORE, MODULES, CACHE, LAYOUT } from '/os/configs';
import { launch } from '/os/utils/launch';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { Control } from '/os/modules/Control';
import { formatTime } from '/os/utils/formatTime';
import { Banner, BG, Text } from '/os/utils/colors';
/* eslint-enable */

// ******** Utility function for logging, replace later // TODO:
function pError(ns: NS, section: string, error: any) {
  ns.tprint(Banner.error(section, error as string));
}

// ******** Styling
const rowStyle1Col = '%-20s';
const rowStyle2Col = '%-9s %-9s ';
const rowStyle3Col = '%-6s %-6s %-6s';
const rowStyle4Col = '%-4s %-4s %-4s %-4s';

const updateControl = async (ns: NS) => {
  ns.tprint(Banner.insert('Control', 'Starting...'));
  while (true) {
    await launch(ns, CACHE.CONTROL);
    await ns.asleep(TIME.CONTROL);
  }
};

const updatePlayer = async (ns: NS) => {
  ns.tprint(Banner.insert('Player', 'Starting...'));
  while (true) {
    await launch(ns, CACHE.PLAYER);
    await ns.asleep(TIME.PLAYER);
  }
};

const updateHacknet = async (ns: NS) => {
  ns.tprint(Banner.insert('Hacknet', 'Starting...'));
  if (!ns.isRunning(CORE.HACKNET, 'home')) {
    await launch(ns, CORE.HACKNET);
    await ns.asleep(TIME.HACKNET);
  }
};

const updateHosting = async (ns: NS) => {
  ns.tprint(Banner.insert('Hosting', 'Starting...'));
  if (!ns.isRunning(CORE.HOSTING, 'home')) {
    await launch(ns, CORE.HOSTING);
    await ns.asleep(TIME.HOSTING);
  }
};

const updateContracts = async (ns: NS) => {
  ns.tprint(Banner.insert('Contracts', 'Starting...'));
  if (!ns.isRunning(CORE.CONTRACTS, 'home')) {
    await launch(ns, CORE.CONTRACTS);
  }
};

const updatePuppeteer = async (ns: NS) => {
  ns.tprint(Banner.insert('Puppeteer', 'Starting...'));
  if (!ns.isRunning(CORE.PUPPETEER, 'home')) {
    await launch(ns, CORE.PUPPETEER);
  }
};

const updateCorporations = async (ns: NS) => {
  ns.tprint(Banner.insert('Corporations', 'Starting...'));
  if (!ns.isRunning(CORE.CORPORATIONS, 'home')) {
    await launch(ns, CORE.CORPORATIONS);
  }
};

export async function main(ns: NS) {
  const { bufferY } = LAYOUT;
  const { xW, xH } = LAYOUT.OS;
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();
  ns.setTitle('OS');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW, wHeight - xH - bufferY);
  ns.tprint(Banner.class('OS', 'Starting...'));

  // ******** Initialize
  const { HACKNET, HOSTING, CONTRACTS, PUPPETEER, CORPORATIONS, GANGS } =
    MODULES;

  // Critical modules
  updateControl(ns).catch((e) => pError(ns, 'Control', e));
  updatePlayer(ns).catch((e) => pError(ns, 'Player', e));
  // Optional modules
  if (HACKNET) updateHacknet(ns).catch((e) => pError(ns, 'Hacknet', e)); // TODO: Improve timings
  if (HOSTING) updateHosting(ns).catch((e) => pError(ns, 'Hosting', e)); // TODO: Improve performance
  if (CONTRACTS) updateContracts(ns).catch((e) => pError(ns, 'Contracts', e)); // TODO: Complete solutions
  if (PUPPETEER) updatePuppeteer(ns).catch((e) => pError(ns, 'Puppeteer', e)); // TODO: Complete solutions
  if (CORPORATIONS)
    updateCorporations(ns).catch((e) => pError(ns, 'Corporations', e)); // TODO: Complete solutions

  // Keep the game loop going
  while (true) {
    const control = ControlCache.read(ns, 'control');
    const player = PlayerCache.read(ns, 'player');
    const { ticks } = control;
    const { level, money, challenge } = player;
    const { stage, phase, hackTargets, isShopHN, isShopH } = control;
    // const time = performance.now();
    // const { level } = player;

    ns.clearLog();

    // Hacknet
    const mHN = isShopHN ? BG.info(' 👾 ') : BG.warning(' 👾 ');
    const mH = isShopH ? BG.info(' 🖥️ ') : BG.warning(' 🖥️ ');

    // Display modules
    ns.printf(
      rowStyle1Col,
      `${HACKNET ? mHN : BG.error(' 👾 ')}` +
        `${HOSTING ? mH : BG.error(' 🖥️ ')}` +
        `${CONTRACTS ? BG.normal(' 📝 ') : BG.error(' 📝 ')}` +
        `${PUPPETEER ? BG.normal(' 🤖 ') : BG.error(' 🤖 ')}` +
        `${CORPORATIONS ? BG.normal(' 🏢 ') : BG.error(' 🏢 ')}` +
        `${GANGS ? BG.normal(' 🔫 ') : BG.error(' 🔫 ')}`,
    );

    // Display basic information
    ns.printf(
      rowStyle3Col,
      `🖲️${Text.arg(ticks.toString())}`,
      `🧠${Text.arg(level.toString())}`,
      `💰${Text.arg(ns.formatNumber(money, 1))}`,
    );

    // Display progression
    ns.printf(
      rowStyle3Col,
      `🔑 ${Text.arg(challenge.toString())}`,
      `🎯 ${Text.arg(hackTargets?.length.toString() || 'X')}`,
      `💎 ${Text.arg(stage.toString())}`,
    );
    ns.printf(
      rowStyle1Col,
      `${phase.done ? '✅' : '❌'} ${Text.info(phase.msg)}`,
    );

    // ns.print('====================');
    // ns.tprint(ns.ui.getGameInfo());
    // ns.print(control); // NOTE: Debug
    await ns.asleep(1000);
  }
}
