/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('ALL');

  const pLimit = (ns.args[0] as number) || 100;
  const pHack = ns.getPlayer().skills.hacking;
  const xcode = 'xmin.js';
  const xRAM = ns.getScriptRam(xcode) + 0.1;
  const hRAM = ns.getServerMaxRam('home');
  const hRAMReserve = configs.reserveRAM;
  const hThreads = Math.floor((hRAM - hRAMReserve) / xRAM);
  const targetsLimit = Math.ceil(pHack * (pLimit / 100));

  function miniScan(current: string, ring = new Set()) {
    const connections = ns.scan(current);
    const next = connections.filter((link) => !ring.has(link));
    next.forEach((node) => {
      ring.add(node);
      return miniScan(node, ring);
    });
    return Array.from(ring.keys());
  }

  const xnet = miniScan('home')
    .filter((hostname) => hostname !== 'home')
    .map((hostname) => {
      const nodeData = ns.getServer(hostname as string);
      const node = {
        hostname: nodeData.hostname,
        level: nodeData.requiredHackingSkill,
        server: nodeData.purchasedByPlayer,
        root: nodeData.hasAdminRights,
        target: false,
        bot: false,
        ramMax: nodeData.maxRam,
        moneyMax: nodeData.moneyMax,
        moneyAvailable: nodeData.moneyAvailable,
        challenge: nodeData.numOpenPortsRequired,
        open: nodeData.openPortCount,
        door: nodeData.backdoorInstalled,
        baseDifficulty: nodeData.baseDifficulty,
        hackDifficulty: nodeData.hackDifficulty,
        minDifficulty: nodeData.minDifficulty,
        serverGrowth: nodeData.serverGrowth,
        nodeValue: 0,
        nodeRAM: 0,
        nodeThreads: 0,
      };

      if (
        !node.server &&
        node.moneyMax > 0 &&
        node.open >= node.challenge &&
        node.root &&
        node.level <= pHack
      ) {
        node.target = true;
      }

      if (node.server || (node.ramMax > 0 && node.root)) {
        node.bot = true;
      }

      return node;
    });

  function sortTargets(a: any, b: any) {
    return b.moneyMax - a.moneyMax;
  }

  const targets = xnet
    .filter((node) => node.target && node.level <= targetsLimit)
    .sort(sortTargets);
  const targetsValue = targets.reduce(
    (total, target) => total + target.moneyMax,
    0
  );

  const rowHeader = ' %-10s   %8s | %8s | %8s ';
  ns.printf(rowHeader, 'Resources', 'Reserve', 'RAM', 'Threads');
  ns.printf(
    rowHeader,
    '[Home]',
    `${hRAMReserve}GB`,
    `${hRAM}GB`,
    `${hThreads}`
  );
  ns.printf(rowHeader, '[xmin]', '0GB', `${xRAM}GB`, '1');
  ns.printf(
    rowHeader,
    '----------',
    '--------',
    '--------',
    '----------------------'
  );

  const exes: any = [];
  let targetsRAM = 0;
  let targetsThreads = 0;
  const targetsDisplay: any = [];
  targets.forEach((node) => {
    node.nodeValue = node.moneyMax / targetsValue;
    node.nodeRAM = Math.ceil(hRAM * node.nodeValue);
    node.nodeThreads = Math.floor(node.nodeRAM / xRAM);

    if (node.nodeThreads > 0) {
      targetsRAM += node.nodeRAM;
      targetsThreads += node.nodeThreads;
      targetsDisplay.push(node);
    }
  });

  const rowMonitor = ' %10s | %8s | %8s | %8s | %-12s ';
  ns.printf(rowMonitor, 'Value $', 'Value %', 'Cost RAM', 'Threads', 'Target');
  ns.printf(
    rowMonitor,
    '----------',
    '--------',
    '--------',
    '--------',
    '-----------'
  );
  ns.printf(
    rowMonitor,
    `${ns.formatNumber(targetsValue, 3)}`,
    '100.00%',
    `${targetsRAM}GB`,
    `${targetsThreads}`,
    `H:${targetsLimit} (${pLimit}%)`
  );
  ns.printf(
    rowMonitor,
    '----------',
    '--------',
    '--------',
    '--------',
    '-----------'
  );

  ns.ps('home')
    .filter((proc) => {
      if (proc.filename === xcode) {
        return true;
      }
      return false;
    })
    .map((proc) => proc.pid)
    .forEach((pid) => {
      exes.push(`kill ${pid}`);
    });

  targetsDisplay.forEach((node: any) => {
    ns.printf(
      rowMonitor,
      `${ns.formatNumber(node.moneyMax, 3)}`,
      `${(node.nodeValue * 100).toFixed(2)}%`,
      `${ns.formatRam(node.nodeRAM)}`,
      `${node.nodeThreads}`,
      `${node.hostname}`
    );
    exes.push(`run ${xcode} ${node.hostname} -t ${node.nodeThreads}`);
  });

  const exeConsole = exes.join(';');
  ns.tprint('Run the following for updated targets');
  ns.tprint(exeConsole);
}
