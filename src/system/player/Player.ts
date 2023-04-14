/* eslint-disable */
// import { Player } from '@player';
import { NS } from '@ns';
import { PATHS } from '/configs';
import { getBitNodeMultipliers } from '/system/data/sBitnode';
/* eslint-enable */

export class Player {
  id: string;
  data: any;

  constructor(ns: NS) {
    this.id = 'player';
    this.data = ns.getPlayer();

    // this.mults = {
    //   player: {
    //     hack: this.data.HackingLevelMultiplier,
    //     str: this.data.StrengthLevelMultiplier,
    //     def: this.data.DefenseLevelMultiplier,
    //     dex: this.data.DexterityLevelMultiplier,
    //     agi: this.data.AgilityLevelMultiplier,
    //     cha: this.data.CharismaLevelMultiplier,
    //   },
    //   augments: {
    //     cost: this.data.AugmentationMoneyCost,
    //     rep: this.data.AugmentationRepCost,
    //     daedalus: this.data.DaedalusAugsRequirement,
    //   },
    //   hacking: {
    //     exp: this.data.HackExpGain,
    //     moneyManual: this.data.ManualHackMoney,
    //     moneyScript: this.data.ScriptHackMoney,
    //     moneyScriptGain: this.data.ScriptHackMoneyGain,
    //     server: {
    //       weaken: this.data.ServerWeakenRate,
    //       growth: this.data.ServerGrowthRate,
    //       moneyMax: this.data.ServerMaxMoney,
    //       moneyStart: this.data.ServerStartingMoney,
    //       secStart: this.data.ServerStartingSecurity,
    //     },
    //     daemon: this.data.WorldDaemonDifficulty,
    //   },
    //   company: {
    //     exp: this.data.CompanyWorkExpGain,
    //     money: this.data.CompanyWorkMoney,
    //   },
    //   contracts: {
    //     money: this.data.CodingContractMoney,
    //   },
    //   gang: {
    //     aug: this.data.GangUniqueAugs,
    //     cap: this.data.GangSoftcap,
    //   },
    //   crime: {
    //     exp: this.data.CrimeExpGain,
    //     money: this.data.CrimeMoney,
    //   },
    //   gym: {
    //     exp: this.data.ClassGymExpGain,
    //   },
    //   corp: {
    //     value: this.data.CorporationValuation,
    //     cap: this.data.CorporationSoftcap,
    //   },
    //   home: {
    //     ram: this.data.HomeComputerRamCost,
    //   },
    //   hacknet: {
    //     production: this.data.HacknetNodeMoney,
    //   },
    //   servers: {
    //     cost: this.data.PurchasedServerCost,
    //     limit: this.data.PurchasedServerLimit,
    //     cap: this.data.PurchasedServerSoftcap,
    //     ram: this.data.PurchasedServerMaxRam,
    //   },
    //   faction: {
    //     exp: this.data.FactionWorkExpGain,
    //     rep: this.data.FactionWorkRepGain,
    //     passive: this.data.FactionPassiveRepGain,
    //     favor: this.data.RepToDonateToFaction,
    //   },
    //   infiltration: {
    //     money: this.data.InfiltrationMoney,
    //     rep: this.data.InfiltrationRep,
    //   },
    //   stanek: {
    //     power: this.data.StaneksGiftPowerMultiplier,
    //     size: this.data.StaneksGiftExtraSize,
    //   },
    //   bladeburner: {
    //     rank: this.data.BladeburnerRank,
    //     cost: this.data.BladeburnerSkillCost,
    //   },
    //   stock: {
    //     data: this.data.FourSigmaMarketDataCost,
    //     cost: this.data.FourSigmaMarketDataApiCost,
    //   },
    // };
  }
}

const sample = {
  id: 'player',
  data: {
    hp: { current: 10, max: 10 },
    skills: {
      hacking: 11,
      strength: 1,
      defense: 1,
      dexterity: 1,
      agility: 1,
      charisma: 1,
      intelligence: 0,
    },
    exp: {
      hacking: 206.97600000000003,
      strength: 0,
      defense: 0,
      dexterity: 0,
      agility: 0,
      charisma: 0,
      intelligence: 0,
    },
    mults: {
      hacking_chance: 1.28,
      hacking_speed: 1.28,
      hacking_money: 1.28,
      hacking_grow: 1.28,
      hacking: 1.28,
      strength: 1.28,
      defense: 1.28,
      dexterity: 1.28,
      agility: 1.28,
      charisma: 1.28,
      hacking_exp: 1.28,
      strength_exp: 1.28,
      defense_exp: 1.28,
      dexterity_exp: 1.28,
      agility_exp: 1.28,
      charisma_exp: 1.28,
      company_rep: 1.28,
      faction_rep: 1.28,
      crime_money: 1.28,
      crime_success: 1.28,
      hacknet_node_money: 1.28,
      hacknet_node_purchase_cost: 0.72,
      hacknet_node_ram_cost: 0.72,
      hacknet_node_core_cost: 0.72,
      hacknet_node_level_cost: 0.72,
      work_money: 1.28,
      bladeburner_max_stamina: 1,
      bladeburner_stamina_gain: 1,
      bladeburner_analysis: 1,
      bladeburner_success_chance: 1,
    },
    numPeopleKilled: 0,
    money: 1041,
    city: 'Sector-12',
    location: 'Travel Agency',
    bitNodeN: 3,
    totalPlaytime: 3711140800,
    playtimeSinceLastAug: 1401973200,
    playtimeSinceLastBitnode: 1401973200,
    jobs: {},
    factions: [],
    entropy: 0,
  },
};
