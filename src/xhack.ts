/* eslint-disable-next-line */
import { NS } from '@ns';

const runtimeMultiplier = 1.0;

export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const repeat = ns.args[1] as boolean;
  const delay = ns.args[2] as number;
  const silent = (ns.args[3] as boolean) || true;
  const runtime = runtimeMultiplier * ns.getHackTime(target);

  if (!silent) {
    ns.tail();
  }

  do {
    if (delay) {
      const currentTime = performance.now();
      await ns.sleep(delay - currentTime - runtime);
    }
    await ns.hack(target);
  } while (repeat);
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
