/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS } from '/os/configs';
import { osLogic } from '/os/modules/Logic';
import { PlayerCache } from '/os/modules/Cache';
import { reclaimer } from '/os/modules/Reclaim';
/* eslint-enable */

export class Control {
  id: string;
  ticks: any;
  stage: number;
  phase: any;
  level: number;
  challenge: number;
  isPlayerCheck: boolean;
  isShopHacknet: boolean;
  isShopHosting: boolean;
  isReserve: number;
  hackTargets: [];

  // ******** Constructor
  constructor(ns: NS, past: Control) {
    // ******** Defaults
    this.id = 'control';
    this.ticks = past ? past.ticks + 1 : 0;
    this.stage = past ? past.stage : 0;
    this.phase = osLogic(ns, this.stage);
    this.level = past ? past.level : -1;
    this.challenge = past ? past.challenge : -1;
    this.isPlayerCheck = past ? past.isPlayerCheck : true;
    // this.isShopHacknet = past ? past.isShopHacknet : true;
    // this.isShopHosting = past ? past.isShopHosting : true;
    // this.isReserve = past ? past.isReserve : 0;
    this.hackTargets = past ? past.hackTargets : [];

    // ******** Update shopping based on logic
    this.isShopHacknet = this.phase.hacknet;
    this.isShopHosting = this.phase.hosting;
    this.isReserve = this.phase.reserve;

    // ******** Check for stage change
    if (this.phase.done) {
      this.stage += 1;
    }

    // ******** Check for player changes
    if (this.isPlayerCheck) {
      const p = PlayerCache.read(ns, 'player');
      if (p?.challenge > this.challenge) {
        this.challenge = p?.challenge;
        // ns.tprint(`Programs Updated: ${this.challenge}`);
        reclaimer(ns, this.challenge);
      }

      if (p?.level > this.level) {
        this.level = p?.level;
        // ns.tprint(`Level Updated: ${this.level}`);
      }

      // Disable the player check after X
    }
  }

  set updateTargets(targets: []) {
    this.hackTargets = targets;
  }
}

export const ControlInfo = {
  details(ns: NS, pastControl: Control) {
    return new Control(ns, pastControl);
  },
};
