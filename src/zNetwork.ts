/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Server from './zServer.js';
import Player from './zPlayer.js';
/* eslint-enable */

export default class Network {
  ns: NS;
  nodesTargetCount: number;
  nodesTargetLevel: number;
  nodesTargetRAM: number;
  nodesTargetCores: number;
  serversTargetCount: number;
  serversTargetRAM: number;
  hacknet: Array<object>;
  servers: Array<object>;
  bots: Array<object>;
  reclaim: Array<object>;
  doors: Array<object>;
  targets: Array<object>;

  constructor(ns: NS) {
    this.ns = ns;
    this.nodesTargetCount = configs.nodesTargetCount;
    this.nodesTargetLevel = configs.nodesTargetLevel;
    this.nodesTargetRAM = configs.nodesTargetRAM;
    this.nodesTargetCores = configs.nodesTargetCores;
    this.serversTargetCount = configs.serversTargetCount;
    this.serversTargetRAM = configs.serversTargetRAM;
    this.hacknet = [];
    this.servers = [];
    this.bots = [];
    this.reclaim = [];
    this.doors = [];
    this.targets = [];
  }

  updateHacknet(): any {
    const nodeCount = this.ns.hacknet.numNodes();
    const nodes = [];
    for (let n = 0; n < nodeCount; n += 1) {
      const exists = this.ns.hacknet.getNodeStats(n);
      const node = {
        id: n,
        exists: true,
        name: exists.name,
        level: exists.level,
        ram: exists.ram,
        cores: exists.cores,
      };
      nodes.push(node);
    }
    if (nodeCount < this.nodesTargetCount) {
      const purchase = this.nodesTargetCount - nodeCount;
      for (let b = 0; b < purchase; b += 1) {
        const node = {
          id: null,
          exists: false,
          name: '~',
          level: this.nodesTargetLevel,
          ram: this.nodesTargetRAM,
          cores: this.nodesTargetCores,
        };
        nodes.push(node);
      }
    }
    this.hacknet = nodes;
    return nodes;
  }

  updateServers(): any {
    const exists = this.ns.getPurchasedServers();
    const serverCount = exists.length;
    const nodes = [];
    for (let s = 0; s < serverCount; s += 1) {
      const server = new Server(this.ns, exists[s]);
      const node = {
        id: s,
        exists: true,
        name: server.hostname,
        ram: server.ram.max,
      };
      nodes.push(node);
    }
    if (serverCount < this.serversTargetCount) {
      const purchase = this.serversTargetCount - serverCount;
      for (let b = 0; b < purchase; b += 1) {
        const node = {
          id: null,
          exists: false,
          name: '~',
          ram: this.serversTargetRAM,
        };
        nodes.push(node);
      }
    }
    this.servers = nodes;
    return nodes;
  }

  updateRing(): any {
    const p = new Player(this.ns);
    const b: any = [];
    const r: any = [];
    const d: any = [];
    const t: any = [];
    const ring = this.ringScan('home')
      .filter((hostname) => hostname !== 'home')
      .map((hostname) => new Server(this.ns, hostname as string));

    ring.forEach((node) => {
      if (node.bot) {
        b.push(node);
      }

      if (node.reclaim && node.canReclaim(p.challenge)) {
        r.push(node);
      }

      if (!node.door && node.canDoor(p.hacking)) {
        d.push(node);
      }

      if (node.target(p.hacking)) {
        t.push(node);
      }
    });
    this.bots = b;
    this.reclaim = r;
    this.doors = d;
    this.targets = t;
    return ring;
  }

  ringScan(current: string, ring = new Set()) {
    const connections = this.ns.scan(current);
    const next = connections.filter((link) => !ring.has(link));
    next.forEach((node) => {
      ring.add(node);
      return this.ringScan(node, ring);
    });
    return Array.from(ring.keys());
  }
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const xnet = new Network(ns);

  if (flags.help) {
    ns.tprint('Network Class');
    return;
  }

  ns.tail();
  ns.clearLog();
  ns.disableLog('ALL');

  ns.print(`[HackNet] ${xnet.hacknet.length}`);
  ns.print(`[Servers] ${xnet.servers.length}`);
  ns.print(`[Bots] ${xnet.bots.length}`);
  ns.print(`[Reclaim] ${xnet.reclaim.length}`);
  ns.print(`[Doors] ${xnet.doors.length}`);
  ns.print(`[Targets] ${xnet.targets.length}`);

  xnet.updateHacknet();
  xnet.updateServers();
  xnet.updateRing();

  ns.print(`--------------------------------`);

  ns.print(`[HackNet] ${xnet.hacknet.length}`);
  ns.print(`[Servers] ${xnet.servers.length}`);
  ns.print(`[Bots] ${xnet.bots.length}`);
  ns.print(`[Reclaim] ${xnet.reclaim.length}`);
  ns.print(`[Doors] ${xnet.doors.length}`);
  ns.print(`[Targets] ${xnet.targets.length}`);
}

/* eslint-disable-next-line */
const sample = {};
