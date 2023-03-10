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
  ringFocusMin: number;
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
  ringFocusMin: 1,
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
    const rFocus = [];
    if (controller.ringTargets.length > 0) {
      const fMin = Math.ceil(controller.hacking / 3);
      const fMax = Math.ceil(controller.hacking / 2); // FIXME:

      if (fMin > controller.ringFocusMin && fMin <= controller.hacking) {
        controller.ringFocusMin = fMin;
      }

      if (fMax > controller.ringFocusMax && fMax <= controller.hacking) {
        controller.ringFocusMax = fMax;
      }

      controller.ringTargets.sort(focusSort).filter((node) => {}); // FIXME:
    }
  }

  // root all servers with 0 ports
  // select the best target for level
  // scp xmin to new bots

  function updatePlayer() {
    const { hacking } = ns.getPlayer().skills;
    if (hacking > controller.hacking) {
      ns.print('We have a new level');
      controller.hacking = hacking;
      getPrograms();
      getRing();
      getFocus();

      return true;
    }
    return false;
  }

  function updateDisplay() {
    ns.clearLog();
    ns.print(
      `[Hacking] ${controller.hacking} | Focus (${controller.ringFocusMin} - ${controller.ringFocusMax})`
    );

    const rowRing = '%-9s | %5s | %7s | %4s | %7s | %-12s';
    ns.printf(
      rowRing,
      '[Ring]',
      'Total',
      'Reclaim',
      'Bots',
      'Targets',
      'Focus'
    );
    ns.printf(
      rowRing,
      '',
      `${controller.ringAll.length}`,
      `${controller.ringReclaim.length}`,
      `${controller.ringBots.length}`,
      `${controller.ringTargets.length}`,
      '*n00dles'
    );

    const rowTargets = '%-9s | %5s | %5s | %9s | %7s | %-12s';
    ns.printf(
      rowTargets,
      '[Targets]',
      'Level',
      'Sec',
      'Available',
      'Max',
      'Server'
    );
    ns.printf(
      rowTargets,
      '',
      '*999',
      '*+5.00',
      '*$123.00B',
      '*123.00B',
      '*n00dles'
    );
  }

  while (true) {
    updatePlayer();
    updateDisplay();
    await ns.sleep(flags.refresh as number);
  }
}

const server = {
  hasAdminRights: true,
  hostname: 'harakiri-sushi',
  ip: '85.2.9.7',
  maxRam: 16,
  ramUsed: 0,
  ftpPortOpen: false,
  httpPortOpen: false,
  smtpPortOpen: false,
  sqlPortOpen: false,
  sshPortOpen: false,
  hackDifficulty: 15,
  minDifficulty: 5,
  moneyAvailable: 4000000,
  moneyMax: 100000000,
  numOpenPortsRequired: 0,
  requiredHackingSkill: 40,
};

const player = {
  hp: { current: 10, max: 10 },
  skills: {
    hacking: 81,
    strength: 1,
    defense: 1,
    dexterity: 1,
    agility: 1,
    charisma: 1,
    intelligence: 0,
  },
  exp: {
    hacking: 2033.3142387672988,
    strength: 0,
    defense: 0,
    dexterity: 0,
    agility: 0,
    charisma: 0,
    intelligence: 0,
  },
  mults: {
    hacking_chance: 1.1703288165374026,
    hacking_speed: 1.171894225433512,
    hacking_money: 1.5259389331269984,
    hacking_grow: 1.0615227360883468,
    hacking: 1.5920829273158414,
    strength: 1.0615227360883468,
    defense: 1.0615227360883468,
    dexterity: 1.0615227360883468,
    agility: 1.0615227360883468,
    charisma: 1.0615227360883468,
    hacking_exp: 2.026828387925936,
    strength_exp: 1.342826261151759,
    defense_exp: 1.342826261151759,
    dexterity_exp: 1.342826261151759,
    agility_exp: 1.342826261151759,
    charisma_exp: 1.342826261151759,
    company_rep: 1.0615227360883468,
    faction_rep: 1.0615227360883468,
    crime_money: 1.0615227360883468,
    crime_success: 1.0615227360883468,
    hacknet_node_money: 2.6772598581713187,
    hacknet_node_purchase_cost: 0.720662849689855,
    hacknet_node_ram_cost: 0.9420429407710522,
    hacknet_node_core_cost: 0.9420429407710522,
    hacknet_node_level_cost: 0.8007364996553944,
    work_money: 1.0615227360883468,
    bladeburner_max_stamina: 1,
    bladeburner_stamina_gain: 1,
    bladeburner_analysis: 1,
    bladeburner_success_chance: 1,
  },
  numPeopleKilled: 0,
  money: 71054.93919306507,
  city: 'Sector-12',
  location: 'Alpha Enterprises',
  bitNodeN: 1,
  totalPlaytime: 619442400,
  playtimeSinceLastAug: 267508400,
  playtimeSinceLastBitnode: 619442400,
  jobs: {},
  factions: [],
  entropy: 0,
};
