/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
/* eslint-enable */

export default class Player {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  get data(): any {
    return this.ns.getPlayer();
  }

  get hp(): any {
    return {
      now: this.data.hp.current,
      max: this.data.hp.max,
    };
  }

  get money(): any {
    return {
      now: this.data.money - this.reserve,
      real: this.data.money,
    };
  }

  get hacking(): number {
    return this.data.skills.hacking;
  }

  get hackingRange(): any {
    return {
      min: this.hacking * 0.25 < 1 ? 1 : Math.ceil(this.hacking * 0.25),
      max: Math.ceil(this.hacking * 0.8),
    };
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

  get bitnode(): number {
    return this.data.bitNodeN;
  }

  get reserve(): number {
    if (!this.programs.tor) {
      return configs.softwareCost.tor + configs.reserve;
    }

    if (!this.programs.ssh) {
      return configs.softwareCost.ssh + configs.reserve;
    }

    if (!this.programs.ftp) {
      return configs.softwareCost.ftp + configs.reserve;
    }

    if (!this.programs.smtp) {
      return configs.softwareCost.smtp + configs.reserve;
    }

    if (!this.programs.http) {
      return configs.softwareCost.http + configs.reserve;
    }

    if (!this.programs.sql) {
      return configs.softwareCost.sql + configs.reserve;
    }

    return configs.reserve;
  }
}

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.disableLog('ALL');
  const p = new Player(ns);

  ns.print(`Node: ${p.bitnode}`);
  ns.print(`HP: ${p.hp.now} / ${p.hp.max}`);
  ns.print(
    `Money: ${ns.formatNumber(p.money.real, 2)} (${ns.formatNumber(
      p.money.now,
      2
    )})`
  );
  ns.print(
    `Hacking: ${p.hacking} (${p.hackingRange.min} - ${p.hackingRange.max})`
  );
  ns.print(`[Programs] ${p.challenge}`);
  ns.print(`  [Tor] ${p.programs.tor}`);
  ns.print(`  [SSH] ${p.programs.ssh}`);
  ns.print(`  [FTP] ${p.programs.ftp}`);
  ns.print(`  [SMTP] ${p.programs.smtp}`);
  ns.print(`  [HTTP] ${p.programs.http}`);
  ns.print(`  [SQL] ${p.programs.sql}`);
}

/* eslint-disable-next-line */
// const sample = {
//   hp: { current: 10, max: 10 },
//   skills: {
//     hacking: 1206,
//     strength: 2,
//     defense: 1,
//     dexterity: 2,
//     agility: 1,
//     charisma: 2,
//     intelligence: 0,
//   },
//   exp: {
//     hacking: 98453962.91900802,
//     strength: 0,
//     defense: 0,
//     dexterity: 0,
//     agility: 0,
//     charisma: 0,
//     intelligence: 0,
//   },
//   mults: {
//     hacking_chance: 2.032353267024972,
//     hacking_speed: 2.022203093529755,
//     hacking_money: 3.395980295603446,
//     hacking_grow: 2.033764699726582,
//     hacking: 3.101896444837534,
//     strength: 2.2452762284981462,
//     defense: 1.9524141117375187,
//     dexterity: 2.593294043915359,
//     agility: 1.708362347770329,
//     charisma: 2.1476555229112706,
//     hacking_exp: 4.095178678665241,
//     strength_exp: 2.058169876123301,
//     defense_exp: 2.058169876123301,
//     dexterity_exp: 2.058169876123301,
//     agility_exp: 2.058169876123301,
//     charisma_exp: 2.058169876123301,
//     company_rep: 2.716784236482757,
//     faction_rep: 2.058169876123301,
//     crime_money: 1.6270117597812657,
//     crime_success: 1.6270117597812657,
//     hacknet_node_money: 4.103476190520832,
//     hacknet_node_purchase_cost: 0.4581503455759973,
//     hacknet_node_ram_cost: 0.5988893406222188,
//     hacknet_node_core_cost: 0.5988893406222188,
//     hacknet_node_level_cost: 0.509055939528886,
//     work_money: 1.7897129357593924,
//     bladeburner_max_stamina: 1,
//     bladeburner_stamina_gain: 1,
//     bladeburner_analysis: 1,
//     bladeburner_success_chance: 1,
//   },
//   numPeopleKilled: 0,
//   money: 4161292969560.33,
//   city: 'Sector-12',
//   location: 'Alpha Enterprises',
//   bitNodeN: 1,
//   totalPlaytime: 1740283800,
//   playtimeSinceLastAug: 7201000,
//   playtimeSinceLastBitnode: 698549200,
//   jobs: {},
//   factions: [
//     'BitRunners',
//     'The Black Hand',
//     'NiteSec',
//     'Netburners',
//     'CyberSec',
//   ],
//   entropy: 0,
// };
