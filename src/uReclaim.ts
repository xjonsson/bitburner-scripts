/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export function reclaimBot(ns: NS, node: any) {
  if (!node.challenge) {
    node.challenge = node.numOpenPortsRequired;
  }
  ns.print(`[Reclaiming] [${node.challenge}] ${node.hostname}`);
  if (node.challenge >= 5) {
    ns.sqlinject(node.hostname);
  }
  if (node.challenge >= 4) {
    ns.httpworm(node.hostname);
  }
  if (node.challenge >= 3) {
    ns.relaysmtp(node.hostname);
  }
  if (node.challenge >= 2) {
    ns.ftpcrack(node.hostname);
  }
  if (node.challenge >= 1) {
    ns.brutessh(node.hostname);
  }
  if (node.challenge >= 0) {
    ns.nuke(node.hostname);
  }
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const target = ns.args[0] as string;
  const node = ns.getServer(target);

  if (!target || flags.help) {
    ns.tprint('Single server nuker');
    ns.tprint(`Usage: run ${ns.getScriptName()} SERVER_NAME`);
    return;
  }

  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');

  ns.print(`[Running] ${target}`);
  reclaimBot(ns, node);

  await ns.sleep(1000);

  if (node.hasAdminRights) {
    ns.print(`[Root] ${node.hostname} SUCCESS`);
    ns.tprint(`[Root] ${node.hostname} SUCCESS`);
  } else {
    ns.print(`[ERROR] Failed root on ${node.hostname}`);
    ns.tprint(`[ERROR] Failed root on ${node.hostname}`);
  }
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
