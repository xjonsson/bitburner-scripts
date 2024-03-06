/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export async function main(ns: NS) {
  const target = ns.args[0] || 'n00dles';
  const moneyThresh = ns.getServerMaxMoney(target as string) * 0.75;
  const secThresh = ns.getServerMinSecurityLevel(target as string) + 5;

  while (true) {
    const sec = ns.getServerSecurityLevel(target as string);
    const moneyAvailable = ns.getServerMoneyAvailable(target as string);
    if (sec > secThresh) {
      await ns.weaken(target as string);
    } else if (moneyAvailable < moneyThresh) {
      await ns.grow(target as string);
    } else {
      await ns.hack(target as string);
    }
  }
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
