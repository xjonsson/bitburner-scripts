/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { CONSTANTS } from '/os/data/constants';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Configs
const { CITIES } = CONSTANTS;
const { fName, sName } = CORP;

// ******** Styling

// ******** Main function
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  ns.clearLog();
  let cycles = 0;

  // ******** Single run code
  const c = ns.corporation;
  const isRegistered = c.hasCorporation();
  const divs = c.getCorporation().divisions;
  const isFarm = isRegistered ? divs.includes(fName) : false;
  const isSmoke = isRegistered ? divs.includes(sName) : false;

  // ******** Loop run code
  while (isRegistered && (isFarm || isSmoke)) {
    ns.clearLog();
    ns.print(
      `${isRegistered ? '🟢' : ''}${isFarm ? '🐄' : ''}${isSmoke ? '🚬' : ''}`,
    );
    ns.print(`[Cycles] ${cycles}`);

    // ******** Each tick
    ns.print('========DEBUG========');

    // ******** EACH START
    while (ns.corporation.getCorporation().nextState === 'START') {
      // We check the state right before start
      CITIES.forEach(() => {
        // const p = c.getMaterial(fName, city, MATERIALS.Food);
        // ns.print(p);
        const p = c.getDivision(sName).products;
        ns.print(p);
        ns.print(p.length);
        p.forEach((n) => {
          const tp = c.getProduct(sName, 'Aevum', n);
          ns.tprint(tp);
        });
      });
      ns.print('nStep: Start');
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'PURCHASE') {
      ns.print('nStep: Purchase');
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'PRODUCTION') {
      ns.print('nStep: Production');
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'EXPORT') {
      ns.print('nStep: Export');
      await ns.corporation.nextUpdate();
    }

    while (ns.corporation.getCorporation().nextState === 'SALE') {
      ns.print('nStep: Sale');
      await ns.corporation.nextUpdate();
    }

    cycles += 1;
    // await ns.asleep(100);
  }
}

// class Product {
//   productName: string;
//   uBound: number;
//   lBound: number;
//   lastAction: string;
//   division: string;
//   city: string;

//   constructor(ns: NS, productName: string) {
//     this.productName = productName;
//     this.uBound = 40;
//     this.lBound = 2;
//     this.lastAction = 'None';
//     this.division = ns.args[0] as string;
//     this.city = 'Aevum'; // city with most production employees..
//   }

//   setLastAction(newLastAction) {
//     this.lastAction = newLastAction;
//   }

//   setLowerBound(newLowerBound) {
//     this.lBound = parseInt(newLowerBound);
//     if (this.lBound > this.uBound) {
//       this.uBound = this.lBound * 2;
//     }
//   }

//   setUpperBound(newUpperBound) {
//     this.uBound = parseInt(newUpperBound);
//     if (this.lBound > this.uBound) {
//       this.uBound = this.lBound * 2;
//     }
//   }

//   getNewMulti(ns) {
//     return `MP*${Math.floor((this.uBound + this.lBound) / 2)}`;
//   }

//   setNewProdPrice(ns) {
//     ns.corporation.sellProduct(
//       this.division,
//       this.city,
//       this.productName,
//       'MAX',
//       this.getNewMulti(ns),
//       true
//     );
//   }

//   update(ns) {
//     this.productInfo = ns.corporation.getProduct(
//       this.division,
//       this.productName
//     );
//     this.curMulti = this.productInfo.sCost.slice(3);
//     this.prodQtyHeld = this.productInfo.cityData[this.city][0];
//     this.prodQtyProduced = this.productInfo.cityData[this.city][1];
//     this.prodQtySold = this.productInfo.cityData[this.city][2];
//   }
// }

// export async function main(ns) {
//   const allCities = [
//     'Aevum',
//     'Chongqing',
//     'Sector-12',
//     'New Tokyo',
//     'Ishima',
//     'Volhaven',
//   ];
//   const divToUpgrade = ns.args[0];
//   const deBug = false;
//   const city = 'Aevum'; // Choose city with largest # of employees = lowest price
//   const myProducts = [];
//   if (divToUpgrade == null || divToUpgrade == undefined) {
//     ns.tprint('Must supply Division as argument!! ');
//     ns.exit();
//   }

//   ns.tail();

//   const done = false;
//   let lastRoundAdvertCount = ns.corporation.getHireAdVertCount(divToUpgrade);

//   while (!done) {
//     const myDiv = ns.corporation.getDivision(divToUpgrade);
//     const thisRoundAdvertCount =
//       ns.corporation.getHireAdVertCount(divToUpgrade);
//     const warehouseInfo = ns.corporation.getWarehouse(divToUpgrade, city);
//     const warehousePercentFull = warehouseInfo.sizeUsed / warehouseInfo.size;

//     for (const product of myDiv.products) {
//       if (!myProducts.includes(product)) {
//         const newProduct = ns.corporation.getProduct(divToUpgrade, product);
//         if (newProduct.developmentProgress >= 100) {
//           myProducts.push(product);
//           myProducts[product] = new Product(ns, product);
//           myProducts[product].setNewProdPrice(ns);
//         }
//       }
//       if (myProducts.includes(product)) {
//         myProducts[product].update(ns);
//         if (myProducts[product].productInfo.developmentProgress < 100) {
//           myProducts[product].setLastAction('In Development | NC');
//         } else if (
//           myProducts[product].productInfo.sCost == 'MP' ||
//           myProducts[product].productInfo.sCost == 0 ||
//           myProducts[product].productInfo.sCost == null ||
//           myProducts[product].productInfo.sCost == undefined
//         ) {
//           myProducts[product].setNewProdPrice(ns);
//           myProducts[product].setLastAction('Was MP | set Multi');
//         } else {
//           if (thisRoundAdvertCount > lastRoundAdvertCount) {
//             // if adverts purchased, price need to go up.
//             myProducts[product].setUpperBound(
//               myProducts[product].curMulti * 1.25
//             );
//             myProducts[product].setLastAction('Advert + | Upper+');
//           } else if (
//             myProducts[product].prodQtyProduced ==
//               myProducts[product].prodQtySold &&
//             myProducts[product].prodQtyHeld == 0
//           ) {
//             // price is low, cannot tell how low with out raising upper bound
//             myProducts[product].setLowerBound(
//               myProducts[product].curMulti * 0.95
//             );
//             myProducts[product].setUpperBound(
//               myProducts[product].curMulti * 1.5
//             );
//             myProducts[product].setLastAction('Prod=Sold & held=0 | Upper+');
//           } else if (
//             myProducts[product].prodQtyProduced >
//             myProducts[product].prodQtySold
//           ) {
//             // price is too high, set upper bound
//             myProducts[product].setUpperBound(myProducts[product].curMulti);
//             myProducts[product].setLastAction('Prod>Sold | Set Upper');
//           } else if (
//             myProducts[product].prodQtyProduced <
//             myProducts[product].prodQtySold
//           ) {
//             // Price is too low set lower bound
//             if (
//               myProducts[product].prodQtyProduced -
//                 myProducts[product].prodQtySold >
//               1
//             ) {
//               // A little fine tuning...
//               myProducts[product].setLowerBound(
//                 myProducts[product].curMulti * 0.98
//               );
//             } else {
//               myProducts[product].setLowerBound(myProducts[product].curMulti);
//               myProducts[product].setLastAction('Prod<Sold | Set Lower');
//             }
//           }
//           if (warehousePercentFull > 0.9) {
//             // If warehouse is getting full, price is too high..
//             myProducts[product].setLowerBound(
//               myProducts[product].curMulti * 0.85
//             );
//             myProducts[product].setLastAction('warehouse full|Lower-');
//           }

//           myProducts[product].setNewProdPrice(ns);
//         }
//       }
//     }

//     lastRoundAdvertCount = thisRoundAdvertCount;

//     const colOne = 9; // prodName
//     const colTwo = 7; // CurrMulti
//     const colThree = 10; // sCost
//     const colFour = 9; // lBound
//     const colFive = 9; // Ubound
//     const colSix = 9; // QtyProd
//     const colSeven = 10; // QtySold
//     const colEight = 10; // QtyHeld
//     const colNine = 30; // lastAction
//     const totalWidth =
//       colOne +
//       colTwo +
//       colThree +
//       colFour +
//       colFive +
//       colSix +
//       colSeven +
//       colEight +
//       colNine;

//     ns.print('-'.padStart(totalWidth, '-'));
//     ns.print(
//       'Product'.padStart(colOne),
//       'Multi'.padStart(colTwo),
//       'sCost'.padStart(colThree),
//       'LwrBnd'.padStart(colFour),
//       'UprBnd'.padStart(colFive),
//       'QtyProd'.padStart(colSix),
//       'QtySold'.padStart(colSeven),
//       'QtyHeld'.padStart(colEight),
//       'LastAction'.padStart(colNine)
//     );
//     ns.print('-'.padStart(totalWidth, '-'));

//     for (const product of myDiv.products) {
//       if (myProducts.includes(product)) {
//         let strSCost = myProducts[product].productInfo.sCost;
//         if (strSCost == 0 || strSCost == null || strSCost == undefined) {
//           strSCost = 'MP';
//         }
//         ns.print(
//           myProducts[product].productName.padStart(colOne),
//           ns.nFormat(myProducts[product].curMulti, '0.00a').padStart(colTwo),
//           strSCost.padStart(colThree),
//           ns.nFormat(myProducts[product].lBound, '0.00a').padStart(colFour),
//           ns.nFormat(myProducts[product].uBound, '0.00a').padStart(colFive),
//           ns
//             .nFormat(myProducts[product].prodQtyProduced, '0.00a')
//             .padStart(colSix),
//           ns
//             .nFormat(myProducts[product].prodQtySold, '0.00a')
//             .padStart(colSeven),
//           ns
//             .nFormat(myProducts[product].prodQtyHeld, '0.00a')
//             .padStart(colEight),
//           myProducts[product].lastAction.padStart(colNine)
//         );
//       }
//     }
//     ns.print('-'.padStart(totalWidth, '-'));
//     await ns.sleep(10000);
//   }
// }
