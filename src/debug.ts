/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.print(ns.getPlayer());
}
