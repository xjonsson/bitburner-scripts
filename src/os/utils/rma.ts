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
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
