/* eslint-disable */
import { NS } from '@ns';
import { PORTS } from '/configs';
/* eslint-enable */

export const DB = {
  all(ns: NS, port: number) {
    const data: any = ns.peek(port);
    if (data === 'NULL PORT DATA') {
      return new Map();
    }

    const res = JSON.parse(data);
    return new Map(res.map((o: any) => [o.id, o]));
  },
  read(ns: NS, port: number, id: string) {
    const cached = DB.all(ns, port);
    return cached.get(id);
  },
  async update(ns: NS, port: number, obj: any) {
    const cached = DB.all(ns, port);
    cached.set(obj.id, obj);
    ns.clearPort(port);
    await ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())));
    return cached;
  },
  async delete(ns: NS, port: number, id: string) {
    const cached = DB.all(ns, port);
    cached.delete(id);
    ns.clearPort(port);
    await ns.tryWritePort(port, JSON.stringify(Array.from(cached.values())));
    return cached;
  },
};

export const BitnodeDB = {
  all(ns: NS) {
    return DB.all(ns, PORTS.BITNODE);
  },
  read(ns: NS, id: any) {
    return DB.read(ns, PORTS.BITNODE, id);
  },
  async update(ns: NS, obj: any) {
    return DB.update(ns, PORTS.BITNODE, obj);
  },
  async delete(ns: NS, id: string) {
    return DB.delete(ns, PORTS.BITNODE, id);
  },
};
