/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
import Server from './zServer.js';
import { numCycleForGrowthCorrected } from './zCalc.js';

/* eslint-enable */

export default class Focus {
  ns: NS;
  p: Player;
  xnet: Network;
  ramMin: number;
  ramHack: number;
  ramWeak: number;
  ramGrow: number;

  constructor(ns: NS, player: Player, network: Network) {
    this.ns = ns;
    this.p = player;
    this.xnet = network;
    this.ramMin = ns.getScriptRam(configs.xMin);
    this.ramHack = ns.getScriptRam(configs.xHack);
    this.ramWeak = ns.getScriptRam(configs.xWeak);
    this.ramGrow = ns.getScriptRam(configs.xGrow);

    // this.focusMap.set('n00dles', {
    //   ready: false,
    //   focus: false,
    //   hackR: 34,
    //   hackP: 0,
    //   weakR: 50,
    //   weakP: 0,
    //   GrowR: 4,
    //   GrowP: 0,
    // });
    // this.focusMap.set('harakiri-sushi', {
    //   ready: false,
    //   focus: false,
    //   hackR: 45,
    //   hackP: 0,
    //   weakR: 99,
    //   weakP: 0,
    //   GrowR: 361,
    //   GrowP: 0,
    // });
  }

  get ramScripts(): any {
    return {
      min: this.ramMin,
      hack: this.ramHack,
      weak: this.ramWeak,
      grow: this.ramGrow,
    };
  }

  get ram(): any {
    const stats = {
      total: {
        max: 0,
        now: 0,
      },
      home: {
        max: this.ns.getServer('home').maxRam,
        now:
          this.ns.getServer('home').maxRam - this.ns.getServer('home').ramUsed,
      },
      bots: {
        max: this.xnet.botsRAMMax,
        now: this.xnet.botsRAM,
      },
    };
    stats.total.max = stats.home.max + stats.bots.max;
    stats.total.now = stats.home.now + stats.bots.now;
    return stats;
  }

  get targetsReady(): any {
    return this.xnet.targets.filter((t: any) => t.nodeReady);
  }

  get targetsPrep(): any {
    return this.xnet.targets.filter((t: any) => !t.nodeReady);
  }

  // get data(): any {
  //   return this.ns.getServer(this.hostname);
  // }
}

const sample = {
  n00dles: {
    ready: false,
    focus: false,
    hackR: 34,
    hackP: 0,
    weakR: 50,
    weakP: 0,
    GrowR: 4,
    GrowP: 0,
  },
};
