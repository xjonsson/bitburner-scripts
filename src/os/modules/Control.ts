/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { PlayerCache } from '/os/modules/Cache';
// import { CONSTANTS } from '/os/data/constants';
// import { Player } from '/os/modules/Player';
// import { formatTime } from '/os/utils/formatTime';
// import { growthAnalyzeAccurate } from '/os/utils/growthAnalyzeAccurate';
// import { serversData } from '/os/data/servers';
import { Server, ServerInfo } from '/os/modules/Server';
import { Scan } from '/os/utils/scan';
/* eslint-enable */

export class Control {
  id: string;
  status: any;
  ticks: any;
  player: {
    // action: any;
    level: number;
    challenge: number;
    money: number;
  };
  isLevelUp: boolean; // Rescan servers on levelup
  isProgramUp: boolean; // Rehack and rescan servers on level
  isShopPrograms: boolean; // Buy until we have all programs
  isShopHacknet: boolean; // Buy until we have maxed out
  isShopHosting: boolean; // Buy until we have maxed out
  // serverHosting: Array<string>; // NOTE: Purchased servers
  // serverBots: Array<object>; // NOTE: Reclaimed servers
  serverNode: Array<string>; // Servers that can hack
  serverReclaim: Array<string>; // Reclaim these servers
  serverBackdoor: Array<string>; // Servers we can backdoor
  serverTargets: Array<object>; // All hackable servers
  serverFocus: Array<object>; // Servers we want to hack
  // serverFuture: Array<object>; // NOTE: Future servers to hack

  // ******** Constructor
  constructor(ns: NS, past: Control) {
    // Cached Data
    const p = PlayerCache.read(ns, 'player');

    // ******** Defaults
    this.id = 'control';
    // this.status = 'CHECK';
    this.ticks = past ? past.ticks + 1 : 0;
    this.player = {
      // action: [],
      level: p?.level || 0,
      challenge: p?.challenge || 0,
      money: p?.money || 0,
    };
    this.isLevelUp = past?.isLevelUp || false;
    this.isProgramUp = past?.isProgramUp || false;
    this.isShopPrograms = past?.isShopPrograms || true;
    this.isShopHacknet = past?.isShopHacknet || true;
    this.isShopHosting = past?.isShopHosting || true;
    this.serverNode = past?.serverNode || [];
    this.serverReclaim = past?.serverReclaim || [];
    this.serverBackdoor = past?.serverBackdoor || [];
    this.serverTargets = past?.serverTargets || [];
    this.serverFocus = past?.serverFocus || [];

    // ******** Check for change in player skills
    if (past?.player) {
      if (this.player.level > past.player.level) this.isLevelUp = true;
      if (this.player.challenge > past.player.challenge) {
        this.isProgramUp = true;
      }
    }

    // ******** LEVEL UP LOGIC
    if (this.isLevelUp) {
      this.updateServers(ns);
      this.updateFocus(ns);

      this.isLevelUp = false;
    }

    // this.player.action = this.playerActions();

    // ******** Details

    // ******** Classification
  }

  // ******** Actions
  // ******** Servers update
  updateServers(ns: NS) {
    this.serverNode = [];
    this.serverReclaim = [];
    this.serverBackdoor = [];
    this.serverTargets = [];
    const servers = ServerInfo.all(ns).forEach((s: Server) => {
      // ******** NODE LOGIC (Servers with RAM)
      if (s.isNode && !s.isHome) this.serverNode.push(s.hostname);

      // ******** RECLAIM LOGIC
      if (
        !s.root &&
        !s.isHome &&
        !s.isServer &&
        s.challenge <= this.player.challenge
      ) {
        this.serverReclaim.push(s.hostname);
      }

      // ******** BACKDOOR LOGIC
      if (
        !s.isHome &&
        !s.isServer &&
        !s.isDoored &&
        s.root &&
        s.level <= this.player.level
      ) {
        this.serverBackdoor.push(s.hostname);
      }

      // ******** ATTACKING LOGIC
      if (s.isCash) {
        this.serverTargets.push({
          name: s.hostname,
          level: s.level,
          distance: s.level - this.player.level / 2,
        });
      }
    });
  }

  // ******** Focus update
  updateFocus(ns: NS) {
    this.serverFocus = [];
    if (this.serverTargets.length > 0) {
      this.serverTargets
        .filter((s) => s?.level <= this.player.level)
        .sort((a, b) => a.level - b.level)
        .forEach((s) => this.serverFocus.push(s));
      // FIXME: Calculate distance
      // while (this.serverFocus.length > 5) {

      // }
    }
  }

  // playerActions(): any {
  //   if (this.player && this.past?.player) {
  //     const { action } = this.past.player;
  //     if (this.player.level > this.past.player.level) action.push('LEVEL UP');
  //     if (this.player.challenge > this.past.player.challenge)
  //       action.push('PROGRAM UP');
  //     return action;
  //     // return [`${this.past.player.level} | ${this.player.level}`];
  //   }
  //   return [];
  // }

  // ******** Computed

  // ******** Display
  // NOTE: Heavy computed, move to attack server
}

export const ControlInfo = {
  details(ns: NS, pastControl: Control) {
    return new Control(ns, pastControl);
  },
};
