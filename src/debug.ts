/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export class Player {
  id: string;
  data: any;
  hp: { now: boolean; max: boolean };
  programs: any;
  challenge: number;
  bitnode: number;
  city: string;
  location: string;
  playtime: { total: number; aug: number; node: number };
  money: number;
  level: number;
  levelRange: { min: number; max: number };
  hack: {
    level: number;
    exp: number;
    mults: {
      level: number;
      exp: number;
      chance: number;
      grow: number;
      speed: number;
      money: number;
    };
  };
  hacknet: {
    production: number;
    node: number;
    level: number;
    ram: number;
    cores: number;
  };
  int: {
    level: number;
    exp: number;
  };
  str: {
    level: number;
    exp: number;
    mults: {
      level: number;
      exp: number;
    };
  };
  def: {
    level: number;
    exp: number;
    mults: {
      level: number;
      exp: number;
    };
  };
  dex: {
    level: number;
    exp: number;
    mults: {
      level: number;
      exp: number;
    };
  };
  agi: {
    level: number;
    exp: number;
    mults: {
      level: number;
      exp: number;
    };
  };
  cha: {
    level: number;
    exp: number;
    mults: {
      level: number;
      exp: number;
    };
  };
  work: {
    jobs: any;
    mults: {
      money: number;
    };
  };
  faction: {
    factions: any;
    mults: {
      rep: number;
    };
  };
  company: { mults: { rep: number } };
  crime: {
    kills: number;
    mults: {
      chance: number;
      money: number;
    };
  };
  bladeburner: {
    mults: {
      staminaMax: number;
      staminaGain: number;
      analysis: number;
      chance: number;
    };
  };
  entropy: number;

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

    this.bitnode = this.data.bitNodeN; // FIXME: Deprecated Use ns.getResetInfo().currentNode instead
    this.city = this.data.city;
    this.location = this.data.location;
    this.playtime = {
      total: this.data.totalPlaytime,
      aug: this.data.playtimeSinceLastAug, // FIXME: Deprecated Use ns.getResetInfo().lastAugReset instead
      node: this.data.playtimeSinceLastBitnode, // FIXME: Deprecated Use ns.getResetInfo().lastNodeReset instead
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

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.disableLog('ALL');
  const p = new Player(ns);

  ns.print(
    `[Node] ${p.bitnode} [City] ${p.city} [Location] ${p.location} [Entropy] ${p.entropy}`
  );
  ns.print(`[HP] ${p.hp.now} / ${p.hp.max}`);
  ns.print(`[Money] ${ns.formatNumber(p.money, 2)}`);
  ns.print(`[Level] ${p.level} (${p.levelRange.min} - ${p.levelRange.max})`);
  ns.print(`[Challenge] ${p.challenge}`);
  ns.print(`  [Tor] ${p.programs.tor}`);
  ns.print(`  [SSH] ${p.programs.ssh}`);
  ns.print(`  [FTP] ${p.programs.ftp}`);
  ns.print(`  [SMTP] ${p.programs.smtp}`);
  ns.print(`  [HTTP] ${p.programs.http}`);
  ns.print(`  [SQL] ${p.programs.sql}`);
  ns.print(`[Playtime] ${ns.tFormat(p.playtime.total)}`);
  ns.print(`  [Augment] ${ns.tFormat(p.playtime.aug)}`);
  ns.print(`  [Bitnode] ${ns.tFormat(p.playtime.node)}`);
  ns.print(`[Hack]`);
  ns.print(
    `  [Mults] Chance: ${p.hack.mults.chance} Grow: ${p.hack.mults.grow} Speed: ${p.hack.mults.speed} Money: ${p.hack.mults.money}`
  );
  ns.print(
    `[Hacknet] Production: ${p.hacknet.production} Node: ${p.hacknet.node} Level: ${p.hacknet.level} Ram: ${p.hacknet.ram} Cores: ${p.hacknet.cores}`
  );
  ns.print(`[Stats]`);
  const header = ' %4s | %5s | %5s | %5s | %6s ';
  ns.printf(header, 'Stat', 'Level', 'EXP', 'Level', 'EXP');
  ns.printf(
    header,
    'HACK',
    p.hack.mults.level,
    p.hack.mults.exp,
    p.hack.level,
    ns.formatNumber(p.hack.exp, 2)
  );
  ns.printf(header, 'INT', '', '', p.int.level, p.int.exp);
  ns.printf(
    header,
    'STR',
    p.str.mults.level,
    p.str.mults.exp,
    p.str.level,
    ns.formatNumber(p.str.exp)
  );
  ns.printf(
    header,
    'DEF',
    p.def.mults.level,
    p.def.mults.exp,
    p.def.level,
    ns.formatNumber(p.def.exp)
  );
  ns.printf(
    header,
    'DEX',
    p.dex.mults.level,
    p.dex.mults.exp,
    p.dex.level,
    ns.formatNumber(p.dex.exp)
  );
  ns.printf(
    header,
    'AGI',
    p.agi.mults.level,
    p.agi.mults.exp,
    p.agi.level,
    ns.formatNumber(p.agi.exp)
  );
  ns.printf(
    header,
    'CHA',
    p.cha.mults.level,
    p.cha.mults.exp,
    p.cha.level,
    ns.formatNumber(p.cha.exp)
  );
  ns.print(`[Work] ${p.work.mults.money}`);
  ns.print(p.work.jobs);
  ns.print(`[Faction] ${p.faction.mults.rep}`);
  ns.print(p.faction.factions);
  ns.print(`[Company] ${p.company.mults.rep}`);
  ns.print(
    `[Crime] Kills ${p.crime.kills} | [Chance] ${p.crime.mults.chance} [Money] ${p.crime.mults.money}`
  );
  ns.print(`[Bladeburner]`);
  ns.print(p.bladeburner);
}
