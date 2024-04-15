/* eslint-disable */
import { NS } from '@ns';
import { TIME, CORE, MODULES, CACHE } from '/os/configs';
import { launch } from '/os/utils/launch';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Styling
const rowStyle1Col = '%-20s';
const rowStyle2Col = '%-9s %-9s ';
const rowStyle3Col = '%-6s %-6s %-6s';
const rowStyle4Col = '%-4s %-4s %-4s %-4s';

const updateControl = async (ns: NS) => {
  ns.tprint(`[Module] Control starting...`);
  while (true) {
    await launch(ns, CACHE.CONTROL);
    await ns.asleep(TIME.CONTROL);
  }
};

const updatePlayer = async (ns: NS) => {
  ns.tprint(`[Module] Player starting...`);
  while (true) {
    await launch(ns, CACHE.PLAYER);
    await ns.asleep(TIME.PLAYER);
  }
};

const updateHacknet = async (ns: NS) => {
  ns.tprint(`[Module] Hacknet starting...`);
  if (!ns.isRunning(CORE.HACKNET, 'home')) {
    await launch(ns, CORE.HACKNET);
    await ns.asleep(TIME.HACKNET);
  }
};

const updateHosting = async (ns: NS) => {
  ns.tprint(`[Module] Hosting starting...`);
  if (!ns.isRunning(CORE.HOSTING, 'home')) {
    await launch(ns, CORE.HOSTING);
    await ns.asleep(TIME.HOSTING);
  }
};

const updateContracts = async (ns: NS) => {
  ns.tprint(`[Module] Contracts starting...`);
  if (!ns.isRunning(CORE.CONTRACTS, 'home')) {
    await launch(ns, CORE.CONTRACTS);
  }
};

const updatePuppeteer = async (ns: NS) => {
  ns.tprint(`[Module] Puppeteer starting...`);
  if (!ns.isRunning(CORE.PUPPETEER, 'home')) {
    await launch(ns, CORE.PUPPETEER);
  }
};

const updateCorporations = async (ns: NS) => {
  ns.tprint(`[Module] Corporations starting...`);
  if (!ns.isRunning(CORE.CORPORATIONS, 'home')) {
    await launch(ns, CORE.CORPORATIONS);
  }
};

export async function main(ns: NS) {
  const xWidth = 200;
  const xHeight = 190;
  const window = ns.ui.windowSize();
  const wWidth = window[0];
  const wHeight = window[1];
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.clearLog();
  ns.tail();
  ns.setTitle('OS Control');
  ns.resizeTail(xWidth, xHeight);
  ns.moveTail(wWidth - xWidth, wHeight - xHeight - 52);

  // ******** Initialize

  // Critical modules
  updateControl(ns).catch(console.error);
  updatePlayer(ns).catch(console.error);
  // Optional modules
  if (MODULES.HACKNET) updateHacknet(ns).catch(console.error); // TODO: Improve timings
  if (MODULES.HOSTING) updateHosting(ns).catch(console.error); // TODO: Improve performance
  if (MODULES.CONTRACTS) updateContracts(ns).catch(console.error); // TODO: Complete solutions
  if (MODULES.PUPPETEER) updatePuppeteer(ns).catch(console.error); // TODO: Complete solutions
  if (MODULES.CORPORATIONS) updateCorporations(ns).catch(console.error); // TODO: Complete solutions

  // Keep the game loop going
  while (true) {
    const control = ControlCache.read(ns, 'control');
    const player = PlayerCache.read(ns, 'player');
    const { ticks } = control;
    const { level, money, challenge } = player;
    const { stage, phase, hackTargets, isShopHacknet, isShopHosting } = control;
    // const time = performance.now();
    // const { level } = player;

    ns.clearLog();

    // Display basic information
    ns.printf(
      rowStyle3Col,
      `🖲️${ticks}`,
      `🧠${level}`,
      `💰${ns.formatNumber(money, 1)}`
    );

    // Display progression
    ns.printf(
      rowStyle3Col,
      `🔑${challenge}`,
      `🎯${hackTargets.length}`,
      `💎${stage}`
    );
    ns.printf(rowStyle1Col, `${phase.done ? '✅' : '❌'} ${phase.msg}`);

    // Display modules
    ns.printf(
      rowStyle4Col,
      MODULES.HACKNET ? `👾🟢${isShopHacknet ? '✅' : '❌'}` : `👾🔴`,
      MODULES.HOSTING ? `🖥️🟢${isShopHosting ? '✅' : '❌'}` : `🖥️🔴`,
      MODULES.CONTRACTS ? `📝🟢` : `📝🔴`,
      MODULES.PUPPETEER ? `🤖🟢` : `🤖🔴`
    );

    // Display Corporations & gangs
    ns.printf(
      rowStyle2Col,
      MODULES.CORPORATIONS ? `🏢🐮0 🚬0` : `🏢🔴`,
      MODULES.GANGS ? '🔫🟢' : '🔫🔴'
    );
    // ns.print('====================');
    // ns.tprint(ns.ui.getGameInfo());
    // ns.print(control); // NOTE: Debug
    await ns.asleep(1000);
  }
}
