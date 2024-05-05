/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, PORTS } from '/os/configs';
import { PlayerCache, HacknetCache } from '/os/modules/Cache';
import { ServerInfo } from '/os/modules/Server';
import { Banner } from '/os/utils/colors';
// import Hosting from './Hosting';
/* eslint-enable */

// ******** Globals
const { tor, ssh, ftp, smtp, http, sql } = CONFIGS.shoppingPrices;

// TODO: Add faction and augments priorities

export function osLogic(
  ns: NS,
  stage: number,
): {
  done: boolean;
  msg: string;
  hn: boolean;
  hosting: boolean;
  reserve: number;
} {
  const p = PlayerCache.read(ns, 'player');
  const pTOR = p ? p.programs.tor : false;
  const pSSH = p ? p.programs.ssh : false;
  const pFTP = p ? p.programs.ftp : false;
  const pSMTP = p ? p.programs.smtp : false;
  const pHTTP = p ? p.programs.http : false;
  const pSQL = p ? p.programs.sql : false;
  const s = {
    done: false,
    msg: 'MSG',
    hn: true,
    hosting: true,
    reserve: 0,
  };

  switch (stage) {
    // ******** Minimal startup
    // TODO: home ram < 64 save 11m (Less makes it impossible to run)
    // TODO: home ram < 128 save 32m
    // TODO: home ram < 256 save 100m
    case 0: {
      // ******** Get a job
      const jobs = p && Object.keys(p?.work.jobs).length;
      if (jobs < 1) return { ...s, msg: 'Get Job' };
      // ******** Setup Hacknet
      const hnCount = HacknetCache.read(ns).nodesCount;
      if (hnCount < 8) return { ...s, msg: '8 Hacknet Nodes', hosting: false };
      // ******** Get Servers
      const servers = ns.getPurchasedServers().length;
      if (servers < 8) return { ...s, msg: '8 Hosting Nodes', hn: false };
      return { ...s, done: true, msg: 'Stage 0 Complete' };
    }
    case 1: {
      // ******** Join Netburners
      if (!p?.faction.factions.includes('Netburners')) {
        if (p?.level < 80) return { ...s, msg: 'LVL 80' };
        // ******** Hacknet Nodes Level
        const hnLvl = HacknetCache.read(ns).nodesLevel;
        if (hnLvl < 100) return { ...s, msg: 'HNET LVL 100', hosting: false };
        return { ...s, msg: 'JOIN NetBurners', hn: false };
      }

      // ******** Get Tor
      if (!pTOR) {
        if (p?.money < tor) {
          return { ...s, msg: 'SAVE TOR 200K', hn: false, reserve: tor };
        }
        return { ...s, msg: 'BUY TOR 200K', hn: false, reserve: tor };
      }
      return { ...s, done: true, msg: 'Stage 1 Complete' };
    }
    case 2: {
      // ******** Get SSH
      if (!pSSH) {
        if (p?.money < ssh) {
          return { ...s, msg: 'SAVE SSH 500K', hn: false, reserve: ssh };
        }
        return { ...s, msg: 'BUY SSH 500K', hn: false, reserve: ssh };
      }
      return { ...s, done: true, msg: 'Stage 2 Complete', hn: false };
    }
    case 3: {
      // ******** Join CSEC
      if (!p?.faction.factions.includes('CyberSec')) {
        const host = ns.getServer('CSEC');
        const { hasAdminRights: admin, backdoorInstalled: door } = host;
        const lvl = host.requiredHackingSkill || 9999;
        if (p?.level < lvl) return { ...s, msg: `LVL_${lvl}`, hn: false };
        if (!admin) return { ...s, msg: 'ROOT CSEC', hn: false };
        if (!door) return { ...s, msg: 'DOOR CSEC (m1)', hn: false };
        return { ...s, msg: 'JOIN CyberSec', hn: false };
      }
      return { ...s, done: true, msg: 'Stage 3 Complete', hn: false };
    }
    case 4: {
      // ******** Get FTP
      if (!pFTP) {
        if (p?.money < ftp) return { ...s, msg: 'SAVE FTP 1.5M', reserve: ftp };
        return { ...s, msg: 'BUY FTP 1.5M', reserve: ftp };
      }
      return { ...s, done: true, msg: 'Stage 4 Complete' };
    }
    case 5: {
      // ******** Join NiteSec
      if (!p?.faction.factions.includes('NiteSec')) {
        const host = ns.getServer('avmnite-02h');
        const { hasAdminRights: admin, backdoorInstalled: door } = host;
        const lvl = host.requiredHackingSkill || 9999;
        if (p?.level < lvl) return { ...s, msg: `LVL_${lvl}` };
        if (!admin) return { ...s, msg: 'ROOT avmnite-02h' };
        if (!door) return { ...s, msg: 'DOOR avmnite-02h (m2)' };
        return { ...s, msg: 'JOIN NiteSec' };
      }
      return { ...s, done: true, msg: 'Stage 5 Complete' };
    }
    case 6: {
      // ******** Get SMTP
      if (!pSMTP) {
        if (p?.money < smtp)
          return { ...s, msg: 'SAVE SMTP 5M', reserve: smtp };
        return { ...s, msg: 'BUY SMTP 5M', reserve: smtp };
      }
      return { ...s, done: true, msg: 'Stage 6 Complete' };
    }
    case 7: {
      // ******** Join TheBlackHand
      if (!p?.faction.factions.includes('The Black Hand')) {
        const host = ns.getServer('I.I.I.I');
        const { hasAdminRights: admin, backdoorInstalled: door } = host;
        const lvl = host.requiredHackingSkill || 9999;
        if (p?.level < lvl) return { ...s, msg: `LVL_${lvl}` };
        if (!admin) return { ...s, msg: 'ROOT I.I.I.I' };
        if (!door) return { ...s, msg: 'DOOR I.I.I.I (m3)' };
        return { ...s, msg: 'JOIN TheBlackHand' };
      }
      return { ...s, done: true, msg: 'Stage 7 Complete' };
    }
    case 8: {
      // ******** Get HTTP
      if (!pHTTP) {
        if (p?.money < http)
          return { ...s, msg: 'SAVE HTTP 30M', reserve: http };
        return { ...s, msg: 'BUY HTTP 30M', reserve: http };
      }
      return { ...s, done: true, msg: 'Stage 8 Complete' };
    }
    case 9: {
      // ******** Join BitRunners
      if (!p?.faction.factions.includes('BitRunners')) {
        const host = ns.getServer('run4theh111z');
        const { hasAdminRights: admin, backdoorInstalled: door } = host;
        const lvl = host.requiredHackingSkill || 9999;
        if (p?.level < lvl) return { ...s, msg: `LVL_${lvl}` };
        if (!admin) return { ...s, msg: 'ROOT run4theh111z' };
        if (!door) return { ...s, msg: 'DOOR run4theh111z (m4)' };
        return { ...s, msg: 'JOIN BitRunners' };
      }
      return { ...s, done: true, msg: 'Stage 9 Complete' };
    }
    case 10: {
      // ******** Get SQL
      if (!pSQL) {
        if (p?.money < sql) return { ...s, msg: 'SAVE SQL 250M', reserve: sql };
        return { ...s, msg: 'BUY SQL 250M', reserve: sql };
      }
      return { ...s, done: true, msg: 'Stage 10 Complete' };
    }
    case 11: {
      // ******** Join BitRunners
      if (!p?.faction.factions.includes('Daedalus')) {
        // NOTE: Augments / 30
        if (p?.level < 2500) return { ...s, msg: 'LVL_2500' };
        if (p?.money < 1e11) {
          return { ...s, msg: '100 Billion', hn: false, reserve: 1e11 };
        }
        return { ...s, msg: 'JOIN Daedalus', hn: false, reserve: 1e11 };
      }

      // NOTE: Get Red pill
      // NOTE: Install red pill
      // return { ...s, msg: 'STAGE_0_JOB' };
      return { ...s, done: true, msg: 'Stage 11 Complete' };
    }

    case 12: {
      // ******** w0r1d_d43m0n
      if (ServerInfo.list(ns).includes('w0r1d_d43m0n')) {
        const host = ns.getServer('w0r1d_d43m0n');
        const lvl = host.requiredHackingSkill || 9999;
        if (p?.level < lvl) return { ...s, msg: `LVL_${lvl}` };
        return { ...s, msg: 'BACKDOOR w0r1d_d43m0n (m5)' };
      }
      return { ...s, msg: 'INSTALL REDPILL' };
    }
    default: {
      ns.tprint(Banner.error('Logic', `Stage ${stage.toString()}`));
      return { ...s, msg: 'ERROR' };
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
