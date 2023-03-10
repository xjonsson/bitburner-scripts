/* eslint-disable-next-line */
import { NS } from '@ns';

interface Controller {
  hacking: number;
  programs: number;
  ringAll: any[];
  ringReclaim: any[];
  ringBots: any[];
  ringTargets: any[];
  ringFocus: any[];
  ringFocusMax: number;
}

const controller: Controller = {
  hacking: 0,
  programs: 0,
  ringAll: [],
  ringReclaim: [],
  ringBots: [],
  ringTargets: [],
  ringFocus: [],
  ringFocusMax: 1,
};

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 1000],
    ['silent', false],
    ['help', false],
  ]);

  if (flags.help) {
    ns.tprint('Minimal script to hack port 0 targets.');
    ns.tprint(`USAGE: run ${ns.getScriptName()}`);
    ns.tprint(`> run ${ns.getScriptName()} 32`);
    return;
  }

  if (flags.silent !== true) {
    ns.tail();
  }

  ns.disableLog('ALL');
  ns.clearLog();

  function getPrograms() {
    if (controller.programs < 5) {
      const programs = [
        'BruteSSH.exe',
        'FTPCrack.exe',
        'relaySMTP.exe',
        'HTTPWorm.exe',
        'SQLInject.exe',
      ];
      const p = programs.reduce((total: number, program: string) => {
        let t = total;
        if (ns.fileExists(program)) {
          t += 1;
        }
        return t;
      }, 0);

      if (p > controller.programs) {
        controller.programs = p;
      }
    }
    return controller.programs;
  }

  function getRingScan(current: string, ring = new Set()) {
    const connections = ns.scan(current);
    const next = connections.filter((link) => !ring.has(link));
    next.forEach((node) => {
      ring.add(node);
      return getRingScan(node, ring);
    });
    return Array.from(ring.keys());
  }

  function getRing() {
    const ring = getRingScan('home');
    const rAll = [];
    const rReclaim = [];
    const rBots = [];
    const rTargets = [];
    for (const hostname of ring) {
      const node = ns.getServer(hostname as string);
      rAll.push(node);

      if (node.hasAdminRights && node.maxRam > 0) {
        rBots.push(node);
      }

      if (
        node.requiredHackingSkill <= controller.hacking &&
        node.moneyMax > 0
      ) {
        rTargets.push(node);
      }

      if (
        node.numOpenPortsRequired <= controller.programs &&
        !node.hasAdminRights
      ) {
        rReclaim.push(node);
      }
    }

    controller.ringAll = rAll;
    controller.ringReclaim = rReclaim;
    controller.ringBots = rBots;
    controller.ringTargets = rTargets;
    return {
      ringReclaim: controller.ringReclaim,
      ringBots: controller.ringBots,
      ringTargets: controller.ringTargets,
    };
  }

  function focusSort(serverA: any, serverB: any) {
    return serverB.moneyMax - serverA.moneyMax;
  }

  function getFocus() {
    if (controller.ringTargets.length > 0) {
      const fMax = Math.ceil(controller.hacking / 2);

      if (fMax > controller.ringFocusMax && fMax <= controller.hacking) {
        controller.ringFocusMax = fMax;
      }

      const rFocus = controller.ringTargets
        .sort(focusSort)
        .filter((node) => node.requiredHackingSkill <= fMax);

      if (rFocus.length <= 0) {
        return ns.getServer('n00dles');
      }
      controller.ringFocus = rFocus;
      return rFocus;
    }
    return ns.getServer('n00dles');
  }

  function updateFocus() {
    controller.ringFocus.forEach((node, i) => {
      controller.ringFocus[i] = ns.getServer(node.hostname);
    });
  }

  function reclaim() {
    if (controller.ringReclaim.length > 0) {
      controller.ringReclaim.forEach((node) => {
        if (node.numOpenPortsRequired >= 5) {
          ns.sqlinject(node.hostname);
        }
        if (node.numOpenPortsRequired >= 4) {
          ns.httpworm(node.hostname);
        }
        if (node.numOpenPortsRequired >= 3) {
          ns.relaysmtp(node.hostname);
        }
        if (node.numOpenPortsRequired >= 2) {
          ns.ftpcrack(node.hostname);
        }
        if (node.numOpenPortsRequired >= 1) {
          ns.brutessh(node.hostname);
        }
        if (node.numOpenPortsRequired >= 0) {
          ns.nuke(node.hostname);
        }
      });
      getRing();
    }
  }

  // scp xmin to new bots

  function updatePlayer() {
    const { hacking } = ns.getPlayer().skills;
    if (hacking > controller.hacking) {
      ns.print('We have a new level');
      controller.hacking = hacking;
      getPrograms();
      getRing();
      reclaim();
      getFocus();

      return true;
    }
    return false;
  }

  function updateDisplay() {
    ns.clearLog();
    ns.print(
      `[Hacking] ${controller.hacking} | Programs ${controller.programs} | Focus (1-${controller.ringFocusMax})`
    );

    const rowRing = '%-9s | %5s | %6s | %9s | %7s | %-12s';
    ns.printf(rowRing, '[Ring]', 'Total', 'Hack', 'Bots', 'Targets', 'Focus');
    ns.printf(
      rowRing,
      '',
      `${controller.ringAll.length}`,
      `${controller.ringReclaim.length}`,
      `${controller.ringBots.length}`,
      `${controller.ringTargets.length}`,
      `${controller.ringFocus[0].hostname}`
    );

    ns.printf(
      rowRing,
      '---------',
      '-----',
      '------',
      '---------',
      '-------',
      '--------------'
    );

    const rowTargets = '%-9s | %5s | %6s | %9s | %7s | %-12s';
    ns.printf(
      rowTargets,
      '[Targets]',
      'Level',
      'Sec',
      'Available',
      'Max',
      'Server'
    );

    controller.ringFocus.forEach((node, i) => {
      const fAction = i === 0 ? '* Focus' : '';
      ns.printf(
        rowTargets,
        `${fAction}`,
        `${node.requiredHackingSkill}`,
        `+${ns.formatNumber(node.hackDifficulty - node.minDifficulty, 2)}`,
        `${ns.formatNumber(node.moneyAvailable, 2, 1000, true)}`,
        `${ns.formatNumber(node.moneyMax, 2, 1000, true)}`,
        `${node.hostname}`
      );
    });
  }

  while (true) {
    updatePlayer();
    updateFocus();
    updateDisplay();
    await ns.sleep(flags.refresh as number);
  }
}
