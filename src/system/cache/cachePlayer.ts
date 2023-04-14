/* eslint-disable */
import { NS } from '@ns';
import { PlayerDB } from '/system/cache/DB';
import { Player } from '/system/player/Player';
/* eslint-enable */

export const main = async (ns: NS) => {
  const player = new Player(ns);
  await PlayerDB.update(ns, player);
};
