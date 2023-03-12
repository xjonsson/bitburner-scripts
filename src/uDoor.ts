/* eslint-disable */
import { NS } from '@ns';
import Player from './zPlayer.js';
/* eslint-enable */

// NOTE: You must be on the terminal tab for injection to work.

const terminalInput = document.getElementById('terminal-input');
const handler = Object.keys(terminalInput)[1];

function routeScan(
  ns: NS,
  parent: string,
  server: string,
  target: string,
  route: any
) {
  const children = ns.scan(server);
  for (const child of children) {
    if (parent !== child) {
      if (child === target) {
        route.unshift(child);
        route.unshift(server);
        return true;
      }
      if (routeScan(ns, server, child, target, route)) {
        route.unshift(server);
        return true;
      }
    }
  }
  return false;
}

function ringScan(ns: NS, current: string, ring = new Set()) {
  const connections = ns.scan(current);
  const next = connections.filter((link) => !ring.has(link));
  next.forEach((node) => {
    ring.add(node);
    return ringScan(ns, node, ring);
  });
  return Array.from(ring.keys());
}

function getRoute(ns: NS, hostname: string) {
  const route: any = [];
  routeScan(ns, '', 'home', hostname, route);
  return `connect ${route.join('; connect ')}; backdoor;`;
}

function openDoor(ns: NS, route: string) {
  terminalInput.value = route;
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({
    key: 'Enter',
    preventDefault: () => null,
  });
}

function doorSort(doorA: any, doorB: any) {
  return doorA.level - doorB.level;
}

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('scan');
  ns.disableLog('sleep');

  const p = new Player(ns);
  const rowHeader = ' %5s | %-20s | %-24s ';

  const network = ringScan(ns, 'home')
    .filter((hostname) => hostname !== 'home')
    .map((hostname) => {
      const nodeData = ns.getServer(hostname as string);
      const node = {
        hostname: nodeData.hostname,
        server: nodeData.purchasedByPlayer,
        level: nodeData.requiredHackingSkill,
        root: nodeData.hasAdminRights,
        challenge: nodeData.numOpenPortsRequired,
        open: nodeData.openPortCount,
        door: nodeData.backdoorInstalled,
      };

      return node;
    })
    .filter((node) => {
      if (node.root && !node.door && !node.server) {
        return true;
      }
      return false;
    })
    .sort(doorSort);

  const doors: any = [];

  network.forEach((node) => {
    // const msgRoot = node.level <= p.hacking ? '✓  ' : '⛌  ';
    const msgRoute = getRoute(ns, node.hostname);
    const door = {
      hostname: node.hostname,
      level: node.level,
      route: msgRoute,
    };
    doors.push(door);
    // ns.printf(rowHeader, node.level, msgRoot, node.hostname, msgRoute);
  });

  ns.print(`[Doors]  ${doors.length}`);
  ns.printf(rowHeader, 'Level', 'Server', 'Route');
  ns.printf(rowHeader, '-----', '------------------', '------------------');

  while (doors.length > 0) {
    const delay = ns.getHackTime(doors[0].hostname) / 4 + 1000;
    if (doors[0].level <= p.hacking) {
      ns.printf(rowHeader, doors[0].level, doors[0].hostname, '');
      openDoor(ns, doors[0].route);
      doors.shift();
    }
    await ns.sleep(delay);
  }
}
