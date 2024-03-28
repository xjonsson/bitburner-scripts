/* eslint-disable */
import { NS } from '@ns';
import { handleDB } from '/os/cache/db';
/* eslint-enable */

export default class Player {
  ns: NS;
  _id: string;

  constructor(ns: NS, id: string) {
    // super();
    this.ns = ns;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  get data(): any {
    return this.ns.getPlayer();
  }

  /* eslint-disable */
  get updatedAt(): any {
    return new Date().valueOf();
  }
  /* eslint-enable */

  get resetData(): any {
    return this.ns.getResetInfo();
  }

  get sourcefiles(): any {
    return this.resetData.ownedSF;
  }

  get bitnode(): any {
    return this.resetData.currentNode;
  }

  get augments(): any {
    return this.resetData.ownedAugs;
  }

  get money(): number {
    return this.data.money;
  }

  get level(): number {
    return this.data.skills.hacking;
  }

  get hp(): any {
    return { now: this.data.hp.current, max: this.data.hp.max };
  }

  get city(): any {
    return this.data.city;
  }

  get location(): any {
    return this.data.location;
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

  get playtime(): any {
    return {
      total: this.data.totalPlaytime,
      aug: this.resetData.lastAugReset,
      node: this.resetData.lastNodeReset,
    };
  }

  get levelRange(): any {
    return {
      min: this.level * 0.25 < 1 ? 1 : Math.ceil(this.level * 0.25),
      focus: this.level * 0.5 < 1 ? 1 : Math.ceil(this.level * 0.5),
      max: this.level * 0.75 < 1 ? 1 : Math.ceil(this.level * 0.75),
    };
  }

  get hack(): any {
    return {
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
  }

  get hacknet(): any {
    return {
      production: this.data.mults.hacknet_node_money,
      node: this.data.mults.hacknet_node_purchase_cost,
      level: this.data.mults.hacknet_node_level_cost,
      ram: this.data.mults.hacknet_node_ram_cost,
      cores: this.data.mults.hacknet_node_core_cost,
    };
  }

  get int(): any {
    return {
      level: this.data.skills.intelligence,
      exp: this.data.exp.intelligence,
    };
  }

  get cha(): any {
    return {
      level: this.data.skills.charisma,
      exp: this.data.exp.charisma,
      mults: {
        level: this.data.mults.charisma,
        exp: this.data.mults.charisma_exp,
      },
    };
  }

  get str(): any {
    return {
      level: this.data.skills.strength,
      exp: this.data.exp.strength,
      mults: {
        level: this.data.mults.strength,
        exp: this.data.mults.strength_exp,
      },
    };
  }

  get def(): any {
    return {
      level: this.data.skills.defense,
      exp: this.data.exp.defense,
      mults: {
        level: this.data.mults.defense,
        exp: this.data.mults.defense_exp,
      },
    };
  }

  get dex(): any {
    return {
      level: this.data.skills.dexterity,
      exp: this.data.exp.dexterity,
      mults: {
        level: this.data.mults.dexterity,
        exp: this.data.mults.dexterity_exp,
      },
    };
  }

  get agi(): any {
    return {
      level: this.data.skills.agility,
      exp: this.data.exp.agility,
      mults: {
        level: this.data.mults.agility,
        exp: this.data.mults.agility_exp,
      },
    };
  }

  get work(): any {
    return {
      jobs: this.data.jobs,
      mults: {
        money: this.data.mults.work_money,
      },
    };
  }

  get faction(): any {
    return {
      factions: this.data.factions,
      mults: {
        rep: this.data.mults.faction_rep,
      },
    };
  }

  get company(): any {
    return {
      mults: {
        rep: this.data.mults.company_rep,
      },
    };
  }

  get crime(): any {
    return {
      kills: this.data.numPeopleKilled,
      mults: {
        chance: this.data.mults.crime_success,
        money: this.data.mults.crime_money,
      },
    };
  }

  get bladeburner(): any {
    return {
      mults: {
        staminaMax: this.data.mults.bladeburner_max_stamina,
        staminaGain: this.data.mults.bladeburner_stamina_gain,
        analysis: this.data.mults.bladeburner_analysis,
        chance: this.data.mults.bladeburner_success_chance,
      },
    };
  }

  get entropy(): any {
    return this.data.entropy;
  }

  listGetters(instance: any, properties = new Set()) {
    const getters = Object.entries(
      Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(instance))
    )
      .filter((e) => typeof e[1].get === 'function' && e[0] !== '__proto__')
      .map((e) => e[0]);

    getters.forEach((g) => {
      properties.add(g);
      return this.listGetters(Object.getPrototypeOf(instance), properties);
    });
    return properties;
  }

  async createEventListener(fieldSet: any) {
    const embeddedObject = (obj: any, field: any) => obj[field];

    const splitFields = fieldSet.split('.');
    let oldValue;
    while (true) {
      let subObj = this;
      for (const field of splitFields) {
        subObj = embeddedObject(subObj, field);
      }
      if (oldValue !== subObj) {
        oldValue = subObj;
        this.updateCache(false);
      }
      await this.ns.asleep(10);
    }
  }

  async updateCache(repeat = true, kv = new Map()) {
    do {
      const db = await handleDB();
      const old = (await db.get('player', this.id)) || {};
      const getters = this.listGetters(this);
      getters.forEach((g) => {
        old[g] = this[g];
      });
      kv.forEach((v, k) => (old[k] = v));

      await db.put('player', old);
      if (repeat) {
        (await this.ns.asleep(Math.random() * 10000)) + 55000;
      }
    } while (repeat);
  }
}
