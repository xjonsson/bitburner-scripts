/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import { CITIES, UPGRADES, BOOST } from '/os/data/constants';
/* eslint-enable */

const { cName, fName, iRounds, farm } = CORP;

// ******** Shared functions
function checkEnergyMorale(ns: NS, corp: Corporation): boolean {
  const pass = CITIES.every((city: any) => {
    const o = ns.corporation.getOffice(fName, city);
    if (o.avgEnergy > 0.95 * o.maxEnergy && o.avgMorale > 0.95 * o.maxMorale) {
      ns.print(`:: Moral & Energy high in ${city}`);
      return true;
    }
    ns.print(`[Moral] Below 95%, waiting...`);
    corp.wait = 5;
    return false;
  });
  return pass;
}

function changeOfficeAssignments(ns: NS, e: number, d: number[]): boolean {
  const c = ns.corporation;
  let pass = true;

  CITIES.forEach((city: any) => {
    const o = c.getOffice(fName, city);
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
      const price = c.getOfficeSizeUpgradeCost(fName, city, e - o.size);

      if (c.getCorporation().funds > price) {
        ns.print(`[${o.city}] Upgrading +${e - o.size}`);
        c.upgradeOfficeSize(fName, city, e - o.size);
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
        c.hireEmployee(fName, city);
        h -= 1;
      }

      if (o.numEmployees === e) {
        if (o.employeeJobs.Unassigned === 0) {
          // Clear assignments
          ns.print(`[${o.city}] Clearing assignments`);
          c.setAutoJobAssignment(fName, city, 'Intern', 0);
          c.setAutoJobAssignment(fName, city, 'Research & Development', 0);
          c.setAutoJobAssignment(fName, city, 'Management', 0);
          c.setAutoJobAssignment(fName, city, 'Business', d[2]);
          c.setAutoJobAssignment(fName, city, 'Engineer', d[1]);
          c.setAutoJobAssignment(fName, city, 'Operations', d[0]);
        }
        ns.print(`[${o.city}] Reassigning employees`);
        c.setAutoJobAssignment(fName, city, 'Operations', d[0]);
        c.setAutoJobAssignment(fName, city, 'Engineer', d[1]);
        c.setAutoJobAssignment(fName, city, 'Business', d[2]);
        c.setAutoJobAssignment(fName, city, 'Management', d[3]);
        c.setAutoJobAssignment(fName, city, 'Research & Development', d[4]);
        c.setAutoJobAssignment(fName, city, 'Intern', d[5]);
        c.setAutoJobAssignment(fName, city, 'Unassigned', d[6]);
      }
      pass = false;
    }
  });

  return pass;
}

function buyAds(ns: NS, count: number, corp: Corporation): boolean {
  const c = ns.corporation;

  if (c.getHireAdVertCount(fName) >= count) {
    ns.print(`:: Adverts already at ${count}`);
    return true;
  }

  const upgrade = count - c.getHireAdVertCount(fName);
  for (let i = 0; i < upgrade; i += 1) {
    const uLevel = c.getHireAdVertCount(fName);
    if (c.getCorporation().funds > c.getHireAdVertCost(fName)) {
      ns.print(`[Adverts] upgrading ${uLevel + 1}`);
      c.hireAdVert(fName);
    } else {
      ns.print(`[Adverts] cant afford ${uLevel + 1}`);
      // waitCycles += 10;
      corp.wait = 10;
      break;
    }
  }

  return false;
}

function changeWarehouse(ns: NS, storage: number, corp: Corporation): boolean {
  let pass = true;
  const c = ns.corporation;
  CITIES.forEach((city: any) => {
    const w = c.getWarehouse(fName, city);
    if (w.size >= storage) {
      ns.print(`:: Storage already at ${storage} in ${city}`);
    } else {
      const cost = c.getUpgradeWarehouseCost(fName, city);
      if (w.size < storage && c.getCorporation().funds > cost) {
        ns.print(`[Warehouse] Upgrade in ${city}`);
        c.upgradeWarehouse(fName, city);
      } else {
        ns.print(`[Warehouse] Cant afford upgrade in ${city}`);
        corp.wait = 10;
      }
      pass = false;
    }
  });
  return pass;
}

function changeUpgrades(
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

function changeBoostMaterial(ns: NS, s: number): boolean {
  const c = ns.corporation;
  let pass = true;

  CITIES.forEach((city: any) => {
    BOOST.forEach((mName: any) => {
      const m = c.getMaterial(fName, city, mName);
      if (m.stored >= farm.boost[mName][s]) {
        ns.print(`:: Already have ${farm.boost[mName][s]} ${mName} in ${city}`);
        c.buyMaterial(fName, city, mName, 0);
      } else {
        ns.print(
          `[Buy] ${farm.boost[mName][s]} ${mName} @${
            (farm.boost[mName][s] - m.stored) / 10
          }/s ${city}`
        );
        c.buyMaterial(
          fName,
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

function checkInvestments(ns: NS, stage: number, corp: Corporation): boolean {
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

// ******** Phase 1 - Agriculture Steps
const phase1 = [
  {
    // [1][0] Buy Smart Supply
    step(ns: NS): boolean {
      const c = ns.corporation;
      if (c.hasUnlock('Smart Supply')) {
        ns.print(`:: We have Smart Supply`);
        return true;
      }

      if (c.getCorporation().funds > c.getUnlockCost('Smart Supply')) {
        ns.print(`[Buying] Smart Supply`);
        c.purchaseUnlock('Smart Supply');
      }
      return false;
    },
  },
  {
    // [1][1] Expand to Agriculture
    step(ns: NS): boolean {
      const c = ns.corporation;
      const divs = c.getCorporation().divisions;
      if (divs.length > 0 && divs.includes(fName)) {
        ns.print(`:: We have ${fName}`);
        return true;
      }
      ns.print(`[Expanding] Agriculture (${fName})`);
      c.expandIndustry('Agriculture', fName);
      return false;
    },
  },
  {
    // [1][2] Expand to all cities in Agriculture (Warehouses 3 employees, 1 Ops, 1 Eng, 1 Business
    step(ns: NS): boolean {
      const c = ns.corporation;
      if (ns.corporation.getDivision(fName).cities.length === 6) {
        ns.print(`:: We have offices in all cities`);
        return true;
      }

      const { cities } = c.getDivision(fName);
      CITIES.filter((n: any) => !cities.includes(n)).forEach((city: any) => {
        if (city !== CITIES[0]) {
          if (c.getCorporation().funds > 4e9) {
            ns.print(`[Expanding] Opening ${city}`);
            c.expandCity(fName, city);
          }
        }
      });
      return false;
    },
  },
  {
    // [1][3] Warehouses
    step(ns: NS): boolean {
      const c = ns.corporation;
      let pass = true;

      CITIES.forEach((city: any) => {
        if (
          c.hasWarehouse(fName, city) &&
          c.getWarehouse(fName, city).smartSupplyEnabled
        ) {
          ns.print(`:: We have a warehouse ${city} (SS On)`);
        } else if (c.getCorporation().funds > 5e9) {
          ns.print(`[Buying] Warehouse ${city}`);
          c.purchaseWarehouse(fName, city);
          if (c.hasWarehouse(fName, city)) {
            ns.print(`:: [Smart supply] Enabled`);
            c.setSmartSupply(fName, city, true);
          }
          pass = false;
        }
      });

      return pass;
    },
  },
  {
    // [1][4] Employees
    step(ns: NS): boolean {
      return changeOfficeAssignments(ns, farm.hires[0], farm.roles[0]);
    },
  },
  {
    // [1][5] Buy 1 advert
    step(ns: NS, corp: Corporation): boolean {
      return buyAds(ns, 1, corp);
    },
  },
  {
    // [1][6] Set produced materials to be sold
    step(ns: NS): boolean {
      let pass = true;
      CITIES.forEach((city: any) => {
        const mFood = ns.corporation.getMaterial(fName, city, 'Food');
        const mPlants = ns.corporation.getMaterial(fName, city, 'Plants');
        if (
          mFood.desiredSellPrice === 'MP' &&
          mFood.desiredSellAmount === 'MAX' &&
          mPlants.desiredSellPrice === 'MP' &&
          mPlants.desiredSellAmount === 'MAX'
        ) {
          ns.print(`:: Selling correctly in ${city}`);
        } else {
          ns.print(`[Selling] Setting ${city} to MAX & MP`);
          ns.corporation.sellMaterial(fName, city, 'Plants', 'MAX', 'MP');
          ns.corporation.sellMaterial(fName, city, 'Food', 'MAX', 'MP');
          pass = false;
        }
      });
      return pass;
    },
  },
  {
    // [1][7] Staff EnergyMorale > 95% or wait 5 cycles
    step(ns: NS, corp: Corporation): boolean {
      return checkEnergyMorale(ns, corp);
    },
  },
  {
    // [1][8] Upgrade each city's warehouse twice (300)
    step(ns: NS, corp: Corporation): boolean {
      return changeWarehouse(ns, farm.warehouse[1], corp);
    },
  },
  {
    // [1][9] Buy 2 of each first 5 upgrades (FW, NA, SPI, NNII, SF)
    step(ns: NS, corp: Corporation): boolean {
      return changeUpgrades(ns, UPGRADES.slice(0, 5), 2, corp);
    },
  },
  {
    // [1][10] Staff EnergyMorale > 95%
    step(ns: NS, corp: Corporation): boolean {
      return checkEnergyMorale(ns, corp);
    },
  },
  {
    // [1][11] Get Materials
    step(ns: NS) {
      return changeBoostMaterial(ns, 0);
    },
  },
  {
    // [1][12] 1st investor round ~ 140b
    step(ns: NS, corp: Corporation) {
      return checkInvestments(ns, 1, corp);
    },
  },
  {
    // [1][13] Upgrade each office to size of 9 and set them to 1 Ops, 1 Eng, 1 Bus, 1 Man, 5 R&D
    step(ns: NS): boolean {
      return changeOfficeAssignments(ns, farm.hires[1], farm.roles[1]);
    },
  },
  {
    // [1][14] Upgrade Smart Factories and Smart Storage to level 10
    step(ns: NS, corp: Corporation): boolean {
      return changeUpgrades(ns, [UPGRADES[4], UPGRADES[5]], 10, corp);
    },
  },
  {
    // [1][15] Upgrade each warehouse 7 times (should end up with 2 000 storage)
    step(ns: NS, corp: Corporation): boolean {
      return changeWarehouse(ns, farm.warehouse[2], corp);
    },
  },
  {
    // [1][16] Staff EnergyMorale > 95%
    step(ns: NS, corp: Corporation): boolean {
      return checkEnergyMorale(ns, corp);
    },
  },
  {
    // [1][17] Materials
    step(ns: NS) {
      return changeBoostMaterial(ns, 1);
    },
  },
  {
    // [1][18] Redistribute the employees 3 Ops, 2 Eng, 2 Bus, 2 Man
    step(ns: NS): boolean {
      return changeOfficeAssignments(ns, farm.hires[2], farm.roles[2]);
    },
  },
  {
    // TODO:[1][19] Accept 2nd investor Offer, should be about 5t
    step(ns: NS, corp: Corporation) {
      return checkInvestments(ns, 2, corp);
    },
  },
  {
    // TODO:[1][20] Upgrade each warehouse 9 more time (should end up with 3 800 storage)
    step(ns: NS, corp: Corporation): boolean {
      return changeWarehouse(ns, farm.warehouse[3], corp);
    },
  },
  {
    // TODO:[1][21] Materials
    step(ns: NS) {
      return changeBoostMaterial(ns, 2);
    },
  },
];

export function corpLogicPhase1(ns: NS, _stage = 0, corp: Corporation): any {
  // ******** Phase 1
  const phase = 1;
  let stage = _stage;

  ns.print(`[Phase 1] Agriculture`);
  if (stage <= phase1.length - 1 && corp.wait <= 0) {
    // waitCycles = 0;
    corp.wait = 0;
    stage = !phase1[stage].step(ns, corp) ? stage : (stage += 1);
  } else {
    ns.print(`We are at Stage: ${stage} | Waiting ${corp.wait} cycles`);
  }

  // TODO: Completed phase
  // if (stage >= 30) {
  //   phase += 1;
  //   stage = 0;
  // }
  // waitCycles -= 1;
  corp.wait -= 1;
  return { phase, stage };
}
