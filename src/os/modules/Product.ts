/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
/* eslint-enable */

const { cName, fName, sName } = CORP;

export class Product {
  // ******** Base
  ns: NS;
  name: string;
  div: string;
  city: string;
  // exists: boolean;
  bCeil: number;
  bFloor: number;
  pAction: string;

  //   uBound: number;
  //   lBound: number;
  //   lastAction: string;

  constructor(
    ns: NS,
    name: string,
    div: string,
    city: string,
    bCeil?: number,
    bFloor?: number
  ) {
    this.ns = ns;
    this.name = name;
    this.div = div;
    this.city = city;
    this.bCeil = bCeil || 50;
    this.bFloor = bFloor || 2;
    this.pAction = 'NONE';
  }

  update(ns) {
    this.productInfo = ns.corporation.getProduct(
      this.division,
      this.productName
    );
    this.curMulti = this.productInfo.sCost.slice(3);
    this.prodQtyHeld = this.productInfo.cityData[this.city][0];
    this.prodQtyProduced = this.productInfo.cityData[this.city][1];
    this.prodQtySold = this.productInfo.cityData[this.city][2];
  }

  // get wait(): number {
  //   return this.waitCycles;
  // }

  // set wait(cycles: number) {
  //   this.waitCycles = cycles;
  // }

  set prevAction(action: string) {
    this.pAction = action;
  }

  // async checkEnergyMorale(ns: NS, dName?: string) {
}

const sGetMaterial = {
  name: 'Food',
  marketPrice: 5219.034285261896,
  desiredSellPrice: 'MP',
  desiredSellAmount: 'MAX',
  stored: 0,
  quality: 9.184018552190697,
  productionAmount: 232.8615770114778,
  actualSellAmount: 232.8615770114778,
  exports: [],
};

// class Product {
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
