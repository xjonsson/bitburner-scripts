/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS } from '/os/configs';
import { PlayerCache } from '/os/modules/Cache';
import { ServerInfo } from '/os/modules/Server';
/* eslint-enable */

// TODO: Add faction and augments priorities

export function osLogic(ns: NS, stage: number): any {
  const p = PlayerCache.read(ns, 'player');
  switch (stage) {
    // ******** Minimal startup
    // TODO: home ram < 64 save 11m (Less makes it impossible to run)
    // TODO: home ram < 128 save 32m
    // TODO: home ram < 256 save 100m
    case 0: {
      // ******** Get a job
      if (p && Object.keys(p?.work.jobs).length < 1) {
        return {
          done: false,
          msg: 'STAGE_0_JOB',
          hacknet: true,
          hosting: true,
          reserve: 0,
        };
      }
      // ******** Setup Hacknet
      if (ns.hacknet.numNodes() < 8) {
        return {
          done: false,
          msg: 'HNET_NODES_8',
          hacknet: true,
          hosting: false,
          reserve: 0,
        };
      }

      if (ns.getPurchasedServers().length < 8) {
        return {
          done: false,
          msg: 'HOSTING_NODES_8',
          hacknet: false,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_0_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 1: {
      // ******** Join Netburners
      if (!p?.faction.factions.includes('Netburners')) {
        if (p?.level < 80) {
          return {
            done: false,
            msg: 'LVL_80',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        const hnCount = ns.hacknet.numNodes();
        let hnLevel = 0; // 100

        for (let i = 0; i < hnCount; i += 1) {
          const node = ns.hacknet.getNodeStats(i);
          hnLevel += node.level;
        }

        if (hnLevel < 100) {
          return {
            done: false,
            msg: 'HNET_LVL_100',
            hacknet: true,
            hosting: false,
            reserve: 0,
          };
        }
        return {
          done: false,
          msg: 'JOIN_NetBurners',
          hacknet: false,
          hosting: true,
          reserve: 0,
        };
      }

      // ******** Get Tor
      if (!p?.programs.tor) {
        if (p?.money < CONFIGS.shoppingPrices.tor) {
          return {
            done: false,
            msg: 'SAVE_TOR 200K',
            hacknet: false,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.tor,
          };
        }
        return {
          done: false,
          msg: 'BUY_TOR 200K',
          hacknet: false,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.tor,
        };
      }
      return {
        done: true,
        msg: 'STAGE_1_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 2: {
      // ******** Get SSH
      if (!p?.programs.ssh) {
        if (p?.money < CONFIGS.shoppingPrices.ssh) {
          return {
            done: false,
            msg: 'SAVE_SSH 500K',
            hacknet: false,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.ssh,
          };
        }
        return {
          done: false,
          msg: 'BUY_SSH 500K',
          hacknet: false,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.ssh,
        };
      }
      return {
        done: true,
        msg: 'STAGE_2_COMPLETE',
        hacknet: false,
        hosting: true,
        reserve: 0,
      };
    }
    case 3: {
      // ******** Join CSEC
      if (!p?.faction.factions.includes('CyberSec')) {
        const host = ns.getServer('CSEC');
        if (p?.level < host.requiredHackingSkill) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hacknet: false,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_CSEC',
            hacknet: false,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_CSEC (m1)',
            hacknet: false,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_CyberSec',
          hacknet: false,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_3_COMPLETE',
        hacknet: false,
        hosting: true,
        reserve: 0,
      };
    }
    case 4: {
      // ******** Get FTP
      if (!p?.programs.ftp) {
        if (p?.money < CONFIGS.shoppingPrices.ftp) {
          return {
            done: false,
            msg: 'SAVE_FTP 1.5M',
            hacknet: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.ftp,
          };
        }
        return {
          done: false,
          msg: 'BUY_FTP 1.5M',
          hacknet: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.ftp,
        };
      }
      return {
        done: true,
        msg: 'STAGE_4_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 5: {
      // ******** Join NiteSec
      if (!p?.faction.factions.includes('NiteSec')) {
        const host = ns.getServer('avmnite-02h');
        if (p?.level < host.requiredHackingSkill) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_avmnite-02h',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_avmnite-02h (m2)',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_NiteSec',
          hacknet: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_5_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 6: {
      // ******** Get SMTP
      if (!p?.programs.smtp) {
        if (p?.money < CONFIGS.shoppingPrices.smtp) {
          return {
            done: false,
            msg: 'SAVE_SMTP 5M',
            hacknet: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.smtp,
          };
        }
        return {
          done: false,
          msg: 'BUY_SMTP 5M',
          hacknet: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.smtp,
        };
      }
      return {
        done: true,
        msg: 'STAGE_6_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 7: {
      // ******** Join TheBlackHand
      if (!p?.faction.factions.includes('The Black Hand')) {
        const host = ns.getServer('I.I.I.I');
        if (p?.level < host.requiredHackingSkill) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_I.I.I.I',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_I.I.I.I (m3)',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_TheBlackHand',
          hacknet: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_7_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 8: {
      // ******** Get HTTP
      if (!p?.programs.http) {
        if (p?.money < CONFIGS.shoppingPrices.http) {
          return {
            done: false,
            msg: 'SAVE_HTTP 30M',
            hacknet: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.http,
          };
        }
        return {
          done: false,
          msg: 'BUY_HTTP 30M',
          hacknet: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.http,
        };
      }
      return {
        done: true,
        msg: 'STAGE_8_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 9: {
      // ******** Join BitRunners
      if (!p?.faction.factions.includes('BitRunners')) {
        const host = ns.getServer('run4theh111z');
        if (p?.level < host.requiredHackingSkill) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_run4theh111z',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_run4theh111z (m4)',
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_BitRunners',
          hacknet: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_9_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 10: {
      // ******** Get SQL
      if (!p?.programs.sql) {
        if (p?.money < CONFIGS.shoppingPrices.sql) {
          return {
            done: false,
            msg: 'SAVE_SQL 250M',
            hacknet: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.sql,
          };
        }
        return {
          done: false,
          msg: 'BUY_SQL 250M',
          hacknet: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.sql,
        };
      }
      return {
        done: true,
        msg: 'STAGE_10_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 11: {
      // ******** Join BitRunners
      if (!p?.faction.factions.includes('Daedalus')) {
        // NOTE: Augments / 30
        if (p?.level < 2500) {
          return {
            done: false,
            msg: `LVL_2500`,
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (p?.money < 1e11) {
          return {
            done: false,
            msg: `100 Billion`,
            hacknet: false,
            hosting: true,
            reserve: 1e11,
          };
        }

        return {
          done: false,
          msg: 'JOIN_Daedalus',
          hacknet: false,
          hosting: true,
          reserve: 1e11,
        };
      }

      // NOTE: Get Red pill
      // NOTE: Install red pill
      return {
        done: true,
        msg: 'STAGE_11_COMPLETE',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }

    case 12: {
      // ******** Crack
      if (ServerInfo.list(ns).includes('w0r1d_d43m0n')) {
        if (p?.level < 3000) {
          return {
            done: false,
            msg: `LVL_3000`,
            hacknet: true,
            hosting: true,
            reserve: 0,
          };
        }
        return {
          done: false,
          msg: `BACKDOOR_w0r1d_d43m0n (m5)`,
          hacknet: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: false,
        msg: 'INSTALL_REDPILL',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
    default: {
      return {
        done: false,
        msg: 'ERROR',
        hacknet: true,
        hosting: true,
        reserve: 0,
      };
    }
  }
}

/*
 * [x] Gain root access on CSEC
 * [x] Install the backdoor on CSEC
 * [x] Join the faction hinted at in csec-test.msg
 * [x] Install all the Augmentations from CyberSec
 * [x] Join the faction hinted at in nitesec-test.msg
 * [x] Install all the Augmentations from NiteSec
 * [x] Join the faction hinted at in j3.msg
 * [x] Install all the Augmentations from The Black Hand
 * [x] Join the faction hinted at in 19dfj3l1nd.msg
 * [ ] Install all the Augmentations from BitRunners
 */
