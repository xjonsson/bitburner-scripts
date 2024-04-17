/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, PORTS } from '/os/configs';
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
          hn: true,
          hosting: true,
          reserve: 0,
        };
      }
      // ******** Setup Hacknet
      const hnNodes = ns.peek(PORTS.HACKNET)?.nodesCount || 0;
      if (hnNodes < 8) {
        return {
          done: false,
          msg: 'HNET_NODES_8',
          hn: true,
          hosting: false,
          reserve: 0,
        };
      }

      if (ns.getPurchasedServers().length < 8) {
        return {
          done: false,
          msg: 'HOSTING_NODES_8',
          hn: false,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_0_COMPLETE',
        hn: true,
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
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        // const hnCount = ns.hacknet.numNodes();
        // const hnNodes = ns.peek(PORTS.HACKNET)?.nodes || 0;
        const hnNodesLevel = ns.peek(PORTS.HACKNET)?.nodesLevel || 0;
        // let hnLevel = 0; // 100

        // for (let i = 0; i < hnCount; i += 1) {
        //   const node = ns.hn.getNodeStats(i);
        //   hnLevel += node.level;
        // }

        if (hnNodesLevel < 100) {
          return {
            done: false,
            msg: 'HNET_LVL_100',
            hn: true,
            hosting: false,
            reserve: 0,
          };
        }
        return {
          done: false,
          msg: 'JOIN_NetBurners',
          hn: false,
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
            hn: false,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.tor,
          };
        }
        return {
          done: false,
          msg: 'BUY_TOR 200K',
          hn: false,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.tor,
        };
      }
      return {
        done: true,
        msg: 'STAGE_1_COMPLETE',
        hn: true,
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
            hn: false,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.ssh,
          };
        }
        return {
          done: false,
          msg: 'BUY_SSH 500K',
          hn: false,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.ssh,
        };
      }
      return {
        done: true,
        msg: 'STAGE_2_COMPLETE',
        hn: false,
        hosting: true,
        reserve: 0,
      };
    }
    case 3: {
      // ******** Join CSEC
      if (!p?.faction.factions.includes('CyberSec')) {
        const host = ns.getServer('CSEC');
        const sLevel = host.requiredHackingSkill || 9999;
        if (p?.level < sLevel) {
          return {
            done: false,
            msg: `LVL_${sLevel}`,
            hn: false,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_CSEC',
            hn: false,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_CSEC (m1)',
            hn: false,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_CyberSec',
          hn: false,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_3_COMPLETE',
        hn: false,
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
            hn: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.ftp,
          };
        }
        return {
          done: false,
          msg: 'BUY_FTP 1.5M',
          hn: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.ftp,
        };
      }
      return {
        done: true,
        msg: 'STAGE_4_COMPLETE',
        hn: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 5: {
      // ******** Join NiteSec
      if (!p?.faction.factions.includes('NiteSec')) {
        const host = ns.getServer('avmnite-02h');
        const sLevel = host.requiredHackingSkill || 9999;
        if (p?.level < sLevel) {
          return {
            done: false,
            msg: `LVL_${sLevel}`,
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_avmnite-02h',
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_avmnite-02h (m2)',
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_NiteSec',
          hn: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_5_COMPLETE',
        hn: true,
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
            hn: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.smtp,
          };
        }
        return {
          done: false,
          msg: 'BUY_SMTP 5M',
          hn: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.smtp,
        };
      }
      return {
        done: true,
        msg: 'STAGE_6_COMPLETE',
        hn: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 7: {
      // ******** Join TheBlackHand
      if (!p?.faction.factions.includes('The Black Hand')) {
        const host = ns.getServer('I.I.I.I');
        const sLevel = host.requiredHackingSkill || 9999;
        if (p?.level < sLevel) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_I.I.I.I',
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_I.I.I.I (m3)',
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_TheBlackHand',
          hn: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_7_COMPLETE',
        hn: true,
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
            hn: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.http,
          };
        }
        return {
          done: false,
          msg: 'BUY_HTTP 30M',
          hn: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.http,
        };
      }
      return {
        done: true,
        msg: 'STAGE_8_COMPLETE',
        hn: true,
        hosting: true,
        reserve: 0,
      };
    }
    case 9: {
      // ******** Join BitRunners
      if (!p?.faction.factions.includes('BitRunners')) {
        const host = ns.getServer('run4theh111z');
        const sLevel = host.requiredHackingSkill || 9999;
        if (p?.level < sLevel) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.hasAdminRights) {
          return {
            done: false,
            msg: 'ROOT_run4theh111z',
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (!host.backdoorInstalled) {
          return {
            done: false,
            msg: 'DOOR_run4theh111z (m4)',
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        return {
          done: false,
          msg: 'JOIN_BitRunners',
          hn: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: true,
        msg: 'STAGE_9_COMPLETE',
        hn: true,
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
            hn: true,
            hosting: true,
            reserve: CONFIGS.shoppingPrices.sql,
          };
        }
        return {
          done: false,
          msg: 'BUY_SQL 250M',
          hn: true,
          hosting: true,
          reserve: CONFIGS.shoppingPrices.sql,
        };
      }
      return {
        done: true,
        msg: 'STAGE_10_COMPLETE',
        hn: true,
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
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }

        if (p?.money < 1e11) {
          return {
            done: false,
            msg: `100 Billion`,
            hn: false,
            hosting: true,
            reserve: 1e11,
          };
        }

        return {
          done: false,
          msg: 'JOIN_Daedalus',
          hn: false,
          hosting: true,
          reserve: 1e11,
        };
      }

      // NOTE: Get Red pill
      // NOTE: Install red pill
      return {
        done: true,
        msg: 'STAGE_11_COMPLETE',
        hn: true,
        hosting: true,
        reserve: 0,
      };
    }

    case 12: {
      // ******** w0r1d_d43m0n
      if (ServerInfo.list(ns).includes('w0r1d_d43m0n')) {
        const host = ns.getServer('w0r1d_d43m0n');
        const sLevel = host.requiredHackingSkill || 9999;
        if (p?.level < sLevel) {
          return {
            done: false,
            msg: `LVL_${host.requiredHackingSkill}`,
            hn: true,
            hosting: true,
            reserve: 0,
          };
        }
        return {
          done: false,
          msg: `BACKDOOR_w0r1d_d43m0n (m5)`,
          hn: true,
          hosting: true,
          reserve: 0,
        };
      }
      return {
        done: false,
        msg: 'INSTALL_REDPILL',
        hn: true,
        hosting: true,
        reserve: 0,
      };
    }
    default: {
      return {
        done: false,
        msg: 'ERROR',
        hn: true,
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
