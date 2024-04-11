/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { CITIES, UPGRADES, BOOST } from '/os/data/constants';
/* eslint-enable */

const { cName, fName, farm } = CORP;
let waitCycles = 0;

// ******** Shared functions
function checkEnergyMorale(ns: NS): boolean {
  let pass = true;
  CITIES.forEach((city: any) => {
    const o = ns.corporation.getOffice(fName, city);
    if (o.avgEnergy < 0.95 * o.maxEnergy || o.avgMorale < 0.95 * o.maxMorale) {
      pass = false;
    }
  });
  if (pass) return true;
  return false;
}

function checkOfficeAssignments(ns: NS, e: number, d: number[]): boolean {
  let pass = true;
  CITIES.forEach((city: any) => {
    const o = ns.corporation.getOffice(fName, city);
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

function actionOfficeAssignments(ns: NS, e: number, d: number[]) {
  CITIES.forEach((city: any) => {
    const c = ns.corporation;
    const o = c.getOffice(fName, city);
    if (e > o.size) {
      const price = c.getOfficeSizeUpgradeCost(fName, city, e - o.size);
      if (c.getCorporation().funds > price) {
        c.upgradeOfficeSize(fName, city, e - o.size);
      }
    }

    let h = e - o.numEmployees;
    while (h > 0 && e <= o.size) {
      c.hireEmployee(fName, city);
      h -= 1;
    }
    if (o.numEmployees === e) {
      if (o.employeeJobs.Unassigned === 0) {
        // Clear assignments
        c.setAutoJobAssignment(fName, city, 'Intern', 0);
        c.setAutoJobAssignment(fName, city, 'Research & Development', 0);
        c.setAutoJobAssignment(fName, city, 'Management', 0);
        c.setAutoJobAssignment(fName, city, 'Business', d[2]);
        c.setAutoJobAssignment(fName, city, 'Engineer', d[1]);
        c.setAutoJobAssignment(fName, city, 'Operations', d[0]);
      }
      c.setAutoJobAssignment(fName, city, 'Operations', d[0]);
      c.setAutoJobAssignment(fName, city, 'Engineer', d[1]);
      c.setAutoJobAssignment(fName, city, 'Business', d[2]);
      c.setAutoJobAssignment(fName, city, 'Management', d[3]);
      c.setAutoJobAssignment(fName, city, 'Research & Development', d[4]);
      c.setAutoJobAssignment(fName, city, 'Intern', d[5]);
      c.setAutoJobAssignment(fName, city, 'Unassigned', d[6]);
    }
  });
}

function checkWarehouse(ns: NS, storage: number): boolean {
  let pass = true;
  CITIES.forEach((city: any) => {
    const w = ns.corporation.getWarehouse(fName, city);
    if (w.size < storage) {
      pass = false;
    }
  });
  if (pass) return true;
  return false;
}

function actionWarehouse(ns: NS, storage: number, bulk = 1) {
  CITIES.forEach((city: any) => {
    const w = ns.corporation.getWarehouse(fName, city);
    const cost = ns.corporation.getUpgradeWarehouseCost(fName, city, bulk);
    if (w.size < storage && ns.corporation.getCorporation().funds > cost) {
      ns.print(`[Upgrade Warehouse x ${bulk}] ${city}`);
      ns.corporation.upgradeWarehouse(fName, city, bulk);
    }
  });
}

function checkBoostMaterials(ns: NS, s: number): boolean {
  let pass = true;

  CITIES.forEach((city: any) => {
    BOOST.forEach((material: any) => {
      const m = ns.corporation.getMaterial(fName, city, material);
      if (m.stored < farm.boost[material][s]) {
        pass = false;
      } else {
        // Clear it after the check
        ns.corporation.buyMaterial(fName, city, material, 0);
      }
    });
  });
  if (pass) return true;
  return false;
}

function actionBoostMaterials(ns: NS, s: number): boolean {
  if (waitCycles === 0) {
    CITIES.forEach((city: any) => {
      BOOST.forEach((m: any) => {
        ns.corporation.buyMaterial(fName, city, m, farm.boost[m][s] / 10);
      });
    });
  }
  waitCycles += 1;
  if (waitCycles >= 10) {
    waitCycles = 0;
    return true;
  }
  return false;
}

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
        ns.print(`:: We have offices in 6 cities`);
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
          ns.print(`:: We have a warehouse ${city} (Smart Supply enabled)`);
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
  // { // TODO: FIXME: NEXT
  //   // [1][4] Employees
  //   check(ns: NS): boolean {
  //     return checkOfficeAssignments(ns, farm.hires[0], farm.roles[0]);
  //   },
  //   action(ns: NS): number {
  //     actionOfficeAssignments(ns, farm.hires[0], farm.roles[0]);
  //     return 4;
  //   },
  // },
  // {
  //   // [1][5] Buy 1 advert
  //   check(ns: NS): boolean {
  //     const c = ns.corporation;
  //     if (c.getHireAdVertCount(fName) >= 1) return true;
  //     return false;
  //   },
  //   action(ns: NS): number {
  //     const c = ns.corporation;
  //     if (c.getCorporation().funds > c.getHireAdVertCost(fName)) {
  //       c.hireAdVert(fName);
  //     }
  //     return 5;
  //   },
  // },
  // {
  //   // [1][6] Set produced materials to be sold
  //   check(ns: NS): boolean {
  //     let pass = true;
  //     CITIES.forEach((city: any) => {
  //       const mFood = ns.corporation.getMaterial(fName, city, 'Food');
  //       const mPlants = ns.corporation.getMaterial(fName, city, 'Plants');
  //       if (
  //         mFood.desiredSellPrice !== 'MP' ||
  //         mFood.desiredSellAmount !== 'MAX' ||
  //         mPlants.desiredSellPrice !== 'MP' ||
  //         mPlants.desiredSellAmount !== 'MAX'
  //       ) {
  //         pass = false;
  //       }
  //     });
  //     if (pass) return true;
  //     return false;
  //   },
  //   action(ns: NS): number {
  //     CITIES.forEach((city: any) => {
  //       ns.corporation.sellMaterial(fName, city, 'Plants', 'MAX', 'MP');
  //       ns.corporation.sellMaterial(fName, city, 'Food', 'MAX', 'MP');
  //     });
  //     return 6;
  //   },
  // },
  // {
  //   // [1][7] Staff EnergyMorale > 95%
  //   check(ns: NS): boolean {
  //     return checkEnergyMorale(ns);
  //   },
  //   action(ns: NS): number {
  //     return 7;
  //   },
  // },
  // {
  //   // [1][8] Upgrade each city's warehouse twice (300)
  //   check(ns: NS) {
  //     return checkWarehouse(ns, farm.warehouse[1]);
  //   },
  //   action(ns: NS): number {
  //     actionWarehouse(ns, farm.warehouse[1], 2);
  //     return 8;
  //   },
  // },
  // {
  //   // [1][9] Buy 2 of each first 5 upgrades (FW, NA, SPI, NNII, SF)
  //   check(ns: NS) {
  //     // return checkWarehouse(ns, farm.warehouse[1]);
  //     let pass = true;
  //     UPGRADES.slice(0, 5).forEach((u: any) => {
  //       if (ns.corporation.getUpgradeLevel(u) < 2) {
  //         pass = false;
  //       }
  //     });
  //     if (pass) return true;
  //     return false;
  //   },
  //   action(ns: NS): number {
  //     const c = ns.corporation;
  //     // Upgrade to 2
  //     for (let i = 0; i < 2; i += 1) {
  //       UPGRADES.slice(0, 5).forEach((u: any) => {
  //         const { funds } = c.getCorporation();
  //         if (
  //           c.getUpgradeLevel(u) < i + 1 &&
  //           funds > c.getUpgradeLevelCost(u)
  //         ) {
  //           c.levelUpgrade(u);
  //           ns.print(`[Upgraded] ${u} to ${i + 1}`);
  //         }
  //       });
  //     }
  //     return 9;
  //   },
  // },
  // {
  //   // [1][10] Staff EnergyMorale > 95%
  //   check(ns: NS): boolean {
  //     return checkEnergyMorale(ns);
  //   },
  //   action(ns: NS): number {
  //     return 10;
  //   },
  // },
  // {
  //   // [1][11] Get Materials
  //   check(ns: NS) {
  //     return checkBoostMaterials(ns, 0);
  //   },
  //   action(ns: NS): number {
  //     if (!actionBoostMaterials(ns, 0)) {
  //       ns.print(`[Waiting] ${waitCycles} cycles`);
  //     }
  //     return 11;
  //   },
  // },
  // {
  //   // [1][14] 1st investor round ~ 210b
  //   // FIXME: INVESTOR ROUND 1 (100 -> 60%)
  //   check(ns: NS) {
  //     // return checkBoostMaterials(ns, 0);
  //     // if (c.getCorporation().numShares / c.getCorporation().totalShares === 1) {
  //     //   return { phase: 1, stage: 14 };
  //     // }
  //     return true;
  //   },
  //   action(ns: NS): number {
  //     // if (!actionBoostMaterials(ns, 0)) {
  //     //   ns.print(`[Waiting] ${waitCycles} cycles`);
  //     // }
  //     return 12;
  //   },
  // },
  // {
  //   // [1][13] Upgrade each office to size of 9 and set them to 1 Ops, 1 Eng, 1 Bus, 1 Man, 5 R&D
  //   check(ns: NS): boolean {
  //     return checkOfficeAssignments(ns, farm.hires[1], farm.roles[1]);
  //   },
  //   action(ns: NS): number {
  //     actionOfficeAssignments(ns, farm.hires[1], farm.roles[1]);
  //     return 13;
  //   },
  // },
  // {
  //   // [1][14] Upgrade Smart Factories and Smart Storage to level 10
  //   check(ns: NS) {
  //     let pass = true;
  //     // TODO: Upgrade to 10
  //     const upgrades = [UPGRADES[4], UPGRADES[5]];
  //     upgrades.forEach((u: any) => {
  //       if (ns.corporation.getUpgradeLevel(u) < 10) {
  //         pass = false;
  //       }
  //     });
  //     if (pass) return true;
  //     return false;
  //   },
  //   action(ns: NS): number {
  //     const c = ns.corporation;
  //     const upgrades = [UPGRADES[4], UPGRADES[5]];
  //     // Upgrade to 10
  //     for (let i = 0; i < 10; i += 1) {
  //       const pass = upgrades.every(function (u: any) {
  //         const { funds } = c.getCorporation();
  //         const price = c.getUpgradeLevelCost(u);
  //         if (c.getUpgradeLevel(u) < i + 1 && funds > price) {
  //           c.levelUpgrade(u);
  //           ns.tprint(`[Upgraded] ${u} to ${i + 1}`);
  //         } else {
  //           ns.print(`[No Funds] ${i + 1} ${u} Need ${price - funds}`);
  //           return false; // Breaks it
  //         }
  //         return true;
  //       });
  //       if (!pass) {
  //         break;
  //       }
  //     }
  //     return 14;
  //   },
  // },
];

export function corpLogicPhase1(ns: NS, _stage = 0): any {
  // ******** Phase 1
  const phase = 1;
  let stage = _stage;

  ns.print(`[Phase 1] Agriculture`);
  if (stage <= phase1.length - 1) {
    stage = !phase1[stage].step(ns) ? stage : (stage += 1);
  } else {
    ns.print(`We are at Stage: ${stage}`);
  }

  // TODO: Completed phase
  // if (stage >= 30) {
  //   phase += 1;
  //   stage = 0;
  // }
  return { phase, stage };
}

// ******** DEBUG UNDER HERE ********

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
