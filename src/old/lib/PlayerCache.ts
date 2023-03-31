/* eslint-disable */
import { NS } from '@ns';
import { Cache, PORTS } from '../zDB';
/* eslint-enable */

/**
 * Note: File meant to be zero-ram and imported
 */

export const PlayerCache = {
  all(ns: NS) {
    return Cache.all(ns, PORTS.players);
  },
  read(ns: NS, id) {
    return Cache.read(ns, PORTS.players, id);
  },
  async update(ns: NS, obj) {
    return await Cache.update(ns, PORTS.players, obj);
  },
  async delete(ns, id) {
    return await Cache.delete(ns, PORTS.players, id);
  },
};
