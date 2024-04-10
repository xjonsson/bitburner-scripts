/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
/* eslint-enable */

const { corpName } = CORP;

const phase0 = [
  {
    // [0][0] Create corporation
    check(ns: NS) {
      if (ns.corporation.hasCorporation()) return true;
      return false;
    },
    action(ns: NS) {
      ns.corporation.createCorporation(corpName, false);
      return 0;
    },
  },
];

export function corpLogicPhase0(ns: NS): any {
  // ******** Phase 0
  let phase = 0;
  let stage = 0;

  // [0][0] Create corporation
  stage = !phase0[0].check(ns) ? phase0[0].action(ns) : (stage += 1);

  // Completed phase
  if (stage >= 1) {
    phase += 1;
    stage = 0;
  }
  return { phase, stage };
}
