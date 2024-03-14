/* eslint-disable */
import { NS } from '@ns';
import { ControlInfo } from '/os/modules/Control';
import { ControlCache } from '/os/modules/Cache';
/* eslint-enable */

export const main = async (ns: NS) => {
  // const player = PlayerInfo.details(ns);
  // await PlayerCache.update(ns, player);
  // ns.tprint('This is the controller');
  const past = ControlCache.read(ns, 'control');
  const control = ControlInfo.details(ns, past);
  await ControlCache.update(ns, control);
};
