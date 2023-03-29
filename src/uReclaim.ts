/* eslint-disable */
import { NS } from '@ns';
import Player from './zPlayer';
/* eslint-enable */

export function reclaimBot(ns: NS, p: Player, node: any) {
  const challenge = node.challenge || 0;
  ns.print(`[Reclaiming] [${challenge}] ${node.hostname}`);
  if (p.programs.sql) {
    ns.sqlinject(node.hostname);
  }
  if (p.programs.http) {
    ns.httpworm(node.hostname);
  }
  if (p.programs.smtp) {
    ns.relaysmtp(node.hostname);
  }
  if (p.programs.ftp) {
    ns.ftpcrack(node.hostname);
  }
  if (p.programs.ssh) {
    ns.brutessh(node.hostname);
  }
  ns.nuke(node.hostname);
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const target = ns.args[0] as string;
  const node = ns.getServer(target);
  const p = new Player(ns);

  if (!target || flags.help) {
    ns.tprint('Single server nuker');
    ns.tprint(`Usage: run ${ns.getScriptName()} SERVER_NAME`);
    return;
  }

  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');

  ns.print(`[Running] ${target}`);
  reclaimBot(ns, p, node);

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
