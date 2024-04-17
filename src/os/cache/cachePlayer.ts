/* eslint-disable */
import { NS } from '@ns';
import { PlayerInfo } from '/os/modules/Player';
import { PlayerCache } from '/os/modules/Cache';
/* eslint-enable */

export const main = async (ns: NS) => {
  const player = PlayerInfo.details(ns);
  await PlayerCache.update(ns, player);
};
