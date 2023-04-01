/**
 * Note: File from sourcode
 * BitNodeMultipliers.ts
 * BitNode.tsx
 * https://github.com/bitburner-official/bitburner-src
 */

/* eslint-disable */
// import { Player } from '@player';
import { FactionNames } from '/system/data/sFactionNames';
/* eslint-enable */

/**
 * Bitnode multipliers influence the difficulty of different aspects of the game.
 * Each Bitnode has a different theme/strategy to achieving the end goal, so these multipliers will can help drive the
 * player toward the intended strategy. Unless they really want to play the long, slow game of waiting...
 */
export interface IBitNodeMultipliers {
  AgilityLevelMultiplier: number;
  AugmentationMoneyCost: number;
  AugmentationRepCost: number;
  BladeburnerRank: number;
  BladeburnerSkillCost: number;
  CharismaLevelMultiplier: number;
  ClassGymExpGain: number;
  CodingContractMoney: number;
  CompanyWorkExpGain: number;
  CompanyWorkMoney: number;
  CorporationValuation: number;
  CrimeExpGain: number;
  CrimeMoney: number;
  DaedalusAugsRequirement: number;
  DefenseLevelMultiplier: number;
  DexterityLevelMultiplier: number;
  FactionPassiveRepGain: number;
  FactionWorkExpGain: number;
  FactionWorkRepGain: number;
  FourSigmaMarketDataApiCost: number;
  FourSigmaMarketDataCost: number;
  GangSoftcap: number;
  GangUniqueAugs: number;
  HackExpGain: number;
  HackingLevelMultiplier: number;
  HacknetNodeMoney: number;
  HomeComputerRamCost: number;
  InfiltrationMoney: number;
  InfiltrationRep: number;
  ManualHackMoney: number;
  PurchasedServerCost: number;
  PurchasedServerSoftcap: number;
  PurchasedServerLimit: number;
  PurchasedServerMaxRam: number;
  RepToDonateToFaction: number;
  ScriptHackMoney: number;
  ScriptHackMoneyGain: number;
  ServerGrowthRate: number;
  ServerMaxMoney: number;
  ServerStartingMoney: number;
  ServerStartingSecurity: number;
  ServerWeakenRate: number;
  StrengthLevelMultiplier: number;
  StaneksGiftPowerMultiplier: number;
  StaneksGiftExtraSize: number;
  WorldDaemonDifficulty: number;
  CorporationSoftcap: number;

  // Index signature
  [key: string]: number;
}

export const defaultMultipliers: IBitNodeMultipliers = {
  HackingLevelMultiplier: 1,
  StrengthLevelMultiplier: 1,
  DefenseLevelMultiplier: 1,
  DexterityLevelMultiplier: 1,
  AgilityLevelMultiplier: 1,
  CharismaLevelMultiplier: 1,

  ServerGrowthRate: 1,
  ServerMaxMoney: 1,
  ServerStartingMoney: 1,
  ServerStartingSecurity: 1,
  ServerWeakenRate: 1,

  HomeComputerRamCost: 1,

  PurchasedServerCost: 1,
  PurchasedServerSoftcap: 1,
  PurchasedServerLimit: 1,
  PurchasedServerMaxRam: 1,

  CompanyWorkMoney: 1,
  CrimeMoney: 1,
  HacknetNodeMoney: 1,
  ManualHackMoney: 1,
  ScriptHackMoney: 1,
  ScriptHackMoneyGain: 1,
  CodingContractMoney: 1,

  ClassGymExpGain: 1,
  CompanyWorkExpGain: 1,
  CrimeExpGain: 1,
  FactionWorkExpGain: 1,
  HackExpGain: 1,

  FactionPassiveRepGain: 1,
  FactionWorkRepGain: 1,
  RepToDonateToFaction: 1,

  AugmentationMoneyCost: 1,
  AugmentationRepCost: 1,

  InfiltrationMoney: 1,
  InfiltrationRep: 1,

  FourSigmaMarketDataCost: 1,
  FourSigmaMarketDataApiCost: 1,

  CorporationValuation: 1,
  CorporationSoftcap: 1,

  BladeburnerRank: 1,
  BladeburnerSkillCost: 1,

  GangSoftcap: 1,
  GangUniqueAugs: 1,

  DaedalusAugsRequirement: 30,

  StaneksGiftPowerMultiplier: 1,
  StaneksGiftExtraSize: 0,

  WorldDaemonDifficulty: 1,
};

/** The multipliers that are influenced by current Bitnode progression. */
// tslint:disable-next-line:variable-name
export const BitNodeMultipliers = { ...defaultMultipliers };

class BitNode {
  number: number; // BitNode number
  difficulty: 0 | 1 | 2;
  name: string; // Name of BitNode

  constructor(n: number, difficulty: 0 | 1 | 2, name: string) {
    this.number = n;
    this.difficulty = difficulty;
    this.name = name;
  }
}

export const BitNodes: Record<string, BitNode> = {};
export function initBitNodes() {
  BitNodes.BitNode1 = new BitNode(1, 0, 'Source Genesis');
  BitNodes.BitNode2 = new BitNode(2, 0, 'Rise of the Underworld');
  BitNodes.BitNode3 = new BitNode(3, 0, 'Corporatocracy');
  BitNodes.BitNode4 = new BitNode(4, 1, 'The Singularity');
  BitNodes.BitNode5 = new BitNode(5, 1, 'Artificial Intelligence');
  BitNodes.BitNode6 = new BitNode(6, 1, FactionNames.Bladeburners);
  BitNodes.BitNode7 = new BitNode(7, 2, `${FactionNames.Bladeburners} 2079`);
  BitNodes.BitNode8 = new BitNode(8, 2, 'Ghost of Wall Street');
  BitNodes.BitNode9 = new BitNode(9, 2, 'Hacktocracy');
  BitNodes.BitNode10 = new BitNode(10, 2, 'Digital Carbon');
  BitNodes.BitNode11 = new BitNode(11, 1, 'The Big Crash');
  BitNodes.BitNode12 = new BitNode(12, 0, 'The Recursion');
  BitNodes.BitNode13 = new BitNode(13, 2, "They're lunatics");
}

Object.freeze(defaultMultipliers);

export function getBitNodeMultipliers(
  n: number,
  lvl: number
): IBitNodeMultipliers {
  const mults = { ...defaultMultipliers };
  switch (n) {
    case 1: {
      return mults;
    }
    case 2: {
      return Object.assign(mults, {
        HackingLevelMultiplier: 0.8,
        ServerGrowthRate: 0.8,
        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.4,
        CrimeMoney: 3,
        InfiltrationMoney: 3,
        FactionWorkRepGain: 0.5,
        FactionPassiveRepGain: 0,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: -6,
        PurchasedServerSoftcap: 1.3,
        CorporationSoftcap: 0.9,
        WorldDaemonDifficulty: 5,
      });
    }
    case 3: {
      return Object.assign(mults, {
        HackingLevelMultiplier: 0.8,
        RepToDonateToFaction: 0.5,
        AugmentationRepCost: 3,
        AugmentationMoneyCost: 3,
        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.2,
        ServerGrowthRate: 0.2,
        ScriptHackMoney: 0.2,
        CompanyWorkMoney: 0.25,
        CrimeMoney: 0.25,
        HacknetNodeMoney: 0.25,
        HomeComputerRamCost: 1.5,
        PurchasedServerCost: 2,
        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -2,
        PurchasedServerSoftcap: 1.3,
        GangSoftcap: 0.9,
        WorldDaemonDifficulty: 2,
        GangUniqueAugs: 0.5,
      });
    }
    case 4: {
      return Object.assign(mults, {
        ServerMaxMoney: 0.15,
        ServerStartingMoney: 0.75,
        ScriptHackMoney: 0.2,
        CompanyWorkMoney: 0.1,
        CrimeMoney: 0.2,
        HacknetNodeMoney: 0.05,
        CompanyWorkExpGain: 0.5,
        ClassGymExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.4,
        CrimeExpGain: 0.5,
        FactionWorkRepGain: 0.75,
        StaneksGiftPowerMultiplier: 1.5,
        StaneksGiftExtraSize: 0,
        PurchasedServerSoftcap: 1.2,
        WorldDaemonDifficulty: 3,
        GangUniqueAugs: 0.5,
      });
    }
    case 5: {
      return Object.assign(mults, {
        ServerMaxMoney: 2,
        ServerStartingSecurity: 2,
        ServerStartingMoney: 0.5,
        ScriptHackMoney: 0.15,
        HacknetNodeMoney: 0.2,
        CrimeMoney: 0.5,
        InfiltrationRep: 1.5,
        InfiltrationMoney: 1.5,
        AugmentationMoneyCost: 2,
        HackExpGain: 0.5,
        CorporationValuation: 0.5,
        StaneksGiftPowerMultiplier: 1.3,
        StaneksGiftExtraSize: 0,
        PurchasedServerSoftcap: 1.2,
        WorldDaemonDifficulty: 1.5,
        GangUniqueAugs: 0.5,
      });
    }
    case 6: {
      return Object.assign(mults, {
        HackingLevelMultiplier: 0.35,
        ServerMaxMoney: 0.4,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,
        ScriptHackMoney: 0.75,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        InfiltrationMoney: 0.75,
        CorporationValuation: 0.2,
        HacknetNodeMoney: 0.2,
        HackExpGain: 0.25,
        DaedalusAugsRequirement: 35,
        PurchasedServerSoftcap: 2,
        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,
        GangSoftcap: 0.7,
        CorporationSoftcap: 0.9,
        WorldDaemonDifficulty: 2,
        GangUniqueAugs: 0.2,
      });
    }
    case 7: {
      return Object.assign(mults, {
        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,
        AugmentationMoneyCost: 3,
        HackingLevelMultiplier: 0.35,
        ServerMaxMoney: 0.4,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,
        ScriptHackMoney: 0.5,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        InfiltrationMoney: 0.75,
        CorporationValuation: 0.2,
        HacknetNodeMoney: 0.2,
        HackExpGain: 0.25,
        FourSigmaMarketDataCost: 2,
        FourSigmaMarketDataApiCost: 2,
        DaedalusAugsRequirement: 35,
        PurchasedServerSoftcap: 2,
        StaneksGiftPowerMultiplier: 0.9,
        StaneksGiftExtraSize: -1,
        GangSoftcap: 0.7,
        CorporationSoftcap: 0.9,
        WorldDaemonDifficulty: 2,
        GangUniqueAugs: 0.2,
      });
    }
    case 8: {
      return Object.assign(mults, {
        BladeburnerRank: 0,
        ScriptHackMoney: 0.3,
        ScriptHackMoneyGain: 0,
        ManualHackMoney: 0,
        CompanyWorkMoney: 0,
        CrimeMoney: 0,
        HacknetNodeMoney: 0,
        InfiltrationMoney: 0,
        RepToDonateToFaction: 0,
        CorporationValuation: 0,
        CodingContractMoney: 0,
        StaneksGiftExtraSize: -99,
        PurchasedServerSoftcap: 4,
        GangSoftcap: 0,
        CorporationSoftcap: 0,
        GangUniqueAugs: 0,
      });
    }
    case 9: {
      return Object.assign(mults, {
        HackingLevelMultiplier: 0.5,
        StrengthLevelMultiplier: 0.45,
        DefenseLevelMultiplier: 0.45,
        DexterityLevelMultiplier: 0.45,
        AgilityLevelMultiplier: 0.45,
        CharismaLevelMultiplier: 0.45,
        PurchasedServerLimit: 0,
        HomeComputerRamCost: 5,
        CrimeMoney: 0.5,
        ScriptHackMoney: 0.1,
        HackExpGain: 0.05,
        ServerStartingMoney: 0.1,
        ServerMaxMoney: 0.1,
        ServerStartingSecurity: 2.5,
        CorporationValuation: 0.5,
        FourSigmaMarketDataCost: 5,
        FourSigmaMarketDataApiCost: 4,
        BladeburnerRank: 0.9,
        BladeburnerSkillCost: 1.2,
        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,
        GangSoftcap: 0.8,
        CorporationSoftcap: 0.7,
        WorldDaemonDifficulty: 2,
        GangUniqueAugs: 0.25,
      });
    }
    case 10: {
      return Object.assign(mults, {
        HackingLevelMultiplier: 0.35,
        StrengthLevelMultiplier: 0.4,
        DefenseLevelMultiplier: 0.4,
        DexterityLevelMultiplier: 0.4,
        AgilityLevelMultiplier: 0.4,
        CharismaLevelMultiplier: 0.4,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.5,
        ManualHackMoney: 0.5,
        ScriptHackMoney: 0.5,
        CodingContractMoney: 0.5,
        InfiltrationMoney: 0.5,
        CorporationValuation: 0.5,
        AugmentationMoneyCost: 5,
        AugmentationRepCost: 2,
        HomeComputerRamCost: 1.5,
        PurchasedServerCost: 5,
        PurchasedServerLimit: 0.6,
        PurchasedServerMaxRam: 0.5,
        BladeburnerRank: 0.8,
        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -3,
        PurchasedServerSoftcap: 1.1,
        GangSoftcap: 0.9,
        CorporationSoftcap: 0.9,
        WorldDaemonDifficulty: 2,
        GangUniqueAugs: 0.25,
      });
    }
    case 11: {
      return Object.assign(mults, {
        HackingLevelMultiplier: 0.6,
        HackExpGain: 0.5,
        ServerMaxMoney: 0.1,
        ServerStartingMoney: 0.1,
        ServerGrowthRate: 0.2,
        ServerWeakenRate: 2,
        CrimeMoney: 3,
        CompanyWorkMoney: 0.5,
        HacknetNodeMoney: 0.1,
        AugmentationMoneyCost: 2,
        InfiltrationMoney: 2.5,
        InfiltrationRep: 2.5,
        CorporationValuation: 0.1,
        CodingContractMoney: 0.25,
        FourSigmaMarketDataCost: 4,
        FourSigmaMarketDataApiCost: 4,
        PurchasedServerSoftcap: 2,
        CorporationSoftcap: 0.9,
        WorldDaemonDifficulty: 1.5,
        GangUniqueAugs: 0.75,
      });
    }
    case 12: {
      const inc = 1.02 ** lvl;
      const dec = 1 / inc;

      return Object.assign(mults, {
        DaedalusAugsRequirement: Math.floor(
          Math.min(mults.DaedalusAugsRequirement + inc, 40)
        ),

        HackingLevelMultiplier: dec,
        StrengthLevelMultiplier: dec,
        DefenseLevelMultiplier: dec,
        DexterityLevelMultiplier: dec,
        AgilityLevelMultiplier: dec,
        CharismaLevelMultiplier: dec,

        ServerMaxMoney: dec,
        ServerStartingMoney: dec,
        ServerGrowthRate: dec,
        ServerWeakenRate: dec,

        // Does not scale, otherwise security might start at 300+
        ServerStartingSecurity: 1.5,

        HomeComputerRamCost: inc,

        PurchasedServerCost: inc,
        PurchasedServerLimit: dec,
        PurchasedServerMaxRam: dec,
        PurchasedServerSoftcap: inc,

        ManualHackMoney: dec,
        ScriptHackMoney: dec,
        CompanyWorkMoney: dec,
        CrimeMoney: dec,
        HacknetNodeMoney: dec,
        CodingContractMoney: dec,

        CompanyWorkExpGain: dec,
        ClassGymExpGain: dec,
        FactionWorkExpGain: dec,
        HackExpGain: dec,
        CrimeExpGain: dec,

        FactionWorkRepGain: dec,
        FactionPassiveRepGain: dec,
        RepToDonateToFaction: inc,

        AugmentationRepCost: inc,
        AugmentationMoneyCost: inc,

        InfiltrationMoney: dec,
        InfiltrationRep: dec,

        FourSigmaMarketDataCost: inc,
        FourSigmaMarketDataApiCost: inc,

        CorporationValuation: dec,

        BladeburnerRank: dec,
        BladeburnerSkillCost: inc,

        StaneksGiftPowerMultiplier: inc,
        StaneksGiftExtraSize: inc,
        GangSoftcap: 0.8,
        CorporationSoftcap: 0.8,
        WorldDaemonDifficulty: inc,

        GangUniqueAugs: dec,
      });
    }
    case 13: {
      return Object.assign(mults, {
        PurchasedServerSoftcap: 1.6,

        HackingLevelMultiplier: 0.25,
        StrengthLevelMultiplier: 0.7,
        DefenseLevelMultiplier: 0.7,
        DexterityLevelMultiplier: 0.7,
        AgilityLevelMultiplier: 0.7,

        ServerMaxMoney: 0.45,
        ServerStartingMoney: 0.75,

        ServerStartingSecurity: 3,

        ScriptHackMoney: 0.2,
        CompanyWorkMoney: 0.4,
        CrimeMoney: 0.4,
        HacknetNodeMoney: 0.4,
        CodingContractMoney: 0.4,

        CompanyWorkExpGain: 0.5,
        ClassGymExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.1,
        CrimeExpGain: 0.5,

        FactionWorkRepGain: 0.6,

        FourSigmaMarketDataCost: 10,
        FourSigmaMarketDataApiCost: 10,

        CorporationValuation: 0.001,

        BladeburnerRank: 0.45,
        BladeburnerSkillCost: 2,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: 1,
        GangSoftcap: 0.3,
        CorporationSoftcap: 0.3,
        WorldDaemonDifficulty: 3,
        GangUniqueAugs: 0.1,
      });
    }
    default: {
      throw new Error('Invalid BitNodeN');
    }
  }
}

// export function initBitNodeMultipliers(): void {
//   Object.assign(
//     BitNodeMultipliers,
//     getBitNodeMultipliers(
//       Player.bitNodeN,
//       Player.sourceFileLvl(Player.bitNodeN)
//     )
//   );
// }
