/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { corpLogicPhase0 } from '/os/modules/CorporationPhase0';
import { corpLogicPhase1 } from '/os/modules/CorporationPhase1';
/* eslint-enable */

const { cName, fName, sName } = CORP;

export class Corp {
  // ******** Base
  ns: NS;
  name: string;
  exists: boolean;
  phase: number;
  stage: number;

  constructor(ns: NS) {
    this.ns = ns;
    this.exists = ns.corporation.hasCorporation();
    this.name = this.exists ? ns.corporation.getCorporation().name : cName;
    this.phase = -1;
    this.stage = -1;

    // const check = this.checkProgress(ns);
    // this.phase = check.phase;
    // this.stage = check.stage;
  }

  get corpData(): any {
    return this.ns.corporation.getCorporation();
  }

  state(cPhase = 0, cStage = 0): { phase: number; stage: number } {
    const { ns } = this;
    let phase = cPhase;
    let stage = cStage;

    if (phase === 0) {
      ({ phase, stage } = corpLogicPhase0(ns));
      this.phase = phase;
      this.stage = stage;
      // ns.tprint(`[P0] End P:${phase} S:${stage}`);
    }

    if (phase === 1) {
      ({ phase, stage } = corpLogicPhase1(ns, stage));
      ns.print(`[DEBUG] P:${phase} S:${stage}`);
      // ns.tprint(`[P1] End P:${phase} S:${stage}`);
    }

    return { phase, stage };
  }

  async checkEnergyMorale(ns: NS, dName?: string) {
    const c = ns.corporation;
    let pass = true;

    function checkOffice(d: any, o: any) {
      // Check Energy Levels
      // ns.tprint(`Checking: ${d} - ${o.city}`);
      if (o.avgEnergy < 0.95 * o.maxEnergy) {
        pass = false;
        if (c.getCorporation().funds > o.size * 500e3) {
          // ns.tprint(`Buying Tea: ${d} | ${o.city}`);
          c.buyTea(d, o.city);
        }
      }

      if (o.avgMorale < 0.95 * o.maxMorale) {
        pass = false;
        if (c.getCorporation().funds > o.size * 500e3) {
          // ns.tprint(`Party: ${d} | ${o.city}`);
          c.throwParty(d, o.city, 500e3);
        }
      }
    }

    if (this.exists) {
      if (c.getCorporation().divisions.length > 0) {
        const divs = c.getCorporation().divisions;
        if (dName && divs.includes(dName)) {
          const d = c.getDivision(dName);
          d.cities.forEach((city: any) => {
            checkOffice(dName, c.getOffice(dName, city));
          });
        } else {
          divs.forEach((tName: any) => {
            const d = c.getDivision(tName);
            d.cities.forEach((city: any) => {
              checkOffice(tName, c.getOffice(tName, city));
            });
          });
        }
        return pass;
      }
      return false;
    }
    return false;
  }

  // checkProgress(ns: NS): { phase: number; stage: number } {
  //   const c = this.ns.corporation;
  //   let loopReturn = { phase: -1, stage: -1 };
  //   let pass = true;

  //   // ******** Phase 0
  //   // [0][0] Create corporation
  //   // if (!c.hasCorporation()) return { phase: 0, stage: 0 };

  //   // ******** Phase 1 Agriculture
  //   // [1][0] Expand to Agriculture
  //   if (c.getCorporation().divisions.length === 0) {
  //     return { phase: 1, stage: 0 };
  //   }
  //   // [1][1] Buy Smart Supply
  //   if (!c.hasUnlock('Smart Supply')) return { phase: 1, stage: 1 };

  //   const f = c.getDivision(farmName);
  //   // [1][2] Expand to all cities in Agriculture (Warehouses 3 employees, 1 Ops, 1 Eng, 1 Business
  //   if (f.cities.length !== 6) return { phase: 1, stage: 2 };
  //   // [1][3] Warehouses
  //   CITIES.forEach((city: any) => {
  //     const warehouse = c.getWarehouse(farmName, city);
  //     if (warehouse.level < 10 || !warehouse.smartSupplyEnabled) {
  //       loopReturn = { phase: 1, stage: 3 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][4] Employees
  //   CITIES.forEach((city: any) => {
  //     const o = c.getOffice(farmName, city);
  //     if (
  //       o.numEmployees < 3 ||
  //       o.employeeJobs.Operations < 1 ||
  //       o.employeeJobs.Engineer < 1 ||
  //       o.employeeJobs.Business < 1
  //     ) {
  //       loopReturn = { phase: 1, stage: 4 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][5] Buy 1 advert
  //   if (c.getHireAdVertCount(farmName) < 1) return { phase: 1, stage: 5 };

  //   // [1][6] Set produced materials to be sold
  //   CITIES.forEach((city: any) => {
  //     const mFood = c.getMaterial(farmName, city, 'Food');
  //     const mPlants = c.getMaterial(farmName, city, 'Plants');
  //     if (
  //       mFood.desiredSellPrice !== 'MP' ||
  //       mFood.desiredSellAmount !== 'MAX' ||
  //       mPlants.desiredSellPrice !== 'MP' ||
  //       mPlants.desiredSellAmount !== 'MAX'
  //     ) {
  //       loopReturn = { phase: 1, stage: 6 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][7] Staff EnergyMorale > 95%
  //   CITIES.forEach((city: any) => {
  //     const o = c.getOffice(farmName, city);
  //     if (
  //       o.avgEnergy < 0.95 * o.maxEnergy ||
  //       o.avgMorale < 0.95 * o.maxMorale
  //     ) {
  //       loopReturn = { phase: 1, stage: 7 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][8] Upgrade each city's warehouse twice
  //   CITIES.forEach((city: any) => {
  //     const w = c.getWarehouse(farmName, city);
  //     if (w.size < 300) {
  //       loopReturn = { phase: 1, stage: 8 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][9] Buy 2 of each: FocusWires, Neural Accelerators, Speech Processor Implants, Nuoptimal Nootropic Injector Implants and Smart Factories
  //   UPGRADES.slice(0, 5).forEach((u: any) => {
  //     if (c.getUpgradeLevel(u) < 2) {
  //       loopReturn = { phase: 1, stage: 9 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][10] Staff EnergyMorale > 95%
  //   CITIES.forEach((city: any) => {
  //     const o = c.getOffice(farmName, city);
  //     if (
  //       o.avgEnergy < 0.95 * o.maxEnergy ||
  //       o.avgMorale < 0.95 * o.maxMorale
  //     ) {
  //       loopReturn = { phase: 1, stage: 10 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][11] Materials - Hardware +125 @ 12.5/s [125]
  //   CITIES.forEach((city: any) => {
  //     const mHardware = c.getMaterial(farmName, city, BOOST[0]);
  //     if (mHardware.stored < 125) {
  //       loopReturn = { phase: 1, stage: 11 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][12] Materials - AI Cores +75 @ 7.5/s [75]
  //   CITIES.forEach((city: any) => {
  //     const mAI = c.getMaterial(farmName, city, BOOST[2]);
  //     if (mAI.stored < 75) {
  //       loopReturn = { phase: 1, stage: 12 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][13] Materials - Real Estate +27,000 @ 2700.0/s [27,000]
  //   CITIES.forEach((city: any) => {
  //     const mReal = c.getMaterial(farmName, city, BOOST[3]);
  //     if (mReal.stored < 27000) {
  //       loopReturn = { phase: 1, stage: 13 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][14] 1st investor round ~ 210b
  //   if (c.getCorporation().numShares / c.getCorporation().totalShares === 1) {
  //     return { phase: 1, stage: 14 };
  //   }

  //   // [1][15] Upgrade each office to size of 9 and set them to 1 Ops, 1 Eng, 1 Bus, 1 Man, 5 R&D
  //   CITIES.forEach((city: any) => {
  //     const o = c.getOffice(farmName, city);
  //     if (
  //       o.numEmployees < 9 ||
  //       o.employeeJobs.Operations < 1 ||
  //       o.employeeJobs.Engineer < 1 ||
  //       o.employeeJobs.Business < 1 ||
  //       o.employeeJobs.Management < 1 ||
  //       o.employeeJobs['Research & Development'] < 5
  //     ) {
  //       loopReturn = { phase: 1, stage: 15 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][16] Upgrade Smart Factories and Smart Storage to level 10
  //   if (c.getUpgradeLevel(UPGRADES[4]) < 10) {
  //     return { phase: 1, stage: 16 };
  //   }
  //   if (c.getUpgradeLevel(UPGRADES[5]) < 10) {
  //     return { phase: 1, stage: 17 };
  //   }

  //   // [1][18] Upgrade each warehouse 7 times (should end up with 2 000 storage)
  //   CITIES.forEach((city: any) => {
  //     const w = c.getWarehouse(farmName, city);
  //     if (w.size < 2000) {
  //       loopReturn = { phase: 1, stage: 18 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][19] Staff EnergyMorale > 95%
  //   CITIES.forEach((city: any) => {
  //     const o = c.getOffice(farmName, city);
  //     if (
  //       o.avgEnergy < 0.95 * o.maxEnergy ||
  //       o.avgMorale < 0.95 * o.maxMorale
  //     ) {
  //       loopReturn = { phase: 1, stage: 19 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][20] Materials - Hardware +2675 @ 267.5/s [2,800]
  //   CITIES.forEach((city: any) => {
  //     const mHardware = c.getMaterial(farmName, city, BOOST[0]);
  //     if (mHardware.stored < 2800) {
  //       loopReturn = { phase: 1, stage: 20 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][21] Materials - Robots +96 @ 9.6/s [96]
  //   CITIES.forEach((city: any) => {
  //     const mRobots = c.getMaterial(farmName, city, BOOST[1]);
  //     if (mRobots.stored < 96) {
  //       loopReturn = { phase: 1, stage: 21 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][22] Materials - AI Cores +2445 @ 244.5/s [2,520]
  //   CITIES.forEach((city: any) => {
  //     const mAI = c.getMaterial(farmName, city, BOOST[2]);
  //     if (mAI.stored < 2520) {
  //       loopReturn = { phase: 1, stage: 22 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][23] Materials - Real Estate +119,400 @ 11940.0/s [146,400]
  //   CITIES.forEach((city: any) => {
  //     const mReal = c.getMaterial(farmName, city, BOOST[3]);
  //     if (mReal.stored < 146400) {
  //       loopReturn = { phase: 1, stage: 23 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][24] Redistribute the employees 3 Ops, 2 Eng, 2 Bus, 2 Man
  //   CITIES.forEach((city: any) => {
  //     const o = c.getOffice(farmName, city);
  //     if (
  //       o.numEmployees < 9 ||
  //       o.employeeJobs.Operations < 3 ||
  //       o.employeeJobs.Engineer < 2 ||
  //       o.employeeJobs.Business < 2 ||
  //       o.employeeJobs.Management < 2 ||
  //       o.employeeJobs['Research & Development'] > 0
  //     ) {
  //       loopReturn = { phase: 1, stage: 24 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // TODO:[1][25] Accept 2nd investor Offer, should be about 5t
  //   if (c.getCorporation().numShares / c.getCorporation().totalShares >= 0.6) {
  //     return { phase: 1, stage: 25 };
  //   }

  //   // TODO:[1][26] Upgrade each warehouse 9 more time (should end up with 3 800 storage)
  //   CITIES.forEach((city: any) => {
  //     const w = c.getWarehouse(farmName, city);
  //     if (w.size < 3800) {
  //       loopReturn = { phase: 1, stage: 26 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // TODO:[1][27] Materials - Hardware +6500 @ 650.0/s [9,300]
  //   CITIES.forEach((city: any) => {
  //     const mHardware = c.getMaterial(farmName, city, BOOST[0]);
  //     if (mHardware.stored < 9300) {
  //       loopReturn = { phase: 1, stage: 27 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // TODO:[1][28] Materials - Robots +630 @ 63.0/s [726]
  //   CITIES.forEach((city: any) => {
  //     const mRobots = c.getMaterial(farmName, city, BOOST[1]);
  //     if (mRobots.stored < 726) {
  //       loopReturn = { phase: 1, stage: 28 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // TODO:[1][29] Materials - AI Cores +3750 @ 375.0/s [6,270]
  //   CITIES.forEach((city: any) => {
  //     const mAI = c.getMaterial(farmName, city, BOOST[2]);
  //     if (mAI.stored < 6270) {
  //       loopReturn = { phase: 1, stage: 29 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // TODO:[1][30] Materials - Real Estate +84,000 @ 8400.0/s [230,400]
  //   CITIES.forEach((city: any) => {
  //     const mReal = c.getMaterial(farmName, city, BOOST[3]);
  //     if (mReal.stored < 230400) {
  //       loopReturn = { phase: 1, stage: 30 };
  //       pass = false;
  //     }
  //   });
  //   if (!pass) return loopReturn;

  //   // [1][x] Don't touch Agriculture again.
  //   loopReturn = { phase: 2, stage: 0 };

  //   // ******** Phase 2 Tobacco
  //   return { phase: 2, stage: 0 };

  //   // ******** Phase 3 Public
  //   // return loopReturn;
  // }
}

// sample = {
//   name: 'cosy-co',
//   funds: 43526219857.599236,
//   revenue: 1009707.033696463,
//   expenses: 320519.2585703832,
//   public: false,
//   totalShares: 1500000000,
//   numShares: 900000000,
//   shareSaleCooldown: 0,
//   investorShares: 600000000,
//   issuedShares: 0,
//   issueNewSharesCooldown: 0,
//   sharePrice: 165.13134428113378,
//   dividendRate: 0,
//   dividendTax: 0.15,
//   dividendEarnings: 0,
//   nextState: 'EXPORT',
//   prevState: 'PRODUCTION',
//   divisions: ['Agrico'],
//   state: 'EXPORT',
// };
