/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { Corporation } from '/os/modules/Corporation';
import { CONSTANTS } from '/os/data/constants';
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
  dBoostWarehouse,
} from '/os/utils/corpFunctions';
/* eslint-enable */

const {
  CITIES,
  INDUSTRY,
  CORPUPGRADES: UPGRADES,
  CORPMATERIALS: MATERIALS,
} = CONSTANTS;
const { cName, fName, sName, iRounds, smoke } = CORP;
const { pPrefix, pVerson, dCity, investmentRatio } = smoke;
const {
  dProductBase,
  dProductRatio,
  // uResearchRatio,
  uUpgradesRatio,
  uOfficeRatio,
  uWarehouseRatio,
  uWilsonRatio,
  uAdvertRatio,
} = investmentRatio;

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

      if (funds > dProductBase && products.length === 0) {
        // Develop first product
        ns.print(
          `[Product] Develop ${pName} (${ns.formatNumber(dProductBase, 1)})`,
        );
        c.makeProduct(sName, dCity, pName, dProductBase / 2, dProductBase / 2);
        return true;
      }
      if (products.length > 0) {
        ns.print(`:: ${pName} exists`);
        return true;
      }

      ns.print(`[Funds] Need ${ns.formatNumber(dProductBase - funds, 1)}`);
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
      const { products, researchPoints, thisCycleRevenue, thisCycleExpenses } =
        c.getDivision(sName);
      const sProfit = thisCycleRevenue - thisCycleExpenses;

      // Reinvestment Ratios
      const invProduct = funds * dProductRatio;
      // const invResearch = funds * uResearchRatio;
      const invUpgrades = funds * uUpgradesRatio;
      const invOffice = funds * uOfficeRatio;
      const invWarehouse = funds * uWarehouseRatio;
      const invWilson = funds * uWilsonRatio;
      const invAds = funds * uAdvertRatio;

      ns.print(`[Tobacco] 🌿${ns.formatNumber(sProfit, 2)}/c`);

      // ns.print(
      //   `[Company] ${ns.formatNumber(funds, 2)} [Profit] ${ns.formatNumber(
      //     sProfit,
      //     2
      //   )}/c`
      // );
      ns.print(`[Products]`);
      // ns.print(`:: [Count] ${products.length}`); // NOTE: Keep maybe

      // Check if all products are selling
      const isSelling = dCheckProductsSelling(ns, sName, dCity);
      // ns.print(`:: [Selling] ${isSelling}`); // NOTE: Keep maybe

      // Check for active developments
      const isComplete = dCheckNoActiveDevelopment(ns, sName, dCity);
      // ns.print(`:: [Development] ${!isComplete}`); // NOTE: Keep maybe

      // Recalculate prices
      // ns.print(`:: [Recalculate]`); // NOTE: Keep maybe
      const nProduct = {
        dropName: '',
        // dropInvestment: 0,
        // dropProfit: 0,
        dropRating: 0,
        lastVersion: 0,
      };

      products.forEach((n) => {
        const p = c.getProduct(sName, dCity, n);
        if (p.developmentProgress === 100) {
          const pPrice = pCalculatePrice(ns, sName, dCity, n);
          const pStored = p.stored;
          const pProduced = p.productionAmount;
          // const pSold = p.actualSellAmount;
          const pCost = p.productionCost;
          const pRating = p.effectiveRating;
          const pProfit = pPrice - pCost;
          const msg =
            `${n} | ` +
            `📦${ns.formatNumber(pStored, 0)} ` +
            `🛠️${ns.formatNumber(pProduced, 2)} ` +
            // `S:${ns.formatNumber(pSold, 2)} ` +
            // `🏭${ns.formatNumber(pCost, 2)} ` +
            `💰${ns.formatNumber(pPrice, 2)} ` +
            `🌿+${ns.formatNumber(pProfit, 2)} ` +
            `⭐${ns.formatNumber(pRating, 2)}`;
          c.sellProduct(
            sName,
            dCity,
            n,
            'MAX',
            pPrice.toFixed(2).toString(),
            true,
          );
          ns.print(msg);

          // ns.tprint(p);

          // Update drops
          // Probably dont need this // FIXME:
          if (nProduct.dropName === '') {
            nProduct.dropName = n;
            // nProduct.dropInvestment =
            //   p.designInvestment + p.advertisingInvestment;
            // nProduct.dropProfit = pProfit;
            nProduct.dropRating = pRating;
            nProduct.lastVersion = parseInt(n.split(pVerson)[1]);
          }
          // if (pProfit < nProduct.dropProfit) {
          if (pRating < nProduct.dropRating) {
            nProduct.dropName = n;
            // nProduct.dropInvestment =
            //   p.designInvestment + p.advertisingInvestment;
            // nProduct.dropProfit = pProfit;
            nProduct.dropRating = pRating;
          }
          if (parseInt(n.split(pVerson)[1]) > nProduct.lastVersion) {
            nProduct.lastVersion = parseInt(n.split(pVerson)[1]);
          }
          // ns.tprint(nProduct); // DEBUG
        } else {
          ns.print(
            `${n} | In development (${p.developmentProgress.toFixed(2)}%)`,
          );
        }
      });

      // NOTE: Check if we should discontinue and reinvest
      // let dInvestment = Math.round(funds * 0.01);
      // if (dInvestment < nProduct.dropInvestment) {
      //   dInvestment = nProduct.dropInvestment * 1.05;
      //   if (dInvestment > funds * 0.1) {
      //     dInvestment = funds * 0.1;
      //   }
      // }
      // Only use 1% of funds for each (2% total)
      // const dInvestment = Math.round(funds * 0.02);
      // if (dInvestment < nProduct.dropInvestment) {
      //   dInvestment = nProduct.dropInvestment * 1.05;
      //   if (dInvestment > funds * 0.25) {
      //     dInvestment = funds * 0.25;
      //   }
      // }
      // ns.print(`:: [Reinvest]`); // NOTE: Keep maybe
      // ns.print(
      //   `:::: Drop investment: ${nProduct.dropName} (${ns.formatNumber(
      //     nProduct.dropInvestment,
      //     2
      //   )})`
      // );

      // ns.print(`:::: New investment: vX (${ns.formatNumber(dInvestment, 2)})`); // KEEP
      const nVersion =
        parseInt(products[products.length - 1].split(pVerson)[1]) + 1;
      ns.print(
        `:::: Next version: v${nVersion} (${ns.formatNumber(
          invProduct,
          2,
        )}) | Drop ${products[0]} (${ns.formatNumber(nProduct.dropRating, 2)})`,
      );

      // TODO: FIXME:
      // if (dInvestment > nProduct.dropInvestment) {
      if (true) {
        // Discontinue old products
        // ns.tprint(`DEBUG :: We would drop ${products[0]}`);
        if (products.length === 3 && isComplete) {
          ns.print(`:: [Discontinue]`);
          ns.print(`:::: Dropping ${nProduct.dropName}`);
          // c.discontinueProduct(sName, nProduct.dropName); // FIXME:
          c.discontinueProduct(sName, products[0]); // Drop the first one
        }
      }
      // FIXME: Check to see if its better without investment check
      // else if (nProduct.dropInvestment >= dInvestment) {
      //   ns.print(`:::::: Keeping ${nProduct.dropName}`);
      // }

      // TODO: FIXME: We are not doing anythin
      if (products.length < 3 && isComplete) {
        ns.print(`[Product] We are not developing`);
        // const dInvestment = Math.round((funds * 0.01) / 2);
        if (invProduct > dProductBase) {
          ns.print(`[Product] Invest ${ns.formatNumber(invProduct, 1)}`);
          // const lVersion = products[products.length - 1].split(pVerson);
          // const dVersion = parseInt(lVersion[1]) + 1;
          const pName = `${pPrefix} ${pVerson}${nProduct.lastVersion + 1}`;
          ns.print(pName);

          ns.print(
            `[Product] Develop ${pName} (${ns.formatNumber(invProduct, 1)})`,
          );
          c.makeProduct(sName, dCity, pName, invProduct / 2, invProduct / 2);
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

      // TODO: Grow Aevum to 60 employees
      // TODO: Check if we are developing / discontinue / create

      // Buy TA I & II together (140k science)
      // Add check for if we should check (isDoneResearch/TA/Whatever)
      // ns.print(`:: [Research]`);
      const isResearchDone = dCheckMarketResearch(ns, sName, researchPoints);

      ns.print(`[Upgrades]`);
      // const uNeed = 0.05;
      // let uNeedDevCity = 0.2;
      // Upgrade Aevum
      const uDevCityCost = c.getOfficeSizeUpgradeCost(sName, dCity, 15);
      let dCitySize = c.getOffice(sName, dCity).size;
      ns.print(
        `:: [Dev: ${dCity}] ${dCitySize + 15} (${ns.formatNumber(
          uDevCityCost - invOffice,
          1,
        )})`,
      );
      // if (dCitySize < 60) uNeedDevCity = 0.25;

      // Process people
      if (uDevCityCost < invOffice && c.getCorporation().funds > uDevCityCost) {
        ns.print(`:::: Upgrading ${dCity}`);
        const oNewSize = dCitySize + 15;
        const oMap = {
          ops: Math.floor(oNewSize / 3.5),
          eng: Math.floor(oNewSize / 3.5), // Add offset 1
          bus: Math.floor(0.5 * (oNewSize / 3.5)), // Add offset 3
          man: Math.floor(oNewSize / 3.5), // Add offset 2
          rnd: 0,
          int: 0,
          total: 0,
          offset: 0,
        };
        oMap.total = oMap.ops + oMap.eng + oMap.bus + oMap.man;
        oMap.offset = oNewSize - oMap.total;
        // ns.tprint('PRE OFFSET');
        // ns.tprint(oMap);
        if (oMap.offset > 0) oMap.bus += 1;
        if (oMap.offset > 1) oMap.man += 1;
        if (oMap.offset > 2) oMap.eng += 1;
        // ns.tprint('POST OFFSET');
        oMap.total = oMap.ops + oMap.eng + oMap.bus + oMap.man;
        oMap.offset = oNewSize - oMap.total;
        // ns.tprint(oMap);

        // Upgrade the office
        c.upgradeOfficeSize(sName, dCity, 15);

        for (let h = 0; h < 15; h += 1) {
          c.hireEmployee(sName, dCity);
        }
        c.setAutoJobAssignment(sName, dCity, 'Operations', oMap.ops);
        c.setAutoJobAssignment(sName, dCity, 'Engineer', oMap.eng);
        c.setAutoJobAssignment(sName, dCity, 'Business', oMap.bus);
        c.setAutoJobAssignment(sName, dCity, 'Management', oMap.man);
        c.setAutoJobAssignment(
          sName,
          dCity,
          'Research & Development',
          oMap.rnd,
        );
        c.setAutoJobAssignment(sName, dCity, 'Intern', 0);
        c.setAutoJobAssignment(sName, dCity, 'Unassigned', 0);
      }

      // Other cities
      dCitySize = c.getOffice(sName, dCity).size;
      CITIES.filter((n) => n !== dCity).forEach((n: any) => {
        const o = c.getOffice(sName, n);
        // const w = c.getWarehouse(sName, n);
        // ns.tprint(w);
        const oSizeOffset = dCitySize - (o.size + 15);
        if (oSizeOffset > 60) {
          const oCost = c.getOfficeSizeUpgradeCost(sName, n, 15);
          ns.print(
            `:: [Office] ${n} (${o.size}) +15 (${ns.formatNumber(oCost, 2)})`,
          );
          // Process people
          if (oCost < invOffice && c.getCorporation().funds > oCost) {
            ns.print(`:::: Upgrading ${n}`);
            const oNewSize = o.size + 15;
            const oMap = {
              ops: 1,
              eng: 1,
              bus: 1,
              man: 1,
              rnd: oNewSize - 4,
            };

            // Upgrade the office
            c.upgradeOfficeSize(sName, n, 15);

            for (let h = 0; h < 15; h += 1) {
              c.hireEmployee(sName, n);
            }
            c.setAutoJobAssignment(sName, n, 'Operations', oMap.ops);
            c.setAutoJobAssignment(sName, n, 'Engineer', oMap.eng);
            c.setAutoJobAssignment(sName, n, 'Business', oMap.bus);
            c.setAutoJobAssignment(sName, n, 'Management', oMap.man);
            c.setAutoJobAssignment(
              sName,
              n,
              'Research & Development',
              oMap.rnd,
            );
            c.setAutoJobAssignment(sName, n, 'Intern', 0);
            c.setAutoJobAssignment(sName, n, 'Unassigned', 0);
          }
        }
      });

      // Check warehouses
      // dBoostWarehouse(ns, sName, INDUSTRY.Agriculture);
      ns.print(`[Warehouses]`);
      const divs = c.getCorporation().divisions;
      divs.forEach((div) => {
        CITIES.forEach((city: any) => {
          const boost = dBoostWarehouse(ns, div, city, INDUSTRY.Agriculture);
          if (boost.upgrade) {
            ns.print(`:: ${div} ${city} Upgrade`);
          }

          // ns.tprint(wHardware);
          // ns.tprint(ns.formatNumber(cBoost, 2));
          // ns.tprint(ns.formatPercent(cBoost / funds, 2));

          if (boost.boost) {
            // ns.print(`:: ${div} ${city} Boost`);
            const wHardware = c.getMaterial(div, city, MATERIALS.Hardware);
            const wRobots = c.getMaterial(div, city, MATERIALS.Robots);
            const wAI = c.getMaterial(div, city, MATERIALS.AiCores);
            const wReal = c.getMaterial(div, city, MATERIALS.RealEstate);

            const nHardware = boost.bHardware - wHardware.stored;
            const nRobots = boost.bRobots - wRobots.stored;
            const nAI = boost.bAI - wAI.stored;
            const nReal = boost.bReal - wReal.stored;
            const cHardware = wHardware.marketPrice * nHardware;
            const cRobots = wRobots.marketPrice * nRobots;
            const cAI = wAI.marketPrice * nAI;
            const cReal = wReal.marketPrice * nReal;
            const wBoostCost = cHardware + cRobots + cAI + cReal;

            if (
              wBoostCost < invWarehouse &&
              c.getCorporation().funds > wBoostCost
            ) {
              ns.print(`:: ${div} :: ${city} Boosting`);
              c.bulkPurchase(div, city, MATERIALS.Hardware, nHardware);
              c.bulkPurchase(div, city, MATERIALS.Robots, nRobots);
              c.bulkPurchase(div, city, MATERIALS.AiCores, nAI);
              c.bulkPurchase(div, city, MATERIALS.RealEstate, nReal);
            }
          }
        });
      });
      // ns.tprint(bTest);

      const uWilsonCost = c.getUpgradeLevelCost('Wilson Analytics');
      ns.print(
        `:: Wilson Analytics (${ns.formatNumber(uWilsonCost - invWilson, 1)})`,
      );
      if (uWilsonCost < invWilson && c.getCorporation().funds > uWilsonCost) {
        ns.print(
          `:: [Wilson] +1 (${c.getUpgradeLevel('Wilson Analytics') + 1})`,
        );
        c.levelUpgrade('Wilson Analytics');
      }

      // Upgrade Advert
      const uAdsCost = c.getHireAdVertCost(sName);
      ns.print(`:: Advert (${ns.formatNumber(uAdsCost - invAds, 1)})`);
      if (uAdsCost < invAds && c.getCorporation().funds > uAdsCost) {
        ns.print(`:: [AdVert] +1 (${c.getHireAdVertCount(sName) + 1})`);
        c.hireAdVert(sName);
      }

      // Upgrade things if they are cheap
      UPGRADES.forEach((uName) => {
        const uCost = c.getUpgradeLevelCost(uName);
        // NOTE: Keep for debug
        // ns.print(`:: ${uName} (${ns.formatNumber(uCost - invUpgrades, 1)})`);
        if (uCost < invUpgrades && c.getCorporation().funds > uCost) {
          ns.print(`:::: ${uName} +1 (${c.getUpgradeLevel(uName) + 1})`);
          c.levelUpgrade(uName);
        }
      });

      // ns.print(`:: [Count] ${products.length}`);

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

  const { funds } = ns.corporation.getCorporation();
  ns.print(`[Company] 💰${ns.formatNumber(funds, 2)}`);
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

// const Snusv4 = {
//   name: 'Snus v4',
//   rating: 3829.808990687959,
//   effectiveRating: 123.77090111472826,
//   stats: {
//     quality: 4132.435980617707,
//     performance: 4549.2451669593665,
//     durability: 3039.3692779947605,
//     reliability: 4070.5429195728134,
//     aesthetics: 3165.8343822804404,
//     features: 4489.344694478768,
//   },
//   productionCost: 14025.992704341526,
//   desiredSellPrice: 14159.91,
//   desiredSellAmount: 'MAX',
//   stored: 0,
//   productionAmount: 13.837007787598328,
//   actualSellAmount: 13.837007787598328,
//   developmentProgress: 100,
//   advertisingInvestment: 12333617835,
//   designInvestment: 12333617835,
//   size: 0.05,
// };
// const Snusv5 = {
//   name: 'Snus v5',
//   rating: 5699.570194398385,
//   effectiveRating: 150.99099568382726,
//   stats: {
//     quality: 6153.237723711982,
//     performance: 6781.228603153458,
//     durability: 4523.121788324951,
//     reliability: 6048.036004751332,
//     aesthetics: 4699.958044837513,
//     features: 6680.824903336844,
//   },
//   productionCost: 14025.992704341526,
//   desiredSellPrice: 14236.08,
//   desiredSellAmount: 'MAX',
//   stored: 0,
//   productionAmount: 13.837007787598328,
//   actualSellAmount: 13.837007787598328,
//   developmentProgress: 100,
//   advertisingInvestment: 5507359118,
//   designInvestment: 5507359118,
//   size: 0.05,
// };
// const Snusv6 = {
//   name: 'Snus v6',
//   rating: 6419.857046928012,
//   effectiveRating: 160.24802085427467,
//   stats: {
//     quality: 6932.361790414669,
//     performance: 7643.228039204377,
//     durability: 5094.6857874325415,
//     reliability: 6807.885288721387,
//     aesthetics: 5288.676074472451,
//     features: 7524.992991308031,
//   },
//   productionCost: 14025.992704341526,
//   desiredSellPrice: 14267.41,
//   desiredSellAmount: 'MAX',
//   stored: 0,
//   productionAmount: 13.837007787598328,
//   actualSellAmount: 13.837007787598328,
//   developmentProgress: 100,
//   advertisingInvestment: 6929318788,
//   designInvestment: 6929318788,
//   size: 0.05,
// };

// const SnusvX = {
//   name: 'Snus v6',
//   rating: 6419.857046928012,
//   effectiveRating: 160.24802085427467,
//   productionCost: 14025.992704341526,
//   desiredSellPrice: 14267.41,
//   productionAmount: 13.837007787598328,
//   actualSellAmount: 13.837007787598328,
//   advertisingInvestment: 6929318788,
//   designInvestment: 6929318788,
//   size: 0.05,
// };

// // SIZE CALCULATIONS
// const sAgricultureData = {
//   // startingCost: 40e9,
//   // description: 'Cultivate crops and breed livestock to produce food.',
//   // recommendStarting: true,
//   scienceFactor: 0.5,
//   advertisingFactor: 0.04,
//   hardwareFactor: 0.2,
//   robotFactor: 0.3,
//   aiCoreFactor: 0.3,
//   realEstateFactor: 0.72,
//   // requiredMaterials: { Water: 0.5, Chemicals: 0.2 },
//   // producedMaterials: ['Plants', 'Food'],
//   // makesMaterials: true,
//   // makesProducts: false,
// };

// const sTobaccoData = {
//   // startingCost: 20e9,
//   // description: 'Create and distribute tobacco and tobacco-related products.',
//   product: {
//     name: 'Product',
//     verb: 'Create',
//     desc: 'Create a new tobacco product!',
//     ratingWeights: {
//       quality: 0.7,
//       durability: 0.1,
//       aesthetics: 0.2,
//     },
//   },
//   // recommendStarting: true,
//   scienceFactor: 0.75,
//   advertisingFactor: 0.2,
//   hardwareFactor: 0.15,
//   robotFactor: 0.2,
//   aiCoreFactor: 0.15,
//   realEstateFactor: 0.15,
//   // requiredMaterials: { Plants: 1 },
//   // makesMaterials: false,
//   // makesProducts: true,
// };

// const sHardware = {
//   name: 'Hardware',
//   size: 0.06,
//   demandBase: 85,
//   demandRange: [80, 90],
//   competitionBase: 80,
//   competitionRange: [65, 95],
//   baseCost: 8e3,
//   maxVolatility: 0.5,
//   baseMarkup: 1,
// };

// const sRobots = {
//   name: 'Robots',
//   size: 0.5,
//   demandBase: 90,
//   demandRange: [80, 99],
//   competitionBase: 90,
//   competitionRange: [80, 99],
//   baseCost: 75e3,
//   maxVolatility: 0.5,
//   baseMarkup: 1,
// };

// const sAI = {
//   name: 'AI Cores',
//   size: 0.1,
//   demandBase: 90,
//   demandRange: [80, 99],
//   competitionBase: 90,
//   competitionRange: [80, 99],
//   baseCost: 15e3,
//   maxVolatility: 0.8,
//   baseMarkup: 0.5,
// };

// const sRealEstate = {
//   name: 'Real Estate',
//   size: 0.005,
//   demandBase: 50,
//   demandRange: [5, 99],
//   competitionBase: 50,
//   competitionRange: [25, 75],
//   baseCost: 80e3,
//   maxVolatility: 1.5,
//   baseMarkup: 1.5,
// };

// // NOTE:
// // Operations = 21
// // Engineer = 21
// // Business = 11
// // Management = 22

// const wSmokeUpgrade = {
//   size: 6020,
//   'Hardware (x)': 23516,
//   'Robots (y)': 3359,
//   'AI Cores (z)': 13910,
//   'Real Estate (w)': 287692,
// };

// const wAgriUpgrade5p = {
//   size: 8740,
//   'Hardware (x)': 17425,
//   'Robots (y)': 2863,
//   'AI Cores (z)': 16313,
//   'Real Estate (w)': 844667,
// };

// const wAgriUpgrade10p = {
//   size: 10120,
//   'Hardware (x)': 18480, // 0.06
//   'Robots (y)': 3189, // 0.5
//   'AI Cores (z)': 17944, // 0.1
//   'Real Estate (w)': 961070, // 0.005
// };

// const sSnusv67 = {
//   name: 'Snus v67',
//   demand: 48.19758190341814,
//   competition: 32.126399999999705,
//   rating: 86426.01153591168,
//   effectiveRating: 26036.513925914784,
//   stats: {
//     quality: 92228.18163944765,
//     performance: 97555.3769262713,
//     durability: 68254.90458718593,
//     reliability: 96041.5062295581,
//     aesthetics: 75203.96964789873,
//     features: 101532.665676963,
//   },
//   productionCost: 17602.376703130376,
//   desiredSellPrice: 235425.57,
//   desiredSellAmount: 'MAX',
//   stored: 0,
//   productionAmount: 631.204869132144,
//   actualSellAmount: 631.204869132144,
//   developmentProgress: 100,
//   advertisingInvestment: 4638546260.459067,
//   designInvestment: 4638546260.459067,
//   size: 0.05,
// };
// const sSnusv68 = {
//   name: 'Snus v68',
//   demand: 54.27270510663885,
//   competition: 32.0443999999999,
//   rating: 197969.95062205743,
//   effectiveRating: 39405.80801210546,
//   stats: {
//     quality: 210826.74755807655,
//     performance: 222081.84717230688,
//     durability: 156459.8132183137,
//     reliability: 221290.8929695076,
//     aesthetics: 173726.2300478623,
//     features: 232671.35986044255,
//   },
//   productionCost: 17602.376703130376,
//   desiredSellPrice: 592052.33,
//   desiredSellAmount: 'MAX',
//   stored: 0,
//   productionAmount: 623.2118566284438,
//   actualSellAmount: 623.2118566284438,
//   developmentProgress: 100,
//   advertisingInvestment: 32060251447.713913,
//   designInvestment: 32060251447.713913,
//   size: 0.05,
// };

// const sampleWHardware = {
//   marketPrice: 8077.5476928608505,
//   desiredSellPrice: '',
//   desiredSellAmount: 0,
//   name: 'Hardware',
//   stored: 18480,
//   quality: 1,
//   demand: 80.51843687146263,
//   competition: 85.79099621825996,
//   productionAmount: 0,
//   actualSellAmount: 0,
//   exports: [],
// };
