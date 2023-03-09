/* eslint-disable-next-line */
import { NS } from '@ns';

export async function main(ns: NS) {
  const flags = ns.flags([
    ['silent', false],
    ['help', false],
  ]);

  const hRAM = ns.args[0] as number;

  if (!hRAM || flags.help) {
    ns.tprint('This script controls the start of the game.');
    ns.tprint(`USAGE: run ${ns.getScriptName()} HOME_RAM (in GB)`);
    ns.tprint('Example:');
    ns.tprint(`> run ${ns.getScriptName()} 32`);
    return;
  }

  if (flags.silent !== true) {
    ns.tail();
  }

  ns.disableLog('ALL');
  ns.clearLog();

  const minimalCost = ns.getScriptRam('minimal.js');
  const controllerCost = ns.getScriptRam('controller.js');
  ns.print(`[Available] ${ns.formatRam(hRAM, 3)}`);
  ns.print(`[Minimal] Required: ${ns.formatRam(minimalCost, 3)}`);
  ns.print(`[Controller] Required: ${ns.formatRam(controllerCost, 3)}`);
  if (hRAM < controllerCost) {
    ns.print(`  [Using] Minimal`);
    ns.run('minimal.js');
  } else {
    ns.print(`  [Using] Controller`);
    ns.run('controller.js');
  }

  await ns.sleep(10000);
  ns.closeTail();
}
