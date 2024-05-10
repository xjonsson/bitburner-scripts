export interface IBNMults {
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
  CompanyWorkRepGain: number;
  CorporationValuation: number;
  CrimeExpGain: number;
  CrimeMoney: number;
  CrimeSuccessRate: number;
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
  GoPower: number;
  HackExpGain: number;
  HackingLevelMultiplier: number;
  HackingSpeedMultiplier: number;
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
  CorporationDivisions: number;
}

const mDefault: IBNMults = {
  AgilityLevelMultiplier: 1,
  AugmentationMoneyCost: 1,
  AugmentationRepCost: 1,
  BladeburnerRank: 1,
  BladeburnerSkillCost: 1,
  CharismaLevelMultiplier: 1,
  ClassGymExpGain: 1,
  CodingContractMoney: 1,
  CompanyWorkExpGain: 1,
  CompanyWorkMoney: 1,
  CompanyWorkRepGain: 1,
  CorporationValuation: 1,
  CrimeExpGain: 1,
  CrimeMoney: 1,
  CrimeSuccessRate: 1,
  DaedalusAugsRequirement: 30,
  DefenseLevelMultiplier: 1,
  DexterityLevelMultiplier: 1,
  FactionPassiveRepGain: 1,
  FactionWorkExpGain: 1,
  FactionWorkRepGain: 1,
  FourSigmaMarketDataApiCost: 1,
  FourSigmaMarketDataCost: 1,
  GangSoftcap: 1,
  GangUniqueAugs: 1,
  GoPower: 1,
  HackExpGain: 1,
  HackingLevelMultiplier: 1,
  HackingSpeedMultiplier: 1,
  HacknetNodeMoney: 1,
  HomeComputerRamCost: 1,
  InfiltrationMoney: 1,
  InfiltrationRep: 1,
  ManualHackMoney: 1,
  PurchasedServerCost: 1,
  PurchasedServerSoftcap: 1,
  PurchasedServerLimit: 1,
  PurchasedServerMaxRam: 1,
  RepToDonateToFaction: 1,
  ScriptHackMoney: 1,
  ScriptHackMoneyGain: 1,
  ServerGrowthRate: 1,
  ServerMaxMoney: 1,
  ServerStartingMoney: 1,
  ServerStartingSecurity: 1,
  ServerWeakenRate: 1,
  StrengthLevelMultiplier: 1,
  StaneksGiftPowerMultiplier: 1,
  StaneksGiftExtraSize: 0,
  WorldDaemonDifficulty: 1,
  CorporationSoftcap: 1,
  CorporationDivisions: 1,
};

export function getBNMults(n: number, lvl: number): IBNMults {
  switch (n) {
    case 1: {
      return mDefault;
    }
    case 2: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.8,
        ServerGrowthRate: 0.8,
        ServerMaxMoney: 0.08,
        ServerStartingMoney: 0.4,
        PurchasedServerSoftcap: 1.3,
        CrimeMoney: 3,
        FactionPassiveRepGain: 0,
        FactionWorkRepGain: 0.5,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,
        InfiltrationMoney: 3,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: -6,
        WorldDaemonDifficulty: 5,
        // DEFAULT
      };
    }
    case 3: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.8,
        ServerGrowthRate: 0.2,
        ServerMaxMoney: 0.04,
        ServerStartingMoney: 0.2,
        HomeComputerRamCost: 1.5,
        PurchasedServerCost: 2,
        PurchasedServerSoftcap: 1.3,
        CompanyWorkMoney: 0.25,
        CrimeMoney: 0.25,
        HacknetNodeMoney: 0.25,
        ScriptHackMoney: 0.2,
        RepToDonateToFaction: 0.5,
        AugmentationMoneyCost: 3,
        AugmentationRepCost: 3,
        GangSoftcap: 0.9,
        GangUniqueAugs: 0.5,
        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -2,
        WorldDaemonDifficulty: 2,
      };
    }
    case 4: {
      return {
        // SOURCE
        ...mDefault,
        ServerMaxMoney: 0.1125,
        ServerStartingMoney: 0.75,
        PurchasedServerSoftcap: 1.2,
        CompanyWorkMoney: 0.1,
        CrimeMoney: 0.2,
        HacknetNodeMoney: 0.05,
        ScriptHackMoney: 0.2,
        ClassGymExpGain: 0.5,
        CompanyWorkExpGain: 0.5,
        CrimeExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.4,
        FactionWorkRepGain: 0.75,
        GangUniqueAugs: 0.5,
        StaneksGiftPowerMultiplier: 1.5,
        StaneksGiftExtraSize: 0,
        WorldDaemonDifficulty: 3,
      };
    }
    case 5: {
      return {
        // SOURCE
        ...mDefault,
        ServerStartingSecurity: 2,
        ServerStartingMoney: 0.5,
        PurchasedServerSoftcap: 1.2,
        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.15,
        HackExpGain: 0.5,
        AugmentationMoneyCost: 2,
        InfiltrationMoney: 1.5,
        InfiltrationRep: 1.5,
        CorporationValuation: 0.75,
        CorporationDivisions: 0.75,
        GangUniqueAugs: 0.5,
        StaneksGiftPowerMultiplier: 1.3,
        StaneksGiftExtraSize: 0,
        WorldDaemonDifficulty: 1.5,
      };
    }
    case 6: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.35,
        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,
        PurchasedServerSoftcap: 2,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.75,
        HackExpGain: 0.25,
        InfiltrationMoney: 0.75,
        CorporationValuation: 0.2,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,
        GangSoftcap: 0.7,
        GangUniqueAugs: 0.2,
        DaedalusAugsRequirement: 35,
        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,
        WorldDaemonDifficulty: 2,
      };
    }
    case 7: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.35,
        ServerMaxMoney: 0.2,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,
        PurchasedServerSoftcap: 2,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.75,
        HacknetNodeMoney: 0.2,
        ScriptHackMoney: 0.5,
        HackExpGain: 0.25,
        AugmentationMoneyCost: 3,
        InfiltrationMoney: 0.75,
        FourSigmaMarketDataCost: 2,
        FourSigmaMarketDataApiCost: 2,
        CorporationValuation: 0.2,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,
        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,
        GangSoftcap: 0.7,
        GangUniqueAugs: 0.2,
        DaedalusAugsRequirement: 35,
        StaneksGiftPowerMultiplier: 0.9,
        StaneksGiftExtraSize: -1,
        WorldDaemonDifficulty: 2,
      };
    }
    case 8: {
      return {
        // SOURCE
        ...mDefault,
        PurchasedServerSoftcap: 4,
        CompanyWorkMoney: 0,
        CrimeMoney: 0,
        HacknetNodeMoney: 0,
        ManualHackMoney: 0,
        ScriptHackMoney: 0.3,
        ScriptHackMoneyGain: 0,
        CodingContractMoney: 0,
        RepToDonateToFaction: 0,
        InfiltrationMoney: 0,
        CorporationValuation: 0,
        CorporationSoftcap: 0,
        CorporationDivisions: 0,
        BladeburnerRank: 0,
        GangSoftcap: 0,
        GangUniqueAugs: 0,
        StaneksGiftExtraSize: -99,
      };
    }
    case 9: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.5,
        StrengthLevelMultiplier: 0.45,
        DefenseLevelMultiplier: 0.45,
        DexterityLevelMultiplier: 0.45,
        AgilityLevelMultiplier: 0.45,
        CharismaLevelMultiplier: 0.45,
        ServerMaxMoney: 0.01,
        ServerStartingMoney: 0.1,
        ServerStartingSecurity: 2.5,
        HomeComputerRamCost: 5,
        PurchasedServerLimit: 0,
        CrimeMoney: 0.5,
        ScriptHackMoney: 0.1,
        HackExpGain: 0.05,
        FourSigmaMarketDataCost: 5,
        FourSigmaMarketDataApiCost: 4,
        CorporationValuation: 0.5,
        CorporationSoftcap: 0.75,
        CorporationDivisions: 0.8,
        BladeburnerRank: 0.9,
        BladeburnerSkillCost: 1.2,
        GangSoftcap: 0.8,
        GangUniqueAugs: 0.25,
        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: 2,
        WorldDaemonDifficulty: 2,
      };
    }
    case 10: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.35,
        StrengthLevelMultiplier: 0.4,
        DefenseLevelMultiplier: 0.4,
        DexterityLevelMultiplier: 0.4,
        AgilityLevelMultiplier: 0.4,
        CharismaLevelMultiplier: 0.4,
        HomeComputerRamCost: 1.5,
        PurchasedServerCost: 5,
        PurchasedServerSoftcap: 1.1,
        PurchasedServerLimit: 0.6,
        PurchasedServerMaxRam: 0.5,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 0.5,
        HacknetNodeMoney: 0.5,
        ManualHackMoney: 0.5,
        ScriptHackMoney: 0.5,
        CodingContractMoney: 0.5,
        AugmentationMoneyCost: 5,
        AugmentationRepCost: 2,
        InfiltrationMoney: 0.5,
        CorporationValuation: 0.5,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,
        BladeburnerRank: 0.8,
        GangSoftcap: 0.9,
        GangUniqueAugs: 0.25,
        StaneksGiftPowerMultiplier: 0.75,
        StaneksGiftExtraSize: -3,
        WorldDaemonDifficulty: 2,
      };
    }
    case 11: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.6,
        ServerGrowthRate: 0.2,
        ServerMaxMoney: 0.01,
        ServerStartingMoney: 0.1,
        ServerWeakenRate: 2,
        PurchasedServerSoftcap: 2,
        CompanyWorkMoney: 0.5,
        CrimeMoney: 3,
        HacknetNodeMoney: 0.1,
        CodingContractMoney: 0.25,
        HackExpGain: 0.5,
        AugmentationMoneyCost: 2,
        InfiltrationMoney: 2.5,
        InfiltrationRep: 2.5,
        FourSigmaMarketDataCost: 4,
        FourSigmaMarketDataApiCost: 4,
        CorporationValuation: 0.1,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.9,
        GangUniqueAugs: 0.75,
        WorldDaemonDifficulty: 1.5,
      };
    }
    case 12: {
      const inc = 1.02 ** lvl;
      const dec = 1 / inc;

      return {
        // SOURCE
        ...mDefault,
        // DaedalusAugsRequirement: 30
        DaedalusAugsRequirement: Math.floor(Math.min(30 + inc, 40)),
        HackingLevelMultiplier: dec,
        StrengthLevelMultiplier: dec,
        DefenseLevelMultiplier: dec,
        DexterityLevelMultiplier: dec,
        AgilityLevelMultiplier: dec,
        CharismaLevelMultiplier: dec,
        ServerGrowthRate: dec,
        ServerMaxMoney: dec * dec,
        ServerStartingMoney: dec,
        ServerWeakenRate: dec,
        // Does not scale, otherwise security might start at 300+
        ServerStartingSecurity: 1.5,
        HomeComputerRamCost: inc,
        PurchasedServerCost: inc,
        PurchasedServerSoftcap: inc,
        PurchasedServerLimit: dec,
        PurchasedServerMaxRam: dec,
        CompanyWorkMoney: dec,
        CrimeMoney: dec,
        HacknetNodeMoney: dec,
        ManualHackMoney: dec,
        ScriptHackMoney: dec,
        CodingContractMoney: dec,
        ClassGymExpGain: dec,
        CompanyWorkExpGain: dec,
        CrimeExpGain: dec,
        FactionWorkExpGain: dec,
        HackExpGain: dec,
        FactionPassiveRepGain: dec,
        FactionWorkRepGain: dec,
        RepToDonateToFaction: inc,
        AugmentationMoneyCost: inc,
        AugmentationRepCost: inc,
        InfiltrationMoney: dec,
        InfiltrationRep: dec,
        FourSigmaMarketDataCost: inc,
        FourSigmaMarketDataApiCost: inc,
        CorporationValuation: dec,
        CorporationSoftcap: 0.8,
        CorporationDivisions: 0.5,
        BladeburnerRank: dec,
        BladeburnerSkillCost: inc,
        GangSoftcap: 0.8,
        GangUniqueAugs: dec,
        StaneksGiftPowerMultiplier: inc,
        StaneksGiftExtraSize: inc,
        WorldDaemonDifficulty: inc,
      };
    }
    case 13: {
      return {
        // SOURCE
        ...mDefault,
        HackingLevelMultiplier: 0.25,
        StrengthLevelMultiplier: 0.7,
        DefenseLevelMultiplier: 0.7,
        DexterityLevelMultiplier: 0.7,
        AgilityLevelMultiplier: 0.7,
        PurchasedServerSoftcap: 1.6,
        ServerMaxMoney: 0.3375,
        ServerStartingMoney: 0.75,
        ServerStartingSecurity: 3,
        CompanyWorkMoney: 0.4,
        CrimeMoney: 0.4,
        HacknetNodeMoney: 0.4,
        ScriptHackMoney: 0.2,
        CodingContractMoney: 0.4,
        ClassGymExpGain: 0.5,
        CompanyWorkExpGain: 0.5,
        CrimeExpGain: 0.5,
        FactionWorkExpGain: 0.5,
        HackExpGain: 0.1,
        FactionWorkRepGain: 0.6,
        FourSigmaMarketDataCost: 10,
        FourSigmaMarketDataApiCost: 10,
        CorporationValuation: 0.001,
        CorporationSoftcap: 0.4,
        CorporationDivisions: 0.4,
        BladeburnerRank: 0.45,
        BladeburnerSkillCost: 2,
        GangSoftcap: 0.3,
        GangUniqueAugs: 0.1,
        StaneksGiftPowerMultiplier: 2,
        StaneksGiftExtraSize: 1,
        WorldDaemonDifficulty: 3,
      };
    }
    case 14: {
      return {
        // SOURCE
        ...mDefault,
        GoPower: 4,
        HackingLevelMultiplier: 0.4,
        HackingSpeedMultiplier: 0.3,
        ServerMaxMoney: 0.7,
        ServerStartingMoney: 0.5,
        ServerStartingSecurity: 1.5,
        CrimeMoney: 0.75,
        CrimeSuccessRate: 0.4,
        HacknetNodeMoney: 0.25,
        ScriptHackMoney: 0.3,
        StrengthLevelMultiplier: 0.5,
        DexterityLevelMultiplier: 0.5,
        AgilityLevelMultiplier: 0.5,
        AugmentationMoneyCost: 1.5,
        InfiltrationMoney: 0.75,
        FactionWorkRepGain: 0.2,
        CompanyWorkRepGain: 0.2,
        CorporationValuation: 0.4,
        CorporationSoftcap: 0.9,
        CorporationDivisions: 0.8,
        BladeburnerRank: 0.6,
        BladeburnerSkillCost: 2,
        GangSoftcap: 0.7,
        GangUniqueAugs: 0.4,
        StaneksGiftPowerMultiplier: 0.5,
        StaneksGiftExtraSize: -1,
        WorldDaemonDifficulty: 5,
      };
    }
    default: {
      throw new Error('Invalid BitNodeN');
    }
  }
}
