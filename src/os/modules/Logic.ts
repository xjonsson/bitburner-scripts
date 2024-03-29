/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS } from '/os/configs';
import { PlayerCache } from '/os/modules/Cache';
/* eslint-enable */

// TODO: Add faction and augments priorities

export function osLogic(ns: NS, stage: number): any {
  const p = PlayerCache.read(ns, 'player');
  switch (stage) {
    // ******** Minimal startup
    case 0: {
      // ******** Setup Hacknet
      if (ns.hacknet.numNodes() >= 8) {
        return { done: true, msg: 'STAGE_0_COMPLETE' };
      }
      return { done: false, msg: 'HNET_NODES_8' };
    }
    case 1: {
      // ******** Join Netburners
      if (!p?.faction.factions.includes('Netburners')) {
        if (p?.level < 80) {
          return { done: false, msg: 'LVL_80' };
        }

        const hnCount = ns.hacknet.numNodes();
        let hnLevel = 0; // 100

        for (let i = 0; i < hnCount; i += 1) {
          const node = ns.hacknet.getNodeStats(i);
          hnLevel += node.level;
        }

        if (hnLevel < 100) {
          return { done: false, msg: 'HNET_LVL_100' };
        }
        return { done: false, msg: 'JOIN_NetBurners' };
      }

      // ******** Get Tor
      if (!p?.programs.tor) {
        if (p?.money < CONFIGS.shoppingPrices.tor) {
          return { done: false, msg: 'SAVE_TOR' };
        }
        return { done: false, msg: 'BUY_TOR' };
      }
      return { done: true, msg: 'STAGE_1_COMPLETE' };
    }
    case 2: {
      // ******** Get SSH
      if (!p?.programs.ssh) {
        if (p?.money < CONFIGS.shoppingPrices.ssh) {
          return { done: false, msg: 'SAVE_SSH' };
        }
        return { done: false, msg: 'BUY_SSH' };
      }
      return { done: true, msg: 'STAGE_2_COMPLETE' };
    }
    case 3: {
      // ******** Join CSEC
      if (!p?.faction.factions.includes('CyberSec')) {
        if (p?.level < 55) {
          return { done: false, msg: 'LVL_55' };
        }

        const host = ns.getServer('CSEC');
        if (!host.hasAdminRights) {
          return { done: false, msg: 'ROOT_CSEC' };
        }

        if (!host.backdoorInstalled) {
          return { done: false, msg: 'DOOR_CSEC' };
        }

        return { done: false, msg: 'JOIN_CyberSec' };
      }
      return { done: true, msg: 'STAGE_3_COMPLETE' };
    }
    case 4: {
      // ******** Get FTP
      if (!p?.programs.ftp) {
        if (p?.money < CONFIGS.shoppingPrices.ftp) {
          return { done: false, msg: 'SAVE_FTP' };
        }
        return { done: false, msg: 'BUY_FTP' };
      }
      return { done: true, msg: 'STAGE_4_COMPLETE' };
    }
    case 5: {
      // ******** Join NiteSec
      if (!p?.faction.factions.includes('NiteSec')) {
        if (p?.level < 204) {
          return { done: false, msg: 'LVL_204' };
        }

        const host = ns.getServer('avmnite-02h');
        if (!host.hasAdminRights) {
          return { done: false, msg: 'ROOT_avmnite-02h' };
        }

        if (!host.backdoorInstalled) {
          return { done: false, msg: 'DOOR_avmnite-02h' };
        }

        return { done: false, msg: 'JOIN_NiteSec' };
      }
      return { done: true, msg: 'STAGE_5_COMPLETE' };
    }
    case 6: {
      // ******** Get SMTP
      if (!p?.programs.smtp) {
        if (p?.money < CONFIGS.shoppingPrices.smtp) {
          return { done: false, msg: 'SAVE_SMTP' };
        }
        return { done: false, msg: 'BUY_SMTP' };
      }
      return { done: true, msg: 'STAGE_6_COMPLETE' };
    }
    case 7: {
      // ******** Join TheBlackHand
      if (!p?.faction.factions.includes('TheBlackHand')) {
        if (p?.level < 362) {
          return { done: false, msg: 'LVL_362' };
        }

        const host = ns.getServer('I.I.I.I');
        if (!host.hasAdminRights) {
          return { done: false, msg: 'ROOT_I.I.I.I' };
        }

        if (!host.backdoorInstalled) {
          return { done: false, msg: 'DOOR_I.I.I.I' };
        }

        return { done: false, msg: 'JOIN_TheBlackHand' };
      }
      return { done: true, msg: 'STAGE_7_COMPLETE' };
    }
    case 8: {
      // ******** Get HTTP
      if (!p?.programs.http) {
        if (p?.money < CONFIGS.shoppingPrices.http) {
          return { done: false, msg: 'SAVE_HTTP' };
        }
        return { done: false, msg: 'BUY_HTTP' };
      }
      return { done: true, msg: 'STAGE_8_COMPLETE' };
    }
    case 9: {
      // ******** Join BitRunners
      if (!p?.faction.factions.includes('BitRunners')) {
        if (p?.level < 524) {
          return { done: false, msg: 'LVL_524' };
        }

        const host = ns.getServer('run4theh111z');
        if (!host.hasAdminRights) {
          return { done: false, msg: 'ROOT_run4theh111z' };
        }

        if (!host.backdoorInstalled) {
          return { done: false, msg: 'DOOR_run4theh111z' };
        }

        return { done: false, msg: 'JOIN_BitRunners' };
      }
      return { done: true, msg: 'STAGE_9_COMPLETE' };
    }
    case 10: {
      // ******** Get SQL
      if (!p?.programs.sql) {
        if (p?.money < CONFIGS.shoppingPrices.sql) {
          return { done: false, msg: 'SAVE_SQL' };
        }
        return { done: false, msg: 'BUY_SQL' };
      }
      return { done: true, msg: 'STAGE_10_COMPLETE' };
    }
    case 11: {
      // ******** TBD
      return { done: false, msg: 'STAGE_11' };
    }
    default: {
      return { done: false, msg: '' };
    }
  }
}
