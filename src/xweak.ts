/* eslint-disable-next-line */
import { NS } from '@ns';

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const repeat = ns.args[1] as boolean;
  const deploy = ns.args[2] as number;
  const silent = (ns.args[3] as boolean) || true;

  if (!silent) {
    ns.tail();
  }

  do {
    if (deploy) {
      const currentTime = performance.now();
      await ns.sleep(deploy - currentTime);
    }
    await ns.weaken(target);
  } while (repeat);
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
