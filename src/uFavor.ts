/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

const CONSTANTS = {
  MaxSkillLevel: 975,
};

function mult(ns: NS, favor: number): number {
  let favorMult = 1 + favor / 100;
  if (Number.isNaN(favorMult)) {
    favorMult = 1;
  }
  const nodeMulti = ns.getPlayer().bitNodeN;
  let bnMult = 1;
  switch (nodeMulti) {
    case 2: {
      bnMult = 0.5;
      break;
    }
    case 4: {
      bnMult = 0.75;
      break;
    }
    case 12: {
      const inc = 1.02 ** nodeMulti; // lvl
      const dec = 1 / inc;
      bnMult = dec;
      break;
    }
    case 13: {
      bnMult = 0.6;
      break;
    }
    default: {
      bnMult = 1;
    }
  }
  return favorMult * bnMult;
}

export function calculateIntelligenceBonus(
  intelligence: number,
  weight = 1
): number {
  return 1 + (weight * intelligence ** 0.8) / 600;
}

export function getHackingWorkRepGain(ns: NS, favor: number): number {
  const p = ns.getPlayer();
  return (
    ((p.skills.hacking + p.skills.intelligence / 3) / CONSTANTS.MaxSkillLevel) *
    p.mults.faction_rep *
    calculateIntelligenceBonus(p.skills.intelligence, 1) *
    mult(ns, favor) *
    1
    // CalculateShareMult()
  );
}

function repNeededForFavor(targetFavor: number, currentRep = 0) {
  let favorGain = 0;
  let reputationNeeded = 0;

  const ReputationToFavorBase = 500;
  const ReputationToFavorMult = 1.02;

  let reqdRep = ReputationToFavorBase;
  while (favorGain < targetFavor) {
    reputationNeeded += reqdRep;
    favorGain += 1;
    reqdRep *= ReputationToFavorMult;
  }

  return reputationNeeded - currentRep;
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const targetFavor = ns.args[0] as number;
  const currentRep = (ns.args[1] as number) || 0;
  const repSpeed = (ns.args[2] as number) || 0;
  // const repSpeedReal = getHackingWorkRepGain(ns, currentFavor);

  if (!targetFavor || flags.help) {
    ns.tprint('Calculator reputation for favor');
    ns.tprint(`> run ${ns.getScriptName()} targetFavor currentRep repSpeed`);
    return;
  }

  const repNeeded = repNeededForFavor(targetFavor, currentRep);

  ns.tprint(
    `you need ${repNeeded} total reputation with a faction or company` +
      ` to get to ${targetFavor} favor.`
  );
  ns.tprint(`[Favor] ${targetFavor} would need`);
  ns.tprint(`[Rep] ${repNeeded} (${ns.formatNumber(repNeeded, 2)})`);
  if (repSpeed > 0) {
    ns.tprint(
      `[Speed] ${repNeeded / repSpeed} seconds (${ns.tFormat(
        (repNeeded / repSpeed) * 1000
      )})`
    );
    // ns.tprint(
    //   `[Speed Real] ${repNeeded / repSpeedReal} seconds (${ns.tFormat(
    //     (repNeeded / repSpeedReal) * 1000
    //   )}) Rep Speed (${repSpeedReal})`
    // );
  }
}
