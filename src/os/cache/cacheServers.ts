/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo } from '/os/modules/Server';
import { ServersCache } from '/os/modules/Cache';
/* eslint-enable */

export const main = async (ns: NS) => {
  const servers = ServerInfo.all(ns);
  for (const server of servers) {
    await ServersCache.update(ns, server);
    // await ns.asleep(1000);
  }
};
