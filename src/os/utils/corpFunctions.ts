/* eslint-disable */
import { CityName, NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import {
  CITIES,
  BOOST,
  RESEARCH,
  INDUSTRY,
  INDUSTRYRATIO,
  MATERIALWEIGHTS,
} from '/os/data/constants';
/* eslint-enable */

const { iRounds, farm } = CORP;

// ******** CORPORATE FUNCTIONS
export function cBuyUpgrades(
  ns: NS,
  upgrades: any[],
  uLevel: number,
  corp: Corporation
): boolean {
  const c = ns.corporation;

  if (upgrades.every((u: any) => c.getUpgradeLevel(u) >= uLevel)) {
    ns.print(`:: ${upgrades} are at ${uLevel}`);
    return true;
  }

  upgrades.every((u: any) => {
    const { funds } = c.getCorporation();
    const price = c.getUpgradeLevelCost(u);
    for (let i = 0; i <= uLevel - c.getUpgradeLevel(u); i += 1) {
      const nLevel = c.getUpgradeLevel(u);
      if (nLevel < uLevel && funds > price) {
        c.levelUpgrade(u);
        ns.print(`[Upgrade] ${u} to ${nLevel + 1}`);
      } else {
        ns.print(
          `[Funds] Cant upgrade ${u} to ${nLevel + 1} need ${ns.formatNumber(
            price - funds,
            1
          )}`
        );
        corp.wait = 10;
        return false;
      }
    }
    return true;
  });

  return false;
}

export function cCheckInvestments(
  ns: NS,
  stage: number,
  corp: Corporation
): boolean {
  const c = ns.corporation;
  const { funds, round } = c.getInvestmentOffer();
  ns.print(`[Investment] Round ${round}`);
  if (round > stage) return true; // FIXME: Add the highest number here

  if (round === 2 && stage === 2 && funds >= iRounds[round - 1]) {
    ns.print(`[Investment] Accepting (${ns.formatNumber(funds, 1)})`);
    c.acceptInvestmentOffer();
    return true;
  }

  if (round === 1 && stage === 1 && funds >= iRounds[round - 1]) {
    ns.print(`[Investment] Accepting (${ns.formatNumber(funds, 1)})`);
    c.acceptInvestmentOffer();
    return true;
  }
  ns.print(`[Investment] Offer of ${ns.formatNumber(funds, 1)}`);
  ns.print(`[Investment] Waiting for better offer...`);
  corp.wait = 5;

  return false;
}

// ******** DIVISION FUNCTIONS
export function dEnergyMorale(
  ns: NS,
  division: string,
  corp: Corporation
): boolean {
  const pass = CITIES.every((city: any) => {
    const { funds } = ns.corporation.getCorporation();
    const o = ns.corporation.getOffice(division, city);
    if (o.avgEnergy > 0.95 * o.maxEnergy && o.avgMorale > 0.95 * o.maxMorale) {
      ns.print(`:: Moral & Energy high in ${city}`);
      return true;
    }
    if (funds > o.size * 500e3) {
      ns.print(`[Moral] Below 95%, waiting...`);
      corp.wait = 5;
      return false;
    }
    ns.print(`[Moral] We are too broke to wait...`);
    return true;
  });
  return pass;
}

export function dOfficeAssignments(
  ns: NS,
  division: string,
  cities: string[],
  e: number,
  d: number[]
): boolean {
  const c = ns.corporation;
  let pass = true;

  cities.forEach((city: any) => {
    const o = c.getOffice(division, city);
    if (
      o.numEmployees === e &&
      o.employeeJobs.Operations === d[0] &&
      o.employeeJobs.Engineer === d[1] &&
      o.employeeJobs.Business === d[2] &&
      o.employeeJobs.Management === d[3] &&
      o.employeeJobs['Research & Development'] === d[4] &&
      o.employeeJobs.Intern === d[5] &&
      o.employeeJobs.Unassigned === d[6]
    ) {
      ns.print(`:: We have correct assignments in ${city}`);
    } else if (e > o.size) {
      const price = c.getOfficeSizeUpgradeCost(division, city, e - o.size);

      if (c.getCorporation().funds > price) {
        ns.print(`[${o.city}] Upgrading +${e - o.size}`);
        c.upgradeOfficeSize(division, city, e - o.size);
      } else {
        ns.print(
          `:: Cant afford ${e - o.size} (${ns.formatNumber(price, 1)} in ${
            o.city
          })`
        );
      }
      pass = false;
    } else {
      let h = e - o.numEmployees;
      while (h > 0 && e <= o.size) {
        ns.print(`[${o.city}] Hiring employee`);
        c.hireEmployee(division, city);
        h -= 1;
      }

      if (o.numEmployees === e) {
        if (o.employeeJobs.Unassigned === 0) {
          // Clear assignments
          ns.print(`[${o.city}] Clearing assignments`);
          c.setAutoJobAssignment(division, city, 'Intern', 0);
          c.setAutoJobAssignment(division, city, 'Research & Development', 0);
          c.setAutoJobAssignment(division, city, 'Management', 0);
          c.setAutoJobAssignment(division, city, 'Business', 0);
          c.setAutoJobAssignment(division, city, 'Engineer', 0);
          c.setAutoJobAssignment(division, city, 'Operations', 0);
        }
        ns.print(`[${o.city}] Reassigning employees`);
        c.setAutoJobAssignment(division, city, 'Operations', d[0]);
        c.setAutoJobAssignment(division, city, 'Engineer', d[1]);
        c.setAutoJobAssignment(division, city, 'Business', d[2]);
        c.setAutoJobAssignment(division, city, 'Management', d[3]);
        c.setAutoJobAssignment(division, city, 'Research & Development', d[4]);
        c.setAutoJobAssignment(division, city, 'Intern', d[5]);
        c.setAutoJobAssignment(division, city, 'Unassigned', d[6]);
      }
      pass = false;
    }
  });

  return pass;
}

export function dBuyAds(
  ns: NS,
  division: string,
  count: number,
  corp: Corporation
): boolean {
  const c = ns.corporation;

  if (c.getHireAdVertCount(division) >= count) {
    ns.print(`:: Adverts already at ${count}`);
    return true;
  }

  const upgrade = count - c.getHireAdVertCount(division);
  for (let i = 0; i < upgrade; i += 1) {
    const uLevel = c.getHireAdVertCount(division);
    if (c.getCorporation().funds > c.getHireAdVertCost(division)) {
      ns.print(`[Adverts] upgrading ${uLevel + 1}`);
      c.hireAdVert(division);
    } else {
      ns.print(`[Adverts] cant afford ${uLevel + 1}`);
      // waitCycles += 10;
      corp.wait = 10;
      break;
    }
  }

  return false;
}

export function dChangeWarehouse(
  ns: NS,
  division: string,
  storage: number,
  corp: Corporation
): boolean {
  let pass = true;
  const c = ns.corporation;
  CITIES.forEach((city: any) => {
    const w = c.getWarehouse(division, city);
    if (w.size >= storage) {
      ns.print(`:: Storage already at ${storage} in ${city}`);
    } else {
      const cost = c.getUpgradeWarehouseCost(division, city);
      if (w.size < storage && c.getCorporation().funds > cost) {
        ns.print(`[Warehouse] Upgrade in ${city}`);
        c.upgradeWarehouse(division, city);
      } else {
        ns.print(`[Warehouse] Cant afford upgrade in ${city}`);
        corp.wait = 10;
      }
      pass = false;
    }
  });
  return pass;
}

export function dBoostMaterial(ns: NS, division: string, s: number): boolean {
  const c = ns.corporation;
  let pass = true;

  CITIES.forEach((city: any) => {
    BOOST.forEach((mName: any) => {
      const m = c.getMaterial(division, city, mName);
      if (m.stored >= farm.boost[mName][s]) {
        ns.print(`:: Already have ${farm.boost[mName][s]} ${mName} in ${city}`);
        c.buyMaterial(division, city, mName, 0);
      } else {
        ns.print(
          `[Buy] ${farm.boost[mName][s]} ${mName} @${
            (farm.boost[mName][s] - m.stored) / 10
          }/s ${city}`
        );
        c.buyMaterial(
          division,
          city,
          mName,
          (farm.boost[mName][s] - m.stored) / 10
        );
        pass = false;
      }
    });
  });

  return pass;
}

// ******** PRODUCT DIVISION FUNCTIONS
export function dCheckProductsSelling(
  ns: NS,
  division: string,
  city: any
): boolean {
  const c = ns.corporation;
  const { products } = c.getDivision(division);
  let pass = true;
  products.forEach((n) => {
    const p = c.getProduct(division, city, n);
    const pDP = p.developmentProgress;
    const pSP = p.desiredSellPrice;
    const pSA = p.desiredSellAmount;

    // ns.print(`${n} is complete`);
    // Sanity check products
    if (pDP === 100 && (pSP === '' || pSP === 0 || pSA === '' || pSA === 0)) {
      ns.print(`[Product] ${n} was not selling, set to MAX | MP`);
      c.sellProduct(division, city, n, 'MAX', 'MP', true);
      pass = false;
    }

    // Enable TA II
    c.setProductMarketTA2(division, n, true);
    // ns.tprint(p); // DEBUG
  });
  return pass;
}

export function dCheckNoActiveDevelopment(
  ns: NS,
  division: string,
  city: any
): boolean {
  const c = ns.corporation;
  const { products } = c.getDivision(division);
  return products.every(
    (n) => c.getProduct(division, city, n).developmentProgress === 100
  );
}

export function dCheckMarketResearch(
  ns: NS,
  division: string,
  rp: number
): boolean {
  const c = ns.corporation;

  if (!c.hasResearched(division, RESEARCH.Lab)) {
    //   1. Lab: 'Hi-Tech R&D Laboratory',
    const rPrice = c.getResearchCost(division, RESEARCH.Lab);
    if (rp > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.Lab}`);
      c.research(division, RESEARCH.Lab);
      return false;
    }
    ns.print(`:::: Lab (${ns.formatNumber(rPrice - rp, 2)})`);
  } else if (
    !c.hasResearched(division, RESEARCH.MarketTa1) ||
    !c.hasResearched(division, RESEARCH.MarketTa2)
  ) {
    //   2. MarketTa1: 'Market-TA.I',
    //   2. MarketTa2: 'Market-TA.II',
    const rPrice =
      c.getResearchCost(division, RESEARCH.MarketTa1) +
      c.getResearchCost(division, RESEARCH.MarketTa2);
    if (rp / 2 > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.MarketTa1}`);
      c.research(division, RESEARCH.MarketTa1);
      ns.print(`:::: Unlocking ${RESEARCH.MarketTa2}`);
      c.research(division, RESEARCH.MarketTa2);
      return false;
    }
    ns.print(`:::: TA II (${ns.formatNumber(rPrice - rp, 2)})`);
  } else if (
    !c.hasResearched(division, RESEARCH.AutoDrug) ||
    !c.hasResearched(division, RESEARCH.GoJuice) ||
    !c.hasResearched(division, RESEARCH.CPH4Inject)
  ) {
    //   3. AutoDrug: 'Automatic Drug Administration',
    //   3. GoJuice: 'Go-Juice',
    //   3. CPH4Inject: 'CPH4 Injections',
    const rPrice =
      c.getResearchCost(division, RESEARCH.AutoDrug) +
      c.getResearchCost(division, RESEARCH.GoJuice) +
      c.getResearchCost(division, RESEARCH.CPH4Inject);
    if (rp / 2 > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.AutoDrug}`);
      c.research(division, RESEARCH.AutoDrug);
      ns.print(`:::: Unlocking ${RESEARCH.GoJuice}`);
      c.research(division, RESEARCH.GoJuice);
      ns.print(`:::: Unlocking ${RESEARCH.CPH4Inject}`);
      c.research(division, RESEARCH.CPH4Inject);
      return false;
    }
  } else if (
    !c.hasResearched(division, RESEARCH.Overclock) ||
    !c.hasResearched(division, RESEARCH.Stimu)
  ) {
    //   4. Overclock: 'Overclock',
    //   4. Stimu: 'Sti.mu',
    const rPrice =
      c.getResearchCost(division, RESEARCH.Overclock) +
      c.getResearchCost(division, RESEARCH.Stimu);
    if (rp / 2 > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.Overclock}`);
      c.research(division, RESEARCH.Overclock);
      ns.print(`:::: Unlocking ${RESEARCH.Stimu}`);
      c.research(division, RESEARCH.Stimu);
      return false;
    }
  } else if (
    !c.hasResearched(division, RESEARCH.Drones) ||
    !c.hasResearched(division, RESEARCH.DronesAssembly) ||
    !c.hasResearched(division, RESEARCH.DronesTransport)
  ) {
    //   5. Drones: 'Drones',
    //   5. DronesAssembly: 'Drones - Assembly',
    //   5. DronesTransport: 'Drones - Transport',
    const rPrice =
      c.getResearchCost(division, RESEARCH.Drones) +
      c.getResearchCost(division, RESEARCH.DronesAssembly) +
      c.getResearchCost(division, RESEARCH.DronesTransport);
    if (rp / 2 > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.Drones}`);
      c.research(division, RESEARCH.Drones);
      ns.print(`:::: Unlocking ${RESEARCH.DronesAssembly}`);
      c.research(division, RESEARCH.DronesAssembly);
      ns.print(`:::: Unlocking ${RESEARCH.DronesTransport}`);
      c.research(division, RESEARCH.DronesTransport);
      return false;
    }
  } else if (!c.hasResearched(division, RESEARCH.SelfCorrectAssemblers)) {
    //   6. SelfCorrectAssemblers: 'Self-Correcting Assemblers',
    const rPrice = c.getResearchCost(division, RESEARCH.SelfCorrectAssemblers);
    if (rp / 2 > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.SelfCorrectAssemblers}`);
      c.research(division, RESEARCH.SelfCorrectAssemblers);
      return false;
    }
  } else if (!c.hasResearched(division, RESEARCH.upgradeFulcrum)) {
    //   7. upgradeFulcrum: 'uPgrade: Fulcrum',
    const rPrice = c.getResearchCost(division, RESEARCH.upgradeFulcrum);
    if (rp / 2 > rPrice) {
      ns.print(`:::: Unlocking ${RESEARCH.upgradeFulcrum}`);
      c.research(division, RESEARCH.upgradeFulcrum);
      return false;
    }
  }

  return true;
}

// FIXME: This is too safe of an option
// Market Research - Demand (5e9) Grants access to Demand data - Need to Market-TA2
// Market Data - Competition (5e9) Grants access to Competition data - Need to Market-TA2
export function pCalculatePrice(
  ns: NS,
  division: string,
  city: any,
  product: string
): number {
  const c = ns.corporation;
  // const o = c.getOffice(division, city);
  const ostats = c.getOffice(division, city).employeeProductionByJob;
  const p = c.getProduct(division, city, product);

  // Destructuring
  const totalProd = ostats.total;
  // const engrRatio = ostats.Engineer / totalProd;
  const mgmtRatio = ostats.Management / totalProd;
  // const rndRatio = ostats['Research & Development'] / totalProd;
  // const opsRatio = ostats.Operations / totalProd;
  const busRatio = ostats.Business / totalProd;

  // const advMult = 1 + Math.pow(p.advertisingInvestment, 0.1) / 100;
  const advMult = 1 + p.advertisingInvestment ** 0.1 / 100;
  const busmgtgRatio = Math.max(busRatio + mgmtRatio, 1 / totalProd);
  // const markup =
  //   100 / (advMult * Math.pow((p.stats.quality + 0.001), 0.65) * busmgtgRatio);
  const markup =
    100 / (advMult * (p.stats.quality + 0.001) ** 0.65 * busmgtgRatio);

  const markupLimit = Math.max(p.effectiveRating, 0.001) / markup;
  const optimalPrice = p.productionCost + markupLimit;
  return optimalPrice;
}

export function dBoostWarehouse(
  ns: NS,
  division: string,
  city: any,
  industry: string
) {
  const c = ns.corporation;
  const w = c.getWarehouse(division, city);
  const i = INDUSTRYRATIO[industry];
  const wSize = w.size * CORP.warehouse.boost;
  const wSizeRatio = w.sizeUsed / w.size;
  let result = {
    upgrade: false,
    boost: false,
    bHardware: 0,
    bRobots: 0,
    bAI: 0,
    bReal: 0,
    pCity: 0,
  };

  if (wSizeRatio > CORP.warehouse.grow) {
    result.upgrade = true;
    return result;
  }

  if (wSizeRatio < CORP.warehouse.boost) {
    result.boost = true;

    // Set details
    const c1Hardware = i.hardwareFactor;
    const c2Robots = i.robotFactor;
    const c3AI = i.aiCoreFactor;
    const c4Real = i.realEstateFactor;
    const s1Hardware = MATERIALWEIGHTS.Hardware;
    const s2Robots = MATERIALWEIGHTS.Robots;
    const s3AI = MATERIALWEIGHTS['AI Cores'];
    const s4Real = MATERIALWEIGHTS['Real Estate'];

    // Calculations
    const uHardware =
      (wSize -
        500 *
          ((s1Hardware / c1Hardware) * (c2Robots + c3AI + c4Real) -
            (s2Robots + s3AI + s4Real))) /
      ((c1Hardware + c2Robots + c3AI + c4Real) / c1Hardware);
    const uRobots =
      (wSize -
        500 *
          ((s2Robots / c2Robots) * (c1Hardware + c3AI + c4Real) -
            (s1Hardware + s3AI + s4Real))) /
      ((c1Hardware + c2Robots + c3AI + c4Real) / c2Robots);
    const uAI =
      (wSize -
        500 *
          ((s3AI / c3AI) * (c1Hardware + c2Robots + c4Real) -
            (s1Hardware + s2Robots + s4Real))) /
      ((c1Hardware + c2Robots + c3AI + c4Real) / c3AI);
    const uReal =
      (wSize -
        500 *
          ((s4Real / c4Real) * (c1Hardware + c2Robots + c3AI) -
            (s1Hardware + s2Robots + s3AI))) /
      ((c1Hardware + c2Robots + c3AI + c4Real) / c4Real);

    const bHardware = uHardware / s1Hardware;
    const bRobots = uRobots / s2Robots;
    const bAI = uAI / s3AI;
    const bReal = uReal / s4Real;

    const k = 0.002;
    const pHardware = (k * (bHardware > 0 ? bHardware : 0) + 1) ** c1Hardware;
    const pRobots = (k * (bRobots > 0 ? bRobots : 0) + 1) ** c2Robots;
    const pAI = (k * (bAI > 0 ? bAI : 0) + 1) ** c3AI;
    const pReal = (k * (bReal > 0 ? bReal : 0) + 1) ** c4Real;
    const pCity = (pHardware * pRobots * pAI * pReal) ** 0.73;
    const pDivision = pCity * 6;

    result = {
      ...result,
      bHardware,
      bRobots,
      bAI,
      bReal,
      pCity,
    };

    // DEBUGGING
    // ns.tprint(`${division} | ${city} | Warehouse: ${wSize.toFixed(0)}`);
    // const rowHeader = `%8s | %-14s | %10s | %6s | %8s | %4s `;
    // ns.tprintf(
    //   rowHeader,
    //   'Size (S)',
    //   'n Boost',
    //   'Factor (C)',
    //   'Amount',
    //   'Size',
    //   'Multiplier'
    // );
    // ns.tprintf(
    //   rowHeader,
    //   s1Hardware,
    //   'x Hardware',
    //   c1Hardware,
    //   bHardware.toFixed(0),
    //   uHardware.toFixed(2),
    //   pHardware.toFixed(4)
    // );
    // ns.tprintf(
    //   rowHeader,
    //   s2Robots,
    //   'y Robots',
    //   c2Robots,
    //   bRobots.toFixed(0),
    //   uRobots.toFixed(2),
    //   pRobots.toFixed(4)
    // );
    // ns.tprintf(
    //   rowHeader,
    //   s3AI,
    //   'z AI Cores',
    //   c3AI,
    //   bAI.toFixed(0),
    //   uAI.toFixed(2),
    //   pAI.toFixed(4)
    // );
    // ns.tprintf(
    //   rowHeader,
    //   s4Real,
    //   'w Real Estate',
    //   c4Real,
    //   bReal.toFixed(0),
    //   uReal.toFixed(2),
    //   pReal.toFixed(4)
    // );
    // ns.tprint(`[City Multiplier] ${pCity.toFixed(3)}`);
    // ns.tprint(`[Division Multiplier] ${pDivision.toFixed(3)}`);

    if (bHardware < 0 || bRobots < 0 || bAI < 0 || bReal < 0) {
      // ns.tprint(`[Warehouse] Increase storage, too small to optimize`);
      result.upgrade = true;
      result.boost = false;
    }

    return result;
  }

  return result;
}
