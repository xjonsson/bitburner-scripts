/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import { CITIES, UPGRADES } from '/os/data/constants';
import {
  cBuyUpgrades,
  cCheckInvestments,
  dBuyAds,
  dEnergyMorale,
  dOfficeAssignments,
  dChangeWarehouse,
  dBoostMaterial,
} from '/os/utils/corpFunctions';
/* eslint-enable */

const { fName, farm } = CORP;

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
      const e = farm.hires[0];
      const d = farm.roles[0];
      return dOfficeAssignments(ns, fName, CITIES, e, d);
    },
  },
  {
    // [1][5] Buy 1 advert
    step(ns: NS, corp: Corporation): boolean {
      return dBuyAds(ns, fName, 1, corp);
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
      return dEnergyMorale(ns, fName, corp);
    },
  },
  {
    // [1][8] Upgrade each city's warehouse twice (300)
    step(ns: NS, corp: Corporation): boolean {
      return dChangeWarehouse(ns, fName, farm.warehouse[1], corp);
    },
  },
  {
    // [1][9] Buy 2 of each first 5 upgrades (FW, NA, SPI, NNII, SF)
    step(ns: NS, corp: Corporation): boolean {
      return cBuyUpgrades(ns, UPGRADES.slice(0, 5), 2, corp);
    },
  },
  {
    // [1][10] Staff EnergyMorale > 95%
    step(ns: NS, corp: Corporation): boolean {
      return dEnergyMorale(ns, fName, corp);
    },
  },
  {
    // [1][11] Get Materials
    step(ns: NS) {
      return dBoostMaterial(ns, fName, 0);
    },
  },
  {
    // TODO: [1][12] 1st investor round ~ 140b
    step(ns: NS, corp: Corporation) {
      return cCheckInvestments(ns, 1, corp);
    },
  },
  {
    // [1][13] Upgrade each office to size of 9 and set them to 1 Ops, 1 Eng, 1 Bus, 1 Man, 5 R&D
    step(ns: NS): boolean {
      const e = farm.hires[1];
      const d = farm.roles[1];
      return dOfficeAssignments(ns, fName, CITIES, e, d);
    },
  },
  {
    // [1][14] Upgrade Smart Factories and Smart Storage to level 10
    step(ns: NS, corp: Corporation): boolean {
      return cBuyUpgrades(ns, [UPGRADES[4], UPGRADES[5]], 10, corp);
    },
  },
  {
    // [1][15] Upgrade each warehouse 7 times (should end up with 2 000 storage)
    step(ns: NS, corp: Corporation): boolean {
      return dChangeWarehouse(ns, fName, farm.warehouse[2], corp);
    },
  },
  {
    // [1][16] Staff EnergyMorale > 95%
    step(ns: NS, corp: Corporation): boolean {
      return dEnergyMorale(ns, fName, corp);
    },
  },
  {
    // [1][17] Materials
    step(ns: NS) {
      return dBoostMaterial(ns, fName, 1);
    },
  },
  {
    // [1][18] Redistribute the employees 3 Ops, 2 Eng, 2 Bus, 2 Man
    step(ns: NS): boolean {
      const e = farm.hires[2];
      const d = farm.roles[2];
      return dOfficeAssignments(ns, fName, CITIES, e, d);
    },
  },
  {
    // TODO:[1][19] Accept 2nd investor Offer, should be about 5t
    step(ns: NS, corp: Corporation) {
      return cCheckInvestments(ns, 2, corp);
    },
  },
  {
    // [1][20] Upgrade each warehouse 9 more time (should end up with 3 800 storage)
    step(ns: NS, corp: Corporation): boolean {
      return dChangeWarehouse(ns, fName, farm.warehouse[3], corp);
    },
  },
  {
    // [1][21] Materials
    step(ns: NS) {
      return dBoostMaterial(ns, fName, 2);
    },
  },
];

export function corpLogicPhase1(ns: NS, _stage = 0, corp: Corporation): any {
  // ******** Phase 1
  let phase = 1;
  let stage = _stage;

  ns.print(`[Phase 1] Agriculture`);
  if (stage <= phase1.length - 1 && corp.wait <= 0) {
    // waitCycles = 0;
    corp.wait = 0;
    stage = !phase1[stage].step(ns, corp) ? stage : (stage += 1);
  } else {
    ns.print(`We are at Stage: ${stage} | Waiting ${corp.wait} cycles`);
  }

  // Completed phase
  if (stage >= 21) {
    phase += 1;
    stage = 0;
  }

  corp.wait -= 1;
  return { phase, stage };
}
