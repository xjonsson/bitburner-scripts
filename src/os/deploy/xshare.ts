/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export async function main(ns: NS) {
  const repeat = ns.args[0] || false;
  const silent = (ns.args[1] as boolean) || true;

  if (!silent) {
    ns.tail();
  }

  do {
    await ns.share();
  } while (repeat);
}
