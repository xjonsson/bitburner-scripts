/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/os/configs';
/* eslint-enable */

// ******** Cache DB ********
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

// ******** CONTROL CACHE ********
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
