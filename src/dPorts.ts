/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
/* eslint-enable */

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('sleep');
  ns.tail();

  let count = 0;
  while (true) {
    ns.clearLog();

    ns.print(`Count: ${count}`);
    ns.print('======== CONTROL ========');
    const data: any = ns.peek(PORTS.HACKNET);
    ns.print(data);

    // ns.print('======== HACKNET ========');
    // const hn: any = ns.peek(PORTS.HACKNET);
    // ns.print(hn);

    count += 1;
    await ns.sleep(1000);
  }
}
