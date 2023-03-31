/* eslint-disable */
import { NS } from '@ns';
import { PlayerInfo } from './Player';
import { PlayerCache } from './PlayerCache';
import { PORTS } from '/configs';
/* eslint-enable */

export const main = async (ns: NS) => {
  ns.tail();
  ns.clearLog();
  // const player = PlayerInfo.detail(ns);
  // ns.print(player);
  // await PlayerCache.update(ns, player);
  // PORTS[(PORTS.players = 8)] = 'players';
  // const p = ns.peek(8);
  // ns.print(p);
  // const test = PlayerCache.read(ns, 'player');
  ns.print(PORTS);
  ns.print(PORTS.PLAYER);
  ns.print(PORTS.LIST.length);
  console.log(PORTS);
};
