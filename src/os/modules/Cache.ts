/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
/* eslint-enable */

export const Cache = {
  all(ns: NS, port: number) {
    const data: any = ns.peek(port);
    if (data === 'NULL PORT DATA') {
      return new Map();
    }

    const res = JSON.parse(data);
    return new Map(res.map((o: any) => [o.id, o]));
  },

  read(ns: NS, port: number, id: string) {
    const cached = Cache.all(ns, port);
    return cached.get(id);
  },

  async update(ns: NS, port: number, obj: any) {
    const cached = Cache.all(ns, port);
    cached.set(obj.id, obj);
    ns.clearPort(port);
    await ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())));
    return cached;
  },

  async delete(ns: NS, port: number, id: string) {
    const cached = Cache.all(ns, port);
    cached.delete(id);
    ns.clearPort(port);
    await ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())));
    return cached;
  },
};

// CACHE.PLAYER = `${PATHS.CACHE}/cachePlayer.js`;
export const ControlCache = {
  all(ns: NS) {
    return Cache.all(ns, PORTS.CONTROL);
  },
  read(ns: NS, id: string) {
    return Cache.read(ns, PORTS.CONTROL, id);
  },
  async update(ns: NS, obj: any) {
    return Cache.update(ns, PORTS.CONTROL, obj);
  },
  async delete(ns: NS, id: string) {
    return Cache.delete(ns, PORTS.CONTROL, id);
  },
};

// CACHE.BITNODE = `${PATHS.CACHE}/cacheBitnode.js`; // TODO: Add bitnode cache

// CACHE.PLAYER = `${PATHS.CACHE}/cachePlayer.js`;
export const PlayerCache = {
  all(ns: NS) {
    return Cache.all(ns, PORTS.PLAYER);
  },
  read(ns: NS, id: string) {
    return Cache.read(ns, PORTS.PLAYER, id);
  },
  async update(ns: NS, obj: any) {
    return Cache.update(ns, PORTS.PLAYER, obj);
  },
  async delete(ns: NS, id: string) {
    return Cache.delete(ns, PORTS.PLAYER, id);
  },
};
// CACHE.AUGMENTS = `${PATHS.CACHE}/cacheAugments.js`; // TODO: Add augments cache
// CACHE.SLEEVES = `${PATHS.CACHE}/cacheSleeves.js`; // TODO: Add sleeves cache
// CACHE.HACKNET = `${PATHS.CACHE}/cacheHacknet.js`; // TODO: Add hacknet cache

// CACHE.SERVERS = `${PATHS.CACHE}/cacheServers.js`;
export const ServersCache = {
  all(ns: NS) {
    return Cache.all(ns, PORTS.SERVERS);
  },
  read(ns: NS, id: string) {
    return Cache.read(ns, PORTS.SERVERS, id);
  },
  async update(ns: NS, obj: any) {
    return Cache.update(ns, PORTS.SERVERS, obj);
  },
  async delete(ns: NS, id: string) {
    return Cache.delete(ns, PORTS.SERVERS, id);
  },
};

// CACHE.FACTIONS = `${PATHS.CACHE}/cacheFactions.js`; // TODO: Add factions cache
// CACHE.CORPORATIONS = `${PATHS.CACHE}/cacheCorporations.js`; // TODO: Add corporations cache
// CACHE.CRIMES = `${PATHS.CACHE}/cacheCrimes.js`; // TODO: Add crimes cache
// CACHE.STOCKS = `${PATHS.CACHE}/cacheStocks.js`; // TODO: Add stocks cache
