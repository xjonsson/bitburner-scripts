/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { CITIES } from '/os/data/constants';
/* eslint-enable */

const { corpName, farmName } = CORP;

// ******** Shared functions
// const d = [
//   1, // d[0] Operations
//   1, // d[1] Engineer
//   1, // d[2] Business
//   0, // d[3] Management
//   0, // d[4] Research & Development
//   0, // d[5] Intern
//   0, // d[6] "Unassigned"
// ];

function checkOfficeAssignments(ns: NS, e: number, d: number[]): boolean {
  let pass = true;
  CITIES.forEach((city: any) => {
    const o = ns.corporation.getOffice(farmName, city);
    if (
      o.numEmployees !== e ||
      o.employeeJobs.Operations !== d[0] ||
      o.employeeJobs.Engineer !== d[1] ||
      o.employeeJobs.Business !== d[2] ||
      o.employeeJobs.Management !== d[3] ||
      o.employeeJobs['Research & Development'] !== d[4] ||
      o.employeeJobs.Intern !== d[5] ||
      o.employeeJobs.Unassigned !== d[6]
    ) {
      // ns.print(`Fix: ${city}`);
      pass = false;
    }
  });
  if (pass) return true;
  return false;
}

function actionOfficeAssignments(ns: NS, e: number, d: number[]): boolean {
  let pass = true;
  CITIES.forEach((city: any) => {
    const n = ns.corporation;
    const o = n.getOffice(farmName, city);
    let h = e - o.numEmployees;
    while (h > 0 && e <= o.size) {
      n.hireEmployee(farmName, city);
      h -= 1;
    }
    if (o.numEmployees !== e) {
      pass = false;
    } else if (o.numEmployees === e) {
      n.setAutoJobAssignment(farmName, city, 'Operations', d[0]);
      n.setAutoJobAssignment(farmName, city, 'Engineer', d[1]);
      n.setAutoJobAssignment(farmName, city, 'Business', d[2]);
      n.setAutoJobAssignment(farmName, city, 'Management', d[3]);
      n.setAutoJobAssignment(farmName, city, 'Research & Development', d[4]);
      n.setAutoJobAssignment(farmName, city, 'Intern', d[5]);
      n.setAutoJobAssignment(farmName, city, 'Unassigned', d[6]);
    }
  });
  if (pass) return true;
  return false;
}

const phase1 = [
  {
    // [1][0] Buy Smart Supply
    check(ns: NS) {
      if (ns.corporation.hasUnlock('Smart Supply')) return true;
      return false;
    },
    action(ns: NS) {
      const c = ns.corporation;
      if (c.getCorporation().funds > c.getUnlockCost('Smart Supply')) {
        c.purchaseUnlock('Smart Supply');
      }
      return 0;
    },
  },
  {
    // [1][1] Expand to Agriculture
    check(ns: NS) {
      if (ns.corporation.getCorporation().divisions.length > 0) return true;
      return false;
    },
    action(ns: NS) {
      ns.corporation.expandIndustry('Agriculture', farmName);
      return 0;
    },
  },
  {
    // [1][2] Expand to all cities in Agriculture (Warehouses 3 employees, 1 Ops, 1 Eng, 1 Business
    check(ns: NS) {
      if (ns.corporation.getDivision(farmName).cities.length === 6) return true;
      return false;
    },
    action(ns: NS) {
      const c = ns.corporation;
      const { cities } = c.getDivision(farmName);
      CITIES.filter((n: any) => !cities.includes(n)).forEach((city: any) => {
        if (city !== CITIES[0]) {
          if (c.getCorporation().funds > 4e9) {
            c.expandCity(farmName, city);
          }
        }
      });
      return 0;
    },
  },
  {
    // [1][3] Warehouses
    check(ns: NS) {
      const c = ns.corporation;
      let pass = true;
      CITIES.forEach((city: any) => {
        if (!c.hasWarehouse(farmName, city)) {
          pass = false;
        } else if (!c.getWarehouse(farmName, city).smartSupplyEnabled) {
          pass = false;
        }
      });
      if (pass) return true;
      return false;
    },
    action(ns: NS) {
      const c = ns.corporation;
      // const { cities } = c.getDivision(farmName);
      CITIES.filter((n: any) => !c.hasWarehouse(farmName, n)).forEach(
        (city: any) => {
          if (c.getCorporation().funds > 5e9) {
            c.purchaseWarehouse(farmName, city);
            if (c.hasWarehouse(farmName, city)) {
              c.setSmartSupply(farmName, city, true);
            }
          }
        }
      );
      return 0;
    },
  },
  {
    // [1][4] Employees
    check(ns: NS) {
      const e = 3;
      // Pointer 0, 1, 2, 3, 4, 5, 6
      // Office  O, E, B, M, R, I, U
      const d = [1, 1, 1, 0, 0, 0, 0];
      return checkOfficeAssignments(ns, e, d);
    },
    action(ns: NS) {
      const e = 3;
      // Pointer 0, 1, 2, 3, 4, 5, 6
      // Office  O, E, B, M, R, I, U
      const d = [1, 1, 1, 0, 0, 0, 0];
      actionOfficeAssignments(ns, e, d);
      return 0;
    },
  },
  {
    // [1][5] Buy 1 advert
    check(ns: NS) {
      const c = ns.corporation;
      if (c.getHireAdVertCount(farmName) >= 1) return true;
      return false;
    },
    action(ns: NS) {
      const c = ns.corporation;
      if (c.getCorporation().funds > c.getHireAdVertCost(farmName)) {
        c.hireAdVert(farmName);
      }
      return 0;
    },
  },
  {
    // [1][6] Set produced materials to be sold
    check(ns: NS) {
      const c = ns.corporation;
      let pass = true;
      CITIES.forEach((city: any) => {
        const mFood = c.getMaterial(farmName, city, 'Food');
        const mPlants = c.getMaterial(farmName, city, 'Plants');
        if (
          mFood.desiredSellPrice !== 'MP' ||
          mFood.desiredSellAmount !== 'MAX' ||
          mPlants.desiredSellPrice !== 'MP' ||
          mPlants.desiredSellAmount !== 'MAX'
        ) {
          pass = false;
        }
      });
      if (pass) return true;
      return false;
    },
    action(ns: NS) {
      const c = ns.corporation;
      CITIES.forEach((city: any) => {
        c.sellMaterial(farmName, city, 'Plants', 'MAX', 'MP');
        c.sellMaterial(farmName, city, 'Food', 'MAX', 'MP');
      });
      return 0;
    },
  },
];

export function corpLogicPhase1(ns: NS): any {
  // ******** Phase 1
  let phase = 1;
  let stage = 0;

  // [1][0] Buy Smart Supply
  stage = !phase1[0].check(ns) ? phase1[0].action(ns) : (stage += 1);
  // [1][1] Expand to Agriculture
  stage = !phase1[1].check(ns) ? phase1[1].action(ns) : (stage += 1);
  // [1][2] Expand to all cities in Agriculture (Warehouses 3 employees, 1 Ops, 1 Eng, 1 Business
  stage = !phase1[2].check(ns) ? phase1[2].action(ns) : (stage += 1);
  // [1][3] Warehouses
  stage = !phase1[3].check(ns) ? phase1[3].action(ns) : (stage += 1);
  // [1][4] Employees
  stage = !phase1[4].check(ns) ? phase1[4].action(ns) : (stage += 1);
  // [1][5] Buy 1 advert
  stage = !phase1[5].check(ns) ? phase1[5].action(ns) : (stage += 1);
  // [1][6] Set produced materials to be sold
  stage = !phase1[6].check(ns) ? phase1[6].action(ns) : (stage += 1);

  // Completed phase
  if (stage >= 30) {
    phase += 1;
    stage = 0;
  }
  return { phase, stage };
}

// // [1][7] Staff EnergyMorale > 95%
// CITIES.forEach((city: any) => {
//   const o = c.getOffice(farmName, city);
//   if (
//     o.avgEnergy < 0.95 * o.maxEnergy ||
//     o.avgMorale < 0.95 * o.maxMorale
//   ) {
//     loopReturn = { phase: 1, stage: 7 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][8] Upgrade each city's warehouse twice
// CITIES.forEach((city: any) => {
//   const w = c.getWarehouse(farmName, city);
//   if (w.size < 300) {
//     loopReturn = { phase: 1, stage: 8 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][9] Buy 2 of each: FocusWires, Neural Accelerators, Speech Processor Implants, Nuoptimal Nootropic Injector Implants and Smart Factories
// UPGRADES.slice(0, 5).forEach((u: any) => {
//   if (c.getUpgradeLevel(u) < 2) {
//     loopReturn = { phase: 1, stage: 9 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][10] Staff EnergyMorale > 95%
// CITIES.forEach((city: any) => {
//   const o = c.getOffice(farmName, city);
//   if (
//     o.avgEnergy < 0.95 * o.maxEnergy ||
//     o.avgMorale < 0.95 * o.maxMorale
//   ) {
//     loopReturn = { phase: 1, stage: 10 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][11] Materials - Hardware +125 @ 12.5/s [125]
// CITIES.forEach((city: any) => {
//   const mHardware = c.getMaterial(farmName, city, BOOST[0]);
//   if (mHardware.stored < 125) {
//     loopReturn = { phase: 1, stage: 11 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][12] Materials - AI Cores +75 @ 7.5/s [75]
// CITIES.forEach((city: any) => {
//   const mAI = c.getMaterial(farmName, city, BOOST[2]);
//   if (mAI.stored < 75) {
//     loopReturn = { phase: 1, stage: 12 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][13] Materials - Real Estate +27,000 @ 2700.0/s [27,000]
// CITIES.forEach((city: any) => {
//   const mReal = c.getMaterial(farmName, city, BOOST[3]);
//   if (mReal.stored < 27000) {
//     loopReturn = { phase: 1, stage: 13 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][14] 1st investor round ~ 210b
// if (c.getCorporation().numShares / c.getCorporation().totalShares === 1) {
//   return { phase: 1, stage: 14 };
// }

// // [1][15] Upgrade each office to size of 9 and set them to 1 Ops, 1 Eng, 1 Bus, 1 Man, 5 R&D
// CITIES.forEach((city: any) => {
//   const o = c.getOffice(farmName, city);
//   if (
//     o.numEmployees < 9 ||
//     o.employeeJobs.Operations < 1 ||
//     o.employeeJobs.Engineer < 1 ||
//     o.employeeJobs.Business < 1 ||
//     o.employeeJobs.Management < 1 ||
//     o.employeeJobs['Research & Development'] < 5
//   ) {
//     loopReturn = { phase: 1, stage: 15 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][16] Upgrade Smart Factories and Smart Storage to level 10
// if (c.getUpgradeLevel(UPGRADES[4]) < 10) {
//   return { phase: 1, stage: 16 };
// }
// if (c.getUpgradeLevel(UPGRADES[5]) < 10) {
//   return { phase: 1, stage: 17 };
// }

// // [1][18] Upgrade each warehouse 7 times (should end up with 2 000 storage)
// CITIES.forEach((city: any) => {
//   const w = c.getWarehouse(farmName, city);
//   if (w.size < 2000) {
//     loopReturn = { phase: 1, stage: 18 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][19] Staff EnergyMorale > 95%
// CITIES.forEach((city: any) => {
//   const o = c.getOffice(farmName, city);
//   if (
//     o.avgEnergy < 0.95 * o.maxEnergy ||
//     o.avgMorale < 0.95 * o.maxMorale
//   ) {
//     loopReturn = { phase: 1, stage: 19 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][20] Materials - Hardware +2675 @ 267.5/s [2,800]
// CITIES.forEach((city: any) => {
//   const mHardware = c.getMaterial(farmName, city, BOOST[0]);
//   if (mHardware.stored < 2800) {
//     loopReturn = { phase: 1, stage: 20 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][21] Materials - Robots +96 @ 9.6/s [96]
// CITIES.forEach((city: any) => {
//   const mRobots = c.getMaterial(farmName, city, BOOST[1]);
//   if (mRobots.stored < 96) {
//     loopReturn = { phase: 1, stage: 21 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][22] Materials - AI Cores +2445 @ 244.5/s [2,520]
// CITIES.forEach((city: any) => {
//   const mAI = c.getMaterial(farmName, city, BOOST[2]);
//   if (mAI.stored < 2520) {
//     loopReturn = { phase: 1, stage: 22 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][23] Materials - Real Estate +119,400 @ 11940.0/s [146,400]
// CITIES.forEach((city: any) => {
//   const mReal = c.getMaterial(farmName, city, BOOST[3]);
//   if (mReal.stored < 146400) {
//     loopReturn = { phase: 1, stage: 23 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // [1][24] Redistribute the employees 3 Ops, 2 Eng, 2 Bus, 2 Man
// CITIES.forEach((city: any) => {
//   const o = c.getOffice(farmName, city);
//   if (
//     o.numEmployees < 9 ||
//     o.employeeJobs.Operations < 3 ||
//     o.employeeJobs.Engineer < 2 ||
//     o.employeeJobs.Business < 2 ||
//     o.employeeJobs.Management < 2 ||
//     o.employeeJobs['Research & Development'] > 0
//   ) {
//     loopReturn = { phase: 1, stage: 24 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // TODO:[1][25] Accept 2nd investor Offer, should be about 5t
// if (c.getCorporation().numShares / c.getCorporation().totalShares >= 0.6) {
//   return { phase: 1, stage: 25 };
// }

// // TODO:[1][26] Upgrade each warehouse 9 more time (should end up with 3 800 storage)
// CITIES.forEach((city: any) => {
//   const w = c.getWarehouse(farmName, city);
//   if (w.size < 3800) {
//     loopReturn = { phase: 1, stage: 26 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // TODO:[1][27] Materials - Hardware +6500 @ 650.0/s [9,300]
// CITIES.forEach((city: any) => {
//   const mHardware = c.getMaterial(farmName, city, BOOST[0]);
//   if (mHardware.stored < 9300) {
//     loopReturn = { phase: 1, stage: 27 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // TODO:[1][28] Materials - Robots +630 @ 63.0/s [726]
// CITIES.forEach((city: any) => {
//   const mRobots = c.getMaterial(farmName, city, BOOST[1]);
//   if (mRobots.stored < 726) {
//     loopReturn = { phase: 1, stage: 28 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // TODO:[1][29] Materials - AI Cores +3750 @ 375.0/s [6,270]
// CITIES.forEach((city: any) => {
//   const mAI = c.getMaterial(farmName, city, BOOST[2]);
//   if (mAI.stored < 6270) {
//     loopReturn = { phase: 1, stage: 29 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;

// // TODO:[1][30] Materials - Real Estate +84,000 @ 8400.0/s [230,400]
// CITIES.forEach((city: any) => {
//   const mReal = c.getMaterial(farmName, city, BOOST[3]);
//   if (mReal.stored < 230400) {
//     loopReturn = { phase: 1, stage: 30 };
//     pass = false;
//   }
// });
// if (!pass) return loopReturn;
