/* eslint-disable */
// import { Player } from '@player';
import { NS } from '@ns';
/* eslint-enable */

export class Player {
  id: string;
  data: any;
  hp: object;
  programs: any;
  challenge: number;
  bitnode: number;
  city: string;
  location: string;
  playtime: object;
  money: number;
  level: number;
  levelRange: object;
  hack: object;
  hacknet: object;
  int: object;
  str: object;
  def: object;
  dex: object;
  agi: object;
  cha: object;
  work: any;
  faction: object;
  company: object;
  crime: object;
  bladeburner: any;
  entropy: any;

  constructor(ns: NS) {
    this.id = 'player';
    this.data = ns.getPlayer();
    this.hp = {
      now: this.data.hp.current,
      max: this.data.hp.max,
    };

    this.programs = {
      tor: ns.hasTorRouter(),
      ssh: ns.fileExists('BruteSSH.exe', 'home'),
      ftp: ns.fileExists('FTPCrack.exe', 'home'),
      smtp: ns.fileExists('relaySMTP.exe', 'home'),
      http: ns.fileExists('HTTPWorm.exe', 'home'),
      sql: ns.fileExists('SQLInject.exe', 'home'),
    };

    this.challenge = Object.keys(this.programs)
      .filter((prog) => this.programs[prog] && prog !== 'tor')
      .reduce((total) => total + 1, 0);

    this.bitnode = this.data.bitNodeN;
    this.city = this.data.city;
    this.location = this.data.location;
    this.playtime = {
      total: this.data.totalPlaytime,
      aug: this.data.playtimeSinceLastAug,
      node: this.data.playtimeSinceLastBitnode,
    };
    this.money = this.data.money;
    this.level = this.data.skills.hacking;
    this.levelRange = {
      min: this.level * 0.25 < 1 ? 1 : Math.ceil(this.level * 0.25),
      max: Math.ceil(this.level * 0.8),
    };

    this.hack = {
      level: this.data.skills.hacking,
      exp: this.data.exp.hacking,
      mults: {
        level: this.data.mults.hacking,
        exp: this.data.mults.hacking_exp,
        chance: this.data.mults.hacking_chance,
        grow: this.data.mults.hacking_grow,
        speed: this.data.mults.hacking_speed,
        money: this.data.mults.hacking_money,
      },
    };

    this.hacknet = {
      production: this.data.mults.hacknet_node_money,
      node: this.data.mults.hacknet_node_purchase_cost,
      level: this.data.mults.hacknet_node_level_cost,
      ram: this.data.mults.hacknet_node_ram_cost,
      cores: this.data.mults.hacknet_node_core_cost,
    };

    this.int = {
      level: this.data.skills.intelligence,
      exp: this.data.exp.intelligence,
    };

    this.str = {
      level: this.data.skills.strength,
      exp: this.data.exp.strength,
      mults: {
        level: this.data.mults.strength,
        exp: this.data.mults.strength_exp,
      },
    };

    this.def = {
      level: this.data.skills.defense,
      exp: this.data.exp.defense,
      mults: {
        level: this.data.mults.defense,
        exp: this.data.mults.defense_exp,
      },
    };

    this.dex = {
      level: this.data.skills.dexterity,
      exp: this.data.exp.dexterity,
      mults: {
        level: this.data.mults.dexterity,
        exp: this.data.mults.dexterity_exp,
      },
    };

    this.agi = {
      level: this.data.skills.agility,
      exp: this.data.exp.agility,
      mults: {
        level: this.data.mults.agility,
        exp: this.data.mults.agility_exp,
      },
    };

    this.cha = {
      level: this.data.skills.charisma,
      exp: this.data.exp.charisma,
      mults: {
        level: this.data.mults.charisma,
        exp: this.data.mults.charisma_exp,
      },
    };

    this.work = {
      jobs: this.data.jobs,
      mults: {
        money: this.data.mults.work_money,
      },
    };

    this.faction = {
      factions: this.data.factions,
      mults: {
        rep: this.data.mults.faction_rep,
      },
    };

    this.company = {
      mults: {
        rep: this.data.mults.company_rep,
      },
    };

    this.crime = {
      kills: this.data.numPeopleKilled,
      mults: {
        chance: this.data.mults.crime_success,
        money: this.data.mults.crime_money,
      },
    };

    this.bladeburner = {
      mults: {
        staminaMax: this.data.mults.bladeburner_max_stamina,
        staminaGain: this.data.mults.bladeburner_stamina_gain,
        analysis: this.data.mults.bladeburner_analysis,
        chance: this.data.mults.bladeburner_success_chance,
      },
    };

    this.entropy = this.data.entropy;
  }
}
