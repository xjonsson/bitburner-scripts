/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import { CITIES, BOOST } from '/os/data/constants';
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
