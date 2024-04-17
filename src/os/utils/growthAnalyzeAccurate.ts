/* eslint-disable */
import { NS } from '@ns';
import { CONSTANTS } from '/os/data/constants';
/* eslint-enable */

export function growthAnalyzeAccurate(
  ns: NS,
  serverDifficulty: number,
  serverGrowth: number,
  serverMoneyMax: number,
  serverMoneyNow: number,
  targetMoney: number,
  cores = 1
): number {
  // Rework of numCycleForGrowthCorrected
  const playerMult = ns.getPlayer().mults.hacking_grow || 1;
  let bnMult = 1;
  switch (ns.getResetInfo().currentNode) {
    case 2: {
      bnMult = 0.8;
      break;
    }

    case 3: {
      bnMult = 0.2;
      break;
    }

    case 11: {
      bnMult = 0.2;
      break;
    }

    case 12: {
      const inc = 1.02 ** 1; // lvl
      const dec = 1 / inc;
      bnMult = dec;
      break;
    }

    default: {
      bnMult = 1;
      break;
    }
  }
  if (serverMoneyNow < 0) serverMoneyNow = 0; // servers "can't" have less than 0 dollars on them
  if (targetMoney > serverMoneyMax) targetMoney = serverMoneyMax; // can't grow a server to more than its moneyMax
  if (targetMoney <= serverMoneyNow) return 0; // no growth --> no threads

  // exponential base adjusted by security
  const adjGrowthRate =
    1 + (CONSTANTS.ServerBaseGrowthRate - 1) / serverDifficulty;
  const exponentialBase = Math.min(
    adjGrowthRate,
    CONSTANTS.ServerMaxGrowthRate
  ); // cap growth rate

  // total of all grow thread multipliers
  const serverGrowthPercentage = serverGrowth / 100.0;
  const coreMultiplier = 1 + (cores - 1) / 16;
  const threadMultiplier =
    serverGrowthPercentage * playerMult * coreMultiplier * bnMult;

  const x = threadMultiplier * Math.log(exponentialBase);
  const y = serverMoneyNow * x + Math.log(targetMoney * x);

  let w;
  if (y < Math.log(2.5)) {
    const ey = Math.exp(y);
    w = (ey + (4 / 3) * ey * ey) / (1 + (7 / 3) * ey + (5 / 6) * ey * ey);
  } else {
    w = y;
    if (y > 0) w -= Math.log(y);
  }
  let cycles = w / x - serverMoneyNow;
  let bt = exponentialBase ** threadMultiplier;
  if (bt === Infinity) bt = 1e300;
  let corr = Infinity;
  do {
    let bct = bt ** cycles;
    if (bct === Infinity) bct = 1e300;
    const opc = serverMoneyNow + cycles;
    let diff = opc * bct - targetMoney;
    if (diff === Infinity) diff = 1e300;
    corr = diff / (opc * x + 1.0) / bct;
    cycles -= corr;
  } while (Math.abs(corr) >= 1);
  const fca = Math.floor(cycles);
  if (
    targetMoney <=
    (serverMoneyNow + fca) * exponentialBase ** (fca * threadMultiplier)
  ) {
    return fca;
  }
  const cca = Math.ceil(cycles);
  if (
    targetMoney <=
    (serverMoneyNow + cca) * exponentialBase ** (cca * threadMultiplier)
  ) {
    return cca;
  }
  return cca + 1;
}
