/* eslint-disable */
import { NS } from '@ns';
import { osLogic } from '/os/modules/Logic';
import { PlayerCache } from '/os/modules/Cache';
import { reclaimer } from '/os/modules/Reclaim';
/* eslint-enable */

export class Control {
  id: string;
  ticks: number;
  stage: number;
  level: number;
  challenge: number;
  isPlayerCheck: boolean;
  isShopHN: boolean;
  isShopH: boolean;
  isReserve: number;
  hackTargets: [];
  phase: {
    done: boolean;
    msg: string;
    hn: boolean;
    hosting: boolean;
    reserve: number;
  };

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
    this.hackTargets = past ? past.hackTargets : [];

    // ******** Update shopping based on logic
    this.isShopHN = this.phase.hn;
    this.isShopH = this.phase.hosting;
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
        reclaimer(ns, this.challenge);
      }

      if (p?.level > this.level) {
        this.level = p?.level;
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
