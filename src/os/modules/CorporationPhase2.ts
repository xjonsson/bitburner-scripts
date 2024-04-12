/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import { CITIES, UPGRADES, BOOST } from '/os/data/constants';
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

const { cName, sName, iRounds, smoke } = CORP;
const { pPrefix, pVerson, pInvestment, dCity } = smoke;
const dMultiplier = 1;

// ******** ENUM SAMPLE - DELETE LATER
const sUPGRADES = [
  'FocusWires', // 0
  'Neural Accelerators', // 1
  'Speech Processor Implants', // 2
  'Nuoptimal Nootropic Injector Implants', // 3
  'Smart Factories', // 4
  'Smart Storage', // 5
  'DreamSense', // 6
  'Wilson Analytics', // 7
  'ABC SalesBots', // 8
  'Project Insight', // 9
];

// ******** Phase 2 - Tobacco Steps
const phase2 = [
  // {
  //   // NOTE: [2][X] WHAT TO DO
  //   step(ns: NS, corp: Corporation): boolean {
  //     const c = ns.corporation;
  //     ns.print('Step X');
  //     corp.wait = 5;
  //     return false;
  //   },
  // },
  {
    // [2][0] Expand into Tobacco
    step(ns: NS, corp: Corporation): boolean {
      const c = ns.corporation;
      const divs = c.getCorporation().divisions;
      if (divs.length > 1 && divs.includes(sName)) {
        ns.print(`:: We have ${sName}`);
        return true;
      }

      const { funds } = c.getCorporation();
      if (funds > 20e9) {
        ns.print(`[Expanding] Tobacco (${sName})`);
        c.expandIndustry('Tobacco', sName);
        return false;
      }
      ns.print(`[Funds] Need (${ns.formatNumber(20e9 - funds, 1)})`);
      return false;
    },
  },
  {
    // [2][1] Expand to Aevum (Dev city)
    step(ns: NS): boolean {
      const c = ns.corporation;
      if (c.getDivision(sName).cities.includes(smoke.dCity)) {
        ns.print(`:: We an office in (${smoke.dCity})`);
        return true;
      }

      const { funds } = c.getCorporation();
      if (funds > 4e9) {
        ns.print(`[Expanding] Opening ${smoke.dCity}`);
        c.expandCity(sName, smoke.dCity);
        return false;
      }
      ns.print(`[Funds] Need ${ns.formatNumber(4e9 - funds, 1)}`);
      return false;
    },
  },
  {
    // [2][2] Hire 30 people in Aevum [8, 9, 5, 8, 0, 0, 0]
    step(ns: NS): boolean {
      const e = smoke.hires[0];
      const d = smoke.roles[0];
      return dOfficeAssignments(ns, sName, [smoke.dCity], e, d);
    },
  },
  {
    // [2][3] Expand to all other cities
    step(ns: NS): boolean {
      const c = ns.corporation;
      if (c.getDivision(sName).cities.length === 6) {
        ns.print(`:: We have offices in all cities`);
        return true;
      }

      const { cities } = c.getDivision(sName);
      CITIES.filter((n: any) => !cities.includes(n)).forEach((city: any) => {
        if (c.getCorporation().funds > 4e9) {
          ns.print(`[Expanding] Opening ${city}`);
          c.expandCity(sName, city);
        }
      });
      return false;
    },
  },
  {
    // [2][4] Hire 9 people in all others [1, 1, 1, 1, 5, 0, 0]
    step(ns: NS): boolean {
      const cities = CITIES.filter((n: any) => n !== smoke.dCity);
      const e = smoke.hires[1];
      const d = smoke.roles[1];
      return dOfficeAssignments(ns, sName, cities, e, d);
    },
  },
  {
    // [2][5] Warehouses
    step(ns: NS): boolean {
      const c = ns.corporation;
      let pass = true;

      CITIES.forEach((city: any) => {
        if (
          c.hasWarehouse(sName, city) &&
          c.getWarehouse(sName, city).smartSupplyEnabled
        ) {
          ns.print(`:: We have a warehouse ${city} (SS On)`);
        } else if (c.getCorporation().funds > 5e9) {
          ns.print(`[Buying] Warehouse ${city}`);
          c.purchaseWarehouse(sName, city);
          if (c.hasWarehouse(sName, city)) {
            ns.print(`:: [Smart supply] Enabled`);
            c.setSmartSupply(sName, city, true);
          }
          pass = false;
        } else if (c.getCorporation().funds < 5e9) {
          ns.print(`[Funds] Cant afford Warehouse ${city}`);
          pass = false;
        }
      });

      return pass;
    },
  },
  {
    // [2][6] Create first product
    step(ns: NS, corp: Corporation): boolean {
      const c = ns.corporation;
      const { funds } = c.getCorporation();
      const { products } = c.getDivision(sName);
      const dVersion = 1;
      const pName = `${pPrefix} ${pVerson}${dVersion}`;

      if (funds > pInvestment * 2 && products.length === 0) {
        // Develop first product
        ns.print(
          `[Product] Develop ${pName} (${ns.formatNumber(pInvestment * 2, 1)})`
        );
        c.makeProduct(sName, dCity, pName, pInvestment, pInvestment);
        return true;
      }
      if (products.length > 0) {
        ns.print(`:: ${pName} exists`);
        return true;
      }

      ns.print(`[Funds] Need ${ns.formatNumber(pInvestment * 2 - funds, 1)}`);
      corp.wait = 5;

      return false;
    },
  },
  {
    // [2][7] Buy DreamSense to level 10-30 (more passive, higher level)
    step(ns: NS, corp: Corporation): boolean {
      return cBuyUpgrades(ns, [UPGRADES[6]], 15, corp);
    },
  },
  {
    // [2][8] Level FW, NA, SPI, NNIJ to 20
    step(ns: NS, corp: Corporation): boolean {
      const u = [UPGRADES[0], UPGRADES[1], UPGRADES[2], UPGRADES[3]];
      return cBuyUpgrades(ns, u, 20, corp);
    },
  },
  {
    // [2][9] Project Insights to lvl 10
    step(ns: NS, corp: Corporation): boolean {
      return cBuyUpgrades(ns, [UPGRADES[9]], 10, corp);
    },
  },
  {
    // [2][10] Grow to 3 products
    step(ns: NS, corp: Corporation): boolean {
      // ns.print(`We are in grow to 3 products mode`);
      const c = ns.corporation;
      const { funds } = c.getCorporation();

      // TODO: Check if all products are selling
      const { products } = c.getDivision(sName);
      products.forEach((n) => {
        const p = c.getProduct(sName, dCity, n);
        if (
          p.developmentProgress === 100 &&
          (p.desiredSellPrice === (0 || null || undefined) ||
            p.desiredSellAmount === (0 || null || undefined))
        ) {
          ns.print(`[Product] ${n} was not selling, set to MAX | MP`);
          c.sellProduct(sName, dCity, n, 'MAX', 'MP', true);
        }

        //   desiredSellPrice: 'MP',
        //   desiredSellAmount: 'MAX',
        // ns.tprint(p); // DEBUG
      });

      // TODO: Check for active developments
      const isComplete = products.every(
        (n) => c.getProduct(sName, dCity, n).developmentProgress === 100
      );

      // TODO: We are not doing anythin
      if (products.length < 3 && isComplete) {
        ns.print(`[Product] We are not developing`);
        const dInvestment = Math.round((funds * 0.01) / 2);
        if (dInvestment * 2 > pInvestment) {
          ns.print(`[Product] Invest ${ns.formatNumber(dInvestment * 2, 1)}`);
          const lVersion = products[products.length - 1].split(pVerson);
          const dVersion = parseInt(lVersion[1]) + 1;
          const pName = `${pPrefix} ${pVerson}${dVersion}`;
          ns.print(pName);

          ns.print(
            `[Product] Develop ${pName} (${ns.formatNumber(
              dInvestment * 2,
              1
            )})`
          );
          c.makeProduct(sName, dCity, pName, pInvestment, pInvestment);
        }
      } else if (!isComplete) {
        const lProduct = products[products.length - 1];
        const lp = c.getProduct(sName, dCity, lProduct);
        ns.print(
          `:: Still developing product ${lProduct} (${lp.developmentProgress.toFixed(
            2
          )}%)`
        );
      }

      // TODO: Upgrade Wilson analytics to lvl 10
      // TODO: Grow Aevum to 60 employees
      // TODO: Check if we are developing / discontinue / create
      // TODO: Buy Hi-Tech R&D Labratory when we have 10k science
      // TODO: Buy TA I & II together (140k science)
      // TODO: Check investory > 800t

      // 1. Always be making products
      // 2. Buy Wilson Analytics wheenver in reach
      // 3. Upgrade Aevum +15 at a time or buy AdVert whichever is cheaper
      // 4. Upgrade size of others but Aevum should be 60 ahead
      // 5. Level any other upgrades if they are cheap
      return false;
    },
  },
  // {
  //   // TODO: [2][6] Create product Product swapper
  //   step(ns: NS, corp: Corporation): boolean {
  //     const c = ns.corporation;
  //     const { funds } = c.getCorporation();
  //     const { pPrefix, pVerson, pInvestment, dCity } = smoke;
  //     const { products } = c.getDivision(sName);

  //     if (funds > pInvestment * 2 && products.length === 0) {
  //       // Develop first product
  //       const dVersion = 1;
  //       const pName = `${pPrefix} ${pVerson}${dVersion}`;
  //       ns.print(
  //         `[Product] Develop ${pName} (${ns.formatNumber(pInvestment * 2, 1)})`
  //       );
  //       c.makeProduct(sName, dCity, pName, pInvestment, pInvestment);
  //     } else if (products.length > 0) {
  //       ns.print(`[Product] Checking...`);
  //       let dName = '';

  //       // Developing test
  //       const isDevelop = products.some((p) => {
  //         if (c.getProduct(sName, dCity, p).developmentProgress < 100) {
  //           dName = p;
  //           return true;
  //         }
  //         return false;
  //       });

  //       // Wait while development finishes
  //       if (isDevelop) {
  //         const dev = c.getProduct(sName, dCity, dName).developmentProgress;
  //         ns.print(`[Product] Still developing ${dName} (${dev.toFixed(2)}%)`);
  //         corp.wait = 5;
  //         return false;
  //       }
  //     } else {
  //       ns.print(`[Funds] Need ${ns.formatNumber(pInvestment * 2 - funds, 1)}`);
  //       corp.wait = 5;
  //     }

  //     return false;
  //   },
  // },
];

export function corpLogicPhase2(ns: NS, _stage = 0, corp: Corporation): any {
  // ******** Phase 2
  const phase = 2;
  let stage = _stage;

  ns.print(`[Phase 2] Tobacco`);
  if (stage <= phase2.length - 1 && corp.wait <= 0) {
    // waitCycles = 0;
    corp.wait = 0;
    stage = !phase2[stage].step(ns, corp) ? stage : (stage += 1);
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

// Product in development
// const sampleGetProduct = {
//   name: 'Snus v1',
//   rating: 0,
//   effectiveRating: 0,
//   stats: {
//     quality: 0,
//     performance: 0,
//     durability: 0,
//     reliability: 0,
//     aesthetics: 0,
//     features: 0,
//   },
//   productionCost: 0,
//   desiredSellPrice: '',
//   desiredSellAmount: 0,
//   stored: 0,
//   productionAmount: 0,
//   actualSellAmount: 0,
//   developmentProgress: 19.91252068629011,
//   advertisingInvestment: 1000000000,
//   designInvestment: 1000000000,
//   size: 0,
// };

// Product developed
// const sampleGetProduct = {
//   name: 'Snus v1',
//   rating: 722.211647006504,
//   effectiveRating: 53.74799147899404,
//   stats: {
//     quality: 785.6293595240363,
//     performance: 879.0520917519485,
//     durability: 572.9490033116169,
//     reliability: 748.7243560574744,
//     aesthetics: 574.8809750425845,
//     features: 846.0551155202202,
//   },
//   productionCost: 14947.319525405383,
//   desiredSellPrice: 'MP',
//   desiredSellAmount: 'MAX',
//   stored: 0,
//   productionAmount: 10.33598061363703,
//   actualSellAmount: 10.33598061363703,
//   developmentProgress: 100,
//   advertisingInvestment: 1000000000,
//   designInvestment: 1000000000,
//   size: 0.05,
// };
