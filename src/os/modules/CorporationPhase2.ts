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
      const { products, researchPoints, thisCycleRevenue, thisCycleExpenses } =
        c.getDivision(sName);
      const sProfit = thisCycleRevenue - thisCycleExpenses;
      ns.print(
        `[Company] ${ns.formatNumber(funds, 2)} [Profit] ${ns.formatNumber(
          sProfit,
          2
        )}/c`
      );
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
        dropInvestment: 0,
        // dropProfit: 0,
        dropRating: 0,
        lastVersion: 0,
      };

      products.forEach((n) => {
        const p = c.getProduct(sName, dCity, n);
        if (p.developmentProgress === 100) {
          const pPrice = pCalculatePrice(ns, sName, dCity, n);
          const pProduced = p.productionAmount;
          const pSold = p.actualSellAmount;
          const pCost = p.productionCost;
          const pRating = p.effectiveRating;
          const pProfit = pPrice - pCost;
          const msg =
            `${n} | ` +
            `P:${ns.formatNumber(pProduced, 2)} ` +
            `S:${ns.formatNumber(pSold, 2)} ` +
            `C:${ns.formatNumber(pCost, 2)} ` +
            `O:${ns.formatNumber(pPrice, 2)} ` +
            `+${ns.formatNumber(pProfit, 2)} ` +
            `ER${ns.formatNumber(pRating, 2)}`;
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
            nProduct.dropInvestment =
              p.designInvestment + p.advertisingInvestment;
            // nProduct.dropProfit = pProfit;
            nProduct.dropRating = pRating;
            nProduct.lastVersion = parseInt(n.split(pVerson)[1]);
          }
          // if (pProfit < nProduct.dropProfit) {
          if (pRating < nProduct.dropRating) {
            nProduct.dropName = n;
            nProduct.dropInvestment =
              p.designInvestment + p.advertisingInvestment;
            // nProduct.dropProfit = pProfit;
            nProduct.dropRating = pRating;
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

      // NOTE: Check if we should discontinue and reinvest
      // let dInvestment = Math.round(funds * 0.01);
      // if (dInvestment < nProduct.dropInvestment) {
      //   dInvestment = nProduct.dropInvestment * 1.05;
      //   if (dInvestment > funds * 0.1) {
      //     dInvestment = funds * 0.1;
      //   }
      // }
      let dInvestment = Math.round(funds * 0.1);
      if (dInvestment < nProduct.dropInvestment) {
        dInvestment = nProduct.dropInvestment * 1.05;
        if (dInvestment > funds * 0.2) {
          dInvestment = funds * 0.2;
        }
      }
      ns.print(`:: [Reinvest]`);
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
          dInvestment,
          2
        )}) | Drop ${products[0]} (${ns.formatNumber(
          nProduct.dropInvestment,
          2
        )})`
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
        if (dInvestment > pInvestment) {
          ns.print(`[Product] Invest ${ns.formatNumber(dInvestment, 1)}`);
          // const lVersion = products[products.length - 1].split(pVerson);
          // const dVersion = parseInt(lVersion[1]) + 1;
          const pName = `${pPrefix} ${pVerson}${nProduct.lastVersion + 1}`;
          ns.print(pName);

          ns.print(
            `[Product] Develop ${pName} (${ns.formatNumber(dInvestment, 1)})`
          );
          c.makeProduct(sName, dCity, pName, dInvestment / 2, dInvestment / 2);
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
      ns.print(`:: [Research]`);
      const isResearchDone = dCheckMarketResearch(ns, sName, researchPoints);

      ns.print(`[Upgrades]`);
      const uNeed = 0.01;
      let uNeedDevCity = 0.1;
      // Upgrade Aevum
      const uDevCityCost = c.getOfficeSizeUpgradeCost(sName, dCity, 15);
      let dCitySize = c.getOffice(sName, dCity).size;
      ns.print(
        `:: [Dev City] ${dCity} (${dCitySize}) +15 (${ns.formatNumber(
          uDevCityCost - funds * uNeed,
          1
        )})`
      );
      if (dCitySize < 60) uNeedDevCity = 0.2;

      // Process people
      if (uDevCityCost < funds * uNeedDevCity) {
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
          oMap.rnd
        );
        c.setAutoJobAssignment(sName, dCity, 'Intern', 0);
        c.setAutoJobAssignment(sName, dCity, 'Unassigned', 0);
      }

      // Other cities
      dCitySize = c.getOffice(sName, dCity).size;
      CITIES.filter((n) => n !== dCity).forEach((n: any) => {
        const o = c.getOffice(sName, n);
        const oSizeOffset = dCitySize - (o.size + 15);
        if (oSizeOffset > 60) {
          const oCost = c.getOfficeSizeUpgradeCost(sName, n, 15);
          ns.print(
            `:: [Office] ${n} (${o.size}) +15 (${ns.formatNumber(oCost, 2)})`
          );
          // TODO: Add this once its actual
        }
      });

      // const uWilsonCost = c.getUpgradeLevelCost('Wilson Analytics');
      // if (c.getUpgradeLevel('Wilson Analytics') < 10) uNeed = 0.05;
      // ns.print(
      //   `:: Wilson Analytics (${ns.formatNumber(
      //     uWilsonCost - funds * uNeed,
      //     1
      //   )})`
      // );
      // if (uWilsonCost < funds * uNeed) {
      //   c.levelUpgrade('Wilson Analytics');
      // }

      // Upgrade Advert
      const uAdsCost = c.getHireAdVertCost(sName);
      if (uAdsCost < funds * 0.01) {
        ns.print(`:: [AdVert] +1 (${c.getHireAdVertCount(sName) + 1})`);
        c.hireAdVert(sName);
      }

      // Upgrade things if they are cheap
      UPGRADES.forEach((uName) => {
        const uCost = c.getUpgradeLevelCost(uName);
        // ns.print(`:: ${uName} (${ns.formatNumber(uCost - funds * uNeed, 1)})`);
        if (uCost < funds * 0.01) {
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

const Snusv4 = {
  name: 'Snus v4',
  rating: 3829.808990687959,
  effectiveRating: 123.77090111472826,
  stats: {
    quality: 4132.435980617707,
    performance: 4549.2451669593665,
    durability: 3039.3692779947605,
    reliability: 4070.5429195728134,
    aesthetics: 3165.8343822804404,
    features: 4489.344694478768,
  },
  productionCost: 14025.992704341526,
  desiredSellPrice: 14159.91,
  desiredSellAmount: 'MAX',
  stored: 0,
  productionAmount: 13.837007787598328,
  actualSellAmount: 13.837007787598328,
  developmentProgress: 100,
  advertisingInvestment: 12333617835,
  designInvestment: 12333617835,
  size: 0.05,
};
const Snusv5 = {
  name: 'Snus v5',
  rating: 5699.570194398385,
  effectiveRating: 150.99099568382726,
  stats: {
    quality: 6153.237723711982,
    performance: 6781.228603153458,
    durability: 4523.121788324951,
    reliability: 6048.036004751332,
    aesthetics: 4699.958044837513,
    features: 6680.824903336844,
  },
  productionCost: 14025.992704341526,
  desiredSellPrice: 14236.08,
  desiredSellAmount: 'MAX',
  stored: 0,
  productionAmount: 13.837007787598328,
  actualSellAmount: 13.837007787598328,
  developmentProgress: 100,
  advertisingInvestment: 5507359118,
  designInvestment: 5507359118,
  size: 0.05,
};
const Snusv6 = {
  name: 'Snus v6',
  rating: 6419.857046928012,
  effectiveRating: 160.24802085427467,
  stats: {
    quality: 6932.361790414669,
    performance: 7643.228039204377,
    durability: 5094.6857874325415,
    reliability: 6807.885288721387,
    aesthetics: 5288.676074472451,
    features: 7524.992991308031,
  },
  productionCost: 14025.992704341526,
  desiredSellPrice: 14267.41,
  desiredSellAmount: 'MAX',
  stored: 0,
  productionAmount: 13.837007787598328,
  actualSellAmount: 13.837007787598328,
  developmentProgress: 100,
  advertisingInvestment: 6929318788,
  designInvestment: 6929318788,
  size: 0.05,
};
