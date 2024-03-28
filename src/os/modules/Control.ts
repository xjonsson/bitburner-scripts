/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, STAGE, DEPLOY } from '/os/configs';
import { PlayerCache } from '/os/modules/Cache';
// import { CONSTANTS } from '/os/data/constants';
// import { Player } from '/os/modules/Player';
// import { formatTime } from '/os/utils/formatTime';
// import { growthAnalyzeAccurate } from '/os/utils/growthAnalyzeAccurate';
// import { serversData } from '/os/data/servers';
import { Server, ServerInfo } from '/os/modules/Server';
import { reclaimServer } from '/os/modules/Reclaim';
import { Scan } from '/os/utils/scan';
import { launch } from '/os/utils/launch';
/* eslint-enable */

export class Control {
  id: string;
  status: any;
  actions: any;
  ticks: any;
  player: {
    // action: any;
    level: number;
    programs: any;
    challenge: number;
    money: number;
    home: number;
  };
  stage: any;
  phase: number;
  isLevelUp: boolean; // Rescan servers on levelup
  isShopPrograms: boolean; // Buy until we have all programs
  isShopHacknet: boolean; // Buy until we have maxed out
  isShopHosting: boolean; // Buy until we have maxed out
  // serverHosting: Array<string>; // NOTE: Purchased servers
  // serverBots: Array<object>; // NOTE: Reclaimed servers
  serverNode: Array<string>; // Servers that can hack
  serverReclaim: Array<string>; // Reclaim these servers
  serverBackdoor: Array<string>; // Servers we can backdoor
  serverTargets: Array<object>; // All hackable servers
  serverFocus: Array<string>; // Servers we want to hack
  // serverFuture: Array<object>; // NOTE: Future servers to hack

  // ******** Constructor
  constructor(ns: NS, past: Control) {
    // Cached Data
    const p = PlayerCache.read(ns, 'player');

    // ******** Defaults
    this.id = 'control';
    // this.status = 'CHECK';
    this.actions = [];
    this.ticks = past ? past.ticks + 1 : 0;
    this.player = {
      // action: [],
      level: p?.level || 0,
      programs: p?.programs || 0,
      challenge: p?.challenge || 0,
      money: p?.money || 0,
      home: p?.home || ns.getServer('home').maxRam,
    };
    this.stage = past?.stage || STAGE;
    this.phase = past?.phase || 0;
    this.isLevelUp = past?.isLevelUp || false;
    // this.isProgramUp = past?.isProgramUp || false;
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
        this.isLevelUp = true;
      }
    }

    // ******** LEVEL UP LOGIC
    if (this.isLevelUp) {
      this.updateServers(ns);
      this.updateFocus(ns);
      // this.updateReclaim(ns);

      this.isLevelUp = false;
    }

    // this.player.action = this.playerActions();

    // ******** Details

    // ******** Classification

    // ******** Game Logic
    /**
     * Milestone order is roughly:
     * - Daemon Minimal             -> Develop a solid base from minimal resources
     * - Daemon Fresh               -> Develop a solid base from some resources (post-Reset)
     * - Daemon Default             -> Achieve long-term stability of resources
     * - Daemon PrepareToReset      -> Maximize potential of upcoming reset
     * - Daemon MeetDaedalus        -> We are under the number of required augmentations to join Daedalus
     * - Daemon JoinDaedalus        -> We meet the number of required augmentations to join Daedalus
     * - Daemon RedPill             -> We have Daedalus membership and can rush the Red Pill
     * - Daemon Visible             -> We have taken the red pill and our only remaining goal is to backdoor the world daemon
     */

    // ******** PROGRAMS LOGIC
    if (this.isShopPrograms) {
      if (this.player.programs.tor) {
        if (
          !this.player.programs.ssh &&
          this.player.money >= CONFIGS.shoppingPrices.ssh
        ) {
          this.actions.push('BUY_SSH');
        }
        if (
          !this.player.programs.ftp &&
          this.player.money >= CONFIGS.shoppingPrices.ftp
        ) {
          this.actions.push('BUY_FTP');
        }
        if (
          !this.player.programs.smtp &&
          this.player.money >= CONFIGS.shoppingPrices.smtp
        ) {
          this.actions.push('BUY_SMTP');
        }
        if (
          !this.player.programs.http &&
          this.player.money >= CONFIGS.shoppingPrices.http
        ) {
          this.actions.push('BUY_HTTP');
        }
        if (
          !this.player.programs.sql &&
          this.player.money >= CONFIGS.shoppingPrices.sql
        ) {
          this.actions.push('BUY_SQL');
        }
        if (this.player.challenge >= 5) {
          this.isShopPrograms = false;
        }
      } else if (this.player.money >= CONFIGS.shoppingPrices.tor) {
        this.actions.push('BUY_TOR');
      }
    }

    // TODO: 1. If RAM < 256 use minimal (DaemonMinimal)
    if (this.player.home < 256) {
      this.actions.push('BUY_HOME_RAM');
    }

    // ******** MILESTONES LOGIC
    switch (this.phase) {
      case 0:
        if (p?.faction.factions.includes('CyberSec')) {
          this.stage[0].done = true;
          this.phase = 1;
        } else if (p?.challenge < this.stage[0].challenge) {
          this.actions.push('PROGRAM_UP');
        } else if (p?.level < this.stage[0].level) {
          this.actions.push('LEVEL_55');
        } else if (
          this.serverBackdoor.includes(this.stage[0].host) &&
          !ns.ls('home').includes(this.stage[0].proof)
        ) {
          this.actions.push('BACKDOOR_CSEC');
        } else {
          this.actions.push('JOIN_CYBERSEC');
        }
        break;
      default:
    }
    // if (!this.milestones.m1CyberSec) {
    //   // this.actions.push('M1_CYBERSEC');
    //   if (p?.faction.factions.includes('CyberSec')) {
    //     this.milestones.m1CyberSec = true;
    //   } else if (
    //     this.serverBackdoor.includes('CSEC') &&
    //     !ns.ls('home').includes('csec-test.msg')
    //   ) {
    //     this.actions.push('BACKDOOR_CSEC');
    //   } else {
    //     this.actions.push('JOIN_CYBERSEC');
    //   }
    // }

    // if (!this.milestones.m2NetBurners) {
    //   if (p?.faction.factions.includes('Netburners')) {
    //     this.milestones.m2NetBurners = true;
    //   } else {
    //     // this.actions.push('JOIN_CYBERSEC');
    //     // - Hacking Level 80
    //     // - Total Hacknet Levels of 100
    //     // - Total Hacknet RAM of 8
    //     // - Total Hacknet Cores of 4
    //   }
    // }

    // if (!this.milestones.m3NiteSec) {
    //   if (p?.faction.factions.includes('NiteSec')) {
    //     this.milestones.m3NiteSec = true;
    //   } else if (
    //     this.serverBackdoor.includes('avmnite-02h') &&
    //     !ns.ls('home').includes('nitesec-test.msg')
    //   ) {
    //     this.actions.push('BACKDOOR_avmnite-02h');
    //   } else {
    //     this.actions.push('JOIN_NiteSec');
    //   }
    // }

    // if (!this.milestones.m4TheBlackHand) {
    //   if (p?.faction.factions.includes('TheBlackHand')) {
    //     this.milestones.m4TheBlackHand = true;
    //   } else if (this.serverBackdoor.includes('I.I.I.I')) {
    //     this.actions.push('BACKDOOR_I.I.I.I');
    //   } else if (this.player.level < 362) {
    //     this.actions.push('M4_L362');
    //   } else {
    //     this.actions.push('JOIN_TheBlackHand');
    //   }
    // }

    // if (this.serverBackdoor.length > 0) {
    //   this.actions.push(`BACKDOOR_${this.serverBackdoor[0]}`);
    // }

    // Augs (DaemonPrepareToReset)
    // TODO: 2. If Programs < 3 use Fresh (DaemonFresh)
    // TODO: 3. If world daemon is visible hack it (DaemonVisible)
    // TODO: 4. If faction daedalus available red pill (DaemonRedPill)
    // TODO: 5. If hacking level and augments meet daedalus (DaemonJoinDaedalus)
    // (DaemonMeetDaedalus)
    // TODO: 6. Default (DaemonDefault)
    this.actions.push('DEFAULT');
    // await Puppeteer();
    launch(ns, '/os/modules/Puppeteer.js');
  }

  // ******** Actions
  // ******** Servers update
  updateServers(ns: NS) {
    this.serverNode = [];
    this.serverReclaim = [];
    this.serverBackdoor = [];
    this.serverTargets = [];
    const servers = ServerInfo.all(ns).forEach(async (s: Server) => {
      // ******** NODE LOGIC (Servers with RAM)
      if (s.isNode && !s.isHome) {
        s.deployScripts(ns);
        this.serverNode.push(s.hostname);
      }

      // ******** RECLAIM LOGIC
      if (
        !s.root &&
        !s.isHome &&
        !s.isServer &&
        s.challenge <= this.player.challenge
      ) {
        // this.serverReclaim.push(s.hostname); // FIXME:
        const result = reclaimServer(ns, s.hostname);
        if (result && s.isBot) this.serverNode.push(s.hostname);
        if (!result) this.serverReclaim.push(s.hostname);
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
          distance: Math.ceil(s.level - this.player.level / 2),
        });
      }
    });
  }

  // ******** Focus update
  updateFocus(ns: NS) {
    this.serverFocus = [];
    if (this.serverTargets.length > 0) {
      this.serverTargets
        .filter((s: any) => s?.level <= this.player.level)
        .sort((a: any, b: any) => a.level - b.level)
        .forEach((s: any) => {
          if (this.serverFocus.length < CONFIGS.hacking.targets) {
            this.serverFocus.push(s.name);
          } else if (s.distance < CONFIGS.hacking.distance) {
            this.serverFocus.push(s.name);
            this.serverFocus.shift();
          }
        });
    } else {
      this.serverFocus.push('n00dles');
    }
  }

  // ******** Attempt reclaims and clean list
  // updateReclaim(ns: NS) {
  //   while (this.serverReclaim.length > 0) {
  //     const s = this.serverReclaim.shift();
  //     const result = reclaimServer(ns, s as string);
  //     if (result) this.serverNode.push(s);
  //     ns.asleep(1000);
  //   }
  // }

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
