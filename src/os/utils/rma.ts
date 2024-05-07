/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

// ******** Main function
export async function main(ns: NS) {
  const { args } = ns;
  const s = args[0] as string;

  if (!s) {
    ns.tprint('Need to provide a server to clean');
    return;
  }

  // ******** Single run code
  ns.clearLog();
  ns.tail();

  ns.tprint(`[${s}] Cleaning...`);
  for (const file of ns.ls(s)) {
    if (
      !file.endsWith('.exe') &&
      !file.endsWith('.msg') &&
      !file.endsWith('.lit') &&
      !file.endsWith('.cct')
    ) {
      ns.tprint(`Deleting: ${file}`);
      ns.rm(file, s);
    }
  }
  await ns.asleep(1000);
}

export function autocomplete({ servers }: { servers: string[] }) {
  return servers;
}
