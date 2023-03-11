/* eslint-disable-next-line */
import { NS } from '@ns';

export default class Player {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  get data(): any {
    return this.ns.getPlayer();
  }

  get hacking(): number {
    return this.data.skills.hacking;
  }

  get money(): number {
    return this.data.money;
  }

  get programs(): any {
    return {
      tor: this.ns.hasTorRouter(),
      ssh: this.ns.fileExists('BruteSSH.exe', 'home'),
      ftp: this.ns.fileExists('FTPCrack.exe', 'home'),
      smtp: this.ns.fileExists('relaySMTP.exe', 'home'),
      http: this.ns.fileExists('HTTPWorm.exe', 'home'),
      sql: this.ns.fileExists('SQLInject.exe', 'home'),
    };
  }

  get challenge(): number {
    return Object.keys(this.programs)
      .filter((prog) => this.programs[prog] && prog !== 'tor')
      .reduce((total) => total + 1, 0);
  }
}

/* eslint-disable-next-line */
const sample = {
  hp: { current: 10, max: 10 },
  skills: {
    hacking: 612,
    strength: 1,
    defense: 1,
    dexterity: 1,
    agility: 1,
    charisma: 1,
    intelligence: 0,
  },
  exp: {
    hacking: 30754066.23128202,
    strength: 0,
    defense: 0,
    dexterity: 0,
    agility: 0,
    charisma: 0,
    intelligence: 0,
  },
  mults: {
    hacking_chance: 1.407973673902167,
    hacking_speed: 1.3073219008560546,
    hacking_money: 1.668903035443714,
    hacking_grow: 1.1609760246564969,
    hacking: 1.7412440120592865,
    strength: 1.1609760246564969,
    defense: 1.1609760246564969,
    dexterity: 1.6091127701739047,
    agility: 1.2190248258893217,
    charisma: 1.3931712295877963,
    hacking_exp: 2.482726911647488,
    strength_exp: 1.468634671190469,
    defense_exp: 1.468634671190469,
    dexterity_exp: 1.468634671190469,
    agility_exp: 1.468634671190469,
    charisma_exp: 1.468634671190469,
    company_rep: 1.1609760246564969,
    faction_rep: 1.1609760246564969,
    crime_money: 1.1609760246564969,
    crime_success: 1.1609760246564969,
    hacknet_node_money: 2.928090375685996,
    hacknet_node_purchase_cost: 0.6589283359459067,
    hacknet_node_ram_cost: 0.8613442299946493,
    hacknet_node_core_cost: 0.8613442299946493,
    hacknet_node_level_cost: 0.7321425954954519,
    work_money: 1.1609760246564969,
    bladeburner_max_stamina: 1,
    bladeburner_stamina_gain: 1,
    bladeburner_analysis: 1,
    bladeburner_success_chance: 1,
  },
  numPeopleKilled: 0,
  money: 13598731863.444643,
  city: 'Sector-12',
  location: 'Travel Agency',
  bitNodeN: 1,
  totalPlaytime: 709821800,
  playtimeSinceLastAug: 7025400,
  playtimeSinceLastBitnode: 709821800,
  jobs: {},
  factions: ['The Black Hand', 'NiteSec', 'Netburners', 'CyberSec'],
  entropy: 0,
};
