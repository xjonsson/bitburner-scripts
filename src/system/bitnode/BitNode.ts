/* eslint-disable */
// import { Player } from '@player';
import { NS } from '@ns';
import { getBitNodeMultipliers } from '/system/data/sBitNode';
import { BITNODE } from '/configs';
/* eslint-enable */

export class Bitnode {
  node: number;
  level: number;
  done: false;
  filename: string;
  saved: any;
  data: any;
  mults: any;

  constructor(ns: NS, node: number, level: number) {
    this.node = node;
    this.level = level;
    this.done = false;
    this.filename = `${BITNODE.TMP}/BitNode_${node}_${level}.txt`;
    const previous = ns.fileExists(this.filename);
    const saved = previous ? JSON.parse(ns.read(this.filename)) : false;

    if (this.saved) {
      this.done = saved.done;
      this.data = saved.data;
    } else {
      this.data = getBitNodeMultipliers(this.node, this.level);
    }

    this.mults = {
      player: {
        hack: this.data.HackingLevelMultiplier,
        str: this.data.StrengthLevelMultiplier,
        def: this.data.DefenseLevelMultiplier,
        dex: this.data.DexterityLevelMultiplier,
        agi: this.data.AgilityLevelMultiplier,
        cha: this.data.CharismaLevelMultiplier,
      },
      augments: {
        cost: this.data.AugmentationMoneyCost,
        rep: this.data.AugmentationRepCost,
        daedalus: this.data.DaedalusAugsRequirement,
      },
      hacking: {
        exp: this.data.HackExpGain,
        moneyManual: this.data.ManualHackMoney,
        moneyScript: this.data.ScriptHackMoney,
        moneyScriptGain: this.data.ScriptHackMoneyGain,
        server: {
          weaken: this.data.ServerWeakenRate,
          growth: this.data.ServerGrowthRate,
          moneyMax: this.data.ServerMaxMoney,
          moneyStart: this.data.ServerStartingMoney,
          secStart: this.data.ServerStartingSecurity,
        },
        daemon: this.data.WorldDaemonDifficulty,
      },
      company: {
        exp: this.data.CompanyWorkExpGain,
        money: this.data.CompanyWorkMoney,
      },
      contracts: {
        money: this.data.CodingContractMoney,
      },
      gang: {
        aug: this.data.GangUniqueAugs,
        cap: this.data.GangSoftcap,
      },
      crime: {
        exp: this.data.CrimeExpGain,
        money: this.data.CrimeMoney,
      },
      gym: {
        exp: this.data.ClassGymExpGain,
      },
      corp: {
        value: this.data.CorporationValuation,
        cap: this.data.CorporationSoftcap,
      },
      home: {
        ram: this.data.HomeComputerRamCost,
      },
      hacknet: {
        production: this.data.HacknetNodeMoney,
      },
      servers: {
        cost: this.data.PurchasedServerCost,
        limit: this.data.PurchasedServerLimit,
        cap: this.data.PurchasedServerSoftcap,
        ram: this.data.PurchasedServerMaxRam,
      },
      faction: {
        exp: this.data.FactionWorkExpGain,
        rep: this.data.FactionWorkRepGain,
        passive: this.data.FactionPassiveRepGain,
        favor: this.data.RepToDonateToFaction,
      },
      infiltration: {
        money: this.data.InfiltrationMoney,
        rep: this.data.InfiltrationRep,
      },
      stanek: {
        power: this.data.StaneksGiftPowerMultiplier,
        size: this.data.StaneksGiftExtraSize,
      },
      bladeburner: {
        rank: this.data.BladeburnerRank,
        cost: this.data.BladeburnerSkillCost,
      },
      stock: {
        data: this.data.FourSigmaMarketDataCost,
        cost: this.data.FourSigmaMarketDataApiCost,
      },
    };
  }
}

// const sample = {
//   node: 3,
//   level: 1,
//   done: false,
//   filename: '/tmp/BitNode_3_1.txt',
//   saved: false,
//   data: {
//     HackingLevelMultiplier: 0.8,
//     StrengthLevelMultiplier: 1,
//     DefenseLevelMultiplier: 1,
//     DexterityLevelMultiplier: 1,
//     AgilityLevelMultiplier: 1,
//     CharismaLevelMultiplier: 1,
//     ServerGrowthRate: 0.2,
//     ServerMaxMoney: 0.2,
//     ServerStartingMoney: 0.2,
//     ServerStartingSecurity: 1,
//     ServerWeakenRate: 1,
//     HomeComputerRamCost: 1.5,
//     PurchasedServerCost: 2,
//     PurchasedServerSoftcap: 1.3,
//     PurchasedServerLimit: 1,
//     PurchasedServerMaxRam: 1,
//     CompanyWorkMoney: 0.25,
//     CrimeMoney: 0.25,
//     HacknetNodeMoney: 0.25,
//     ManualHackMoney: 1,
//     ScriptHackMoney: 0.2,
//     ScriptHackMoneyGain: 1,
//     CodingContractMoney: 1,
//     ClassGymExpGain: 1,
//     CompanyWorkExpGain: 1,
//     CrimeExpGain: 1,
//     FactionWorkExpGain: 1,
//     HackExpGain: 1,
//     FactionPassiveRepGain: 1,
//     FactionWorkRepGain: 1,
//     RepToDonateToFaction: 0.5,
//     AugmentationMoneyCost: 3,
//     AugmentationRepCost: 3,
//     InfiltrationMoney: 1,
//     InfiltrationRep: 1,
//     FourSigmaMarketDataCost: 1,
//     FourSigmaMarketDataApiCost: 1,
//     CorporationValuation: 1,
//     CorporationSoftcap: 1,
//     BladeburnerRank: 1,
//     BladeburnerSkillCost: 1,
//     GangSoftcap: 0.9,
//     GangUniqueAugs: 0.5,
//     DaedalusAugsRequirement: 30,
//     StaneksGiftPowerMultiplier: 0.75,
//     StaneksGiftExtraSize: -2,
//     WorldDaemonDifficulty: 2,
//   },
//   mults: {
//     player: { hack: 0.8, str: 1, def: 1, dex: 1, agi: 1, cha: 1 },
//     augments: { cost: 3, rep: 3, daedalus: 30 },
//     hacking: {
//       exp: 1,
//       moneyManual: 1,
//       moneyScript: 0.2,
//       moneyScriptGain: 1,
//       server: {
//         weaken: 1,
//         growth: 0.2,
//         moneyMax: 0.2,
//         moneyStart: 0.2,
//         secStart: 1,
//       },
//       daemon: 2,
//     },
//     company: { exp: 1, money: 0.25 },
//     contracts: { money: 1 },
//     gang: { aug: 0.5, cap: 0.9 },
//     crime: { exp: 1, money: 0.25 },
//     gym: { exp: 1 },
//     corp: { value: 1, cap: 1 },
//     home: { ram: 1.5 },
//     hacknet: { production: 0.25 },
//     servers: { cost: 2, limit: 1, cap: 1.3, ram: 1 },
//     faction: { exp: 1, rep: 1, passive: 1, favor: 0.5 },
//     infiltration: { money: 1, rep: 1 },
//     stanek: { power: 0.75, size: -2 },
//     bladeburner: { rank: 1, cost: 1 },
//     stock: { data: 1, cost: 1 },
//   },
// };
