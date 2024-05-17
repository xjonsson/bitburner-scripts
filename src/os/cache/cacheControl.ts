/* eslint-disable */
import { NS } from '@ns';
import { ControlInfo } from '/os/modules/Control';
import { ControlCache } from '/os/modules/Cache';
/* eslint-enable */

export const main = async (ns: NS) => {
  const past = ControlCache.read(ns, 'control');
  const control = ControlInfo.details(ns, past);
  await ControlCache.update(ns, control);
};
