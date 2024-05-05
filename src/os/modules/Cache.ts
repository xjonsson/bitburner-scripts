/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
import { Control } from '/os/modules/Control';
import { Player } from '/os/modules/Player';
import { Banner } from '/os/utils/colors';
/* eslint-enable */

// ******** Cache DB ********
export const Cache = {
  all(ns: NS, port: number) {
    const data: unknown = ns.peek(port);
    if (data === 'NULL PORT DATA') {
      return new Map();
    }

    const res = JSON.parse(String(data)) as string[];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return new Map(res.map((o: any) => [o.id, o]));
  },

  read(ns: NS, port: number, id: string) {
    const cached = Cache.all(ns, port);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cached.get(id);
  },

  update(ns: NS, port: number, obj: any) {
    const cached = Cache.all(ns, port);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    cached.set(obj.id, obj);
    ns.clearPort(port);
    ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())));
    return cached;
  },

  delete(ns: NS, port: number, id: string) {
    const cached = Cache.all(ns, port);
    cached.delete(id);
    ns.clearPort(port);
    ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())));
    return cached;
  },
};

// ******** CONTROL CACHE ********
export const ControlCache = {
  all(ns: NS) {
    return Cache.all(ns, PORTS.CONTROL);
  },
  read(ns: NS, id: string) {
    return Cache.read(ns, PORTS.CONTROL, id) as Control;
  },
  update(ns: NS, obj: any) {
    return Cache.update(ns, PORTS.CONTROL, obj);
  },
  delete(ns: NS, id: string) {
    return Cache.delete(ns, PORTS.CONTROL, id);
  },
};

// ******** PLAYER CACHE ********
export const PlayerCache = {
  all(ns: NS) {
    return Cache.all(ns, PORTS.PLAYER);
  },
  read(ns: NS, id: string) {
    return Cache.read(ns, PORTS.PLAYER, id) as Player;
  },
  update(ns: NS, obj: any) {
    return Cache.update(ns, PORTS.PLAYER, obj);
  },
  delete(ns: NS, id: string) {
    return Cache.delete(ns, PORTS.PLAYER, id);
  },
};

// ******** HACKNET CACHE ********
interface IHacknet {
  done: boolean;
  nodesCount: number;
  nodesLevel: number;
  nodesMaxed: number;
  // list: this.shoppingList, // NOTE: Add back for full shopping list
}

export const HacknetCache = {
  read(ns: NS) {
    const data: unknown = ns.peek(PORTS.HACKNET);
    if (data === 'NULL PORT DATA') {
      return {
        done: false,
        nodesCount: 0,
        nodesLevel: 0,
        nodesMaxed: 0,
        // list: this.shoppingList, // NOTE: Add back for full shopping list
      };
    }
    return data as IHacknet;
  },
  update(ns: NS, done: boolean, count: number, level: number, maxed: number) {
    const pData = {
      done,
      nodesCount: count,
      nodesLevel: level,
      nodesMaxed: maxed,
      // list: this.shoppingList, // NOTE: Add back for full shopping list
    };
    ns.clearPort(PORTS.HACKNET);
    ns.tryWritePort(PORTS.HACKNET, pData);
    return pData;
  },
};
