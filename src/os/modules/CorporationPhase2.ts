/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import { CITIES, UPGRADES, RESEARCH, BOOST } from '/os/data/constants';
import {
  cBuyUpgrades,
  cCheckInvestments,
  dBuyAds,
  dEnergyMorale,
  dOfficeAssignments,
  dChangeWarehouse,
  dBoostMaterial,
  dCheckProductsSelling,
  dCheckNoActiveDevelopment,
  dCheckMarketResearch,
  pCalculatePrice,
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
      const { products, researchPoints } = c.getDivision(sName);
      ns.print(`[Products]`);
      ns.print(`:: [Count] ${products.length}`);

      // Check if all products are selling
      const isSelling = dCheckProductsSelling(ns, sName, dCity);
      ns.print(`:: [Selling] ${isSelling}`);

      // Check for active developments
      const isComplete = dCheckNoActiveDevelopment(ns, sName, dCity);
      ns.print(`:: [Development] ${!isComplete}`);

      // Recalculate prices
      ns.print(`:: [Recalculate]`);
      const nProduct = {
        dropName: '',
        dropProfit: 0,
        lastVersion: 0,
      };

      products.forEach((n) => {
        const p = c.getProduct(sName, dCity, n);
        if (p.developmentProgress === 100) {
          const pPrice = pCalculatePrice(ns, sName, dCity, n);
          const pProduced = p.productionAmount;
          const pSold = p.actualSellAmount;
          const pCost = p.productionCost;
          const pProfit = pPrice - pCost;
          const msg =
            `${n} | ` +
            `P:${ns.formatNumber(pProduced, 2)} ` +
            `S:${ns.formatNumber(pSold, 2)} ` +
            `C:${ns.formatNumber(pCost, 2)} ` +
            `O:${ns.formatNumber(pPrice, 2)} ` +
            `+${ns.formatNumber(pProfit, 2)}`;
          c.sellProduct(
            sName,
            dCity,
            n,
            'MAX',
            pPrice.toFixed(2).toString(),
            true
          );
          ns.print(msg);

          // Update drops
          if (nProduct.dropName === '') {
            nProduct.dropName = n;
            nProduct.dropProfit = pProfit;
            nProduct.lastVersion = parseInt(n.split(pVerson)[1]);
          }
          if (pProfit < nProduct.dropProfit) {
            nProduct.dropName = n;
            nProduct.dropProfit = pProfit;
          }
          if (parseInt(n.split(pVerson)[1]) > nProduct.lastVersion) {
            nProduct.lastVersion = parseInt(n.split(pVerson)[1]);
          }
          // ns.tprint(nProduct); // DEBUG
        } else {
          ns.print(
            `${n} | In development (${p.developmentProgress.toFixed(2)}%)`
          );
        }
      });

      // Discontinue old products
      if (products.length === 3 && isComplete) {
        ns.print(`:: [Discontinue]`);
        ns.print(`:::: Dropping ${nProduct.dropName}`);
        c.discontinueProduct(sName, nProduct.dropName);
      }

      // TODO: FIXME: We are not doing anythin
      if (products.length < 3 && isComplete) {
        ns.print(`[Product] We are not developing`);
        const dInvestment = Math.round((funds * 0.01) / 2);
        if (dInvestment * 2 > pInvestment) {
          ns.print(`[Product] Invest ${ns.formatNumber(dInvestment * 2, 1)}`);
          // const lVersion = products[products.length - 1].split(pVerson);
          // const dVersion = parseInt(lVersion[1]) + 1;
          const pName = `${pPrefix} ${pVerson}${nProduct.lastVersion + 1}`;
          ns.print(pName);

          ns.print(
            `[Product] Develop ${pName} (${ns.formatNumber(
              dInvestment * 2,
              1
            )})`
          );
          c.makeProduct(sName, dCity, pName, dInvestment, dInvestment);
        }
      } else if (!isComplete) {
        const lProduct = products[products.length - 1];
        const lp = c.getProduct(sName, dCity, lProduct);
        // ns.print(
        //   `:: Still developing product ${lProduct} (${lp.developmentProgress.toFixed(
        //     2
        //   )}%)`
        // );
      }

      // TODO: Upgrade Wilson analytics to lvl 10
      // TODO: Grow Aevum to 60 employees
      // TODO: Check if we are developing / discontinue / create

      // Buy TA I & II together (140k science)
      // Add check for if we should check (isDoneResearch/TA/Whatever)
      ns.print(`:: [Research]`);
      const isResearchDone = dCheckMarketResearch(ns, sName, researchPoints);

      // TODO: Check investory > 800t

      // 1. Always be making products
      // 2. Buy Wilson Analytics wheenver in reach
      // 3. Upgrade Aevum +15 at a time or buy AdVert whichever is cheaper
      // 4. Upgrade size of others but Aevum should be 60 ahead
      // 5. Level any other upgrades if they are cheap
      return false;
    },
  },
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
