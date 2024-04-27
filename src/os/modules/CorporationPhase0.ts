/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
/* eslint-enable */

const { cName } = CORP;

const phase0 = [
  {
    // [0][0] Create corporation
    step(ns: NS) {
      if (ns.corporation.hasCorporation()) {
        ns.print(`:: Corporation exists`);
        return true;
      }
      try {
        ns.print(`:: Create using seed money`);
        ns.corporation.createCorporation(cName, false);
      } catch (e) {
        ns.print(`:: Not on BN3 using capital`);
        ns.corporation.createCorporation(cName, true);
      }
      return false;
    },
  },
];

export function corpLogicPhase0(ns: NS): any {
  // ******** Phase 0
  let phase = 0;
  let stage = 0;

  // [0][0] Create corporation
  ns.print(`[Phase 0] Create corporation`);
  stage = !phase0[stage].step(ns) ? stage : (stage += 1);

  // Completed phase
  if (stage >= 1) {
    phase += 1;
    stage = 0;
  }
  return { phase, stage };
}
