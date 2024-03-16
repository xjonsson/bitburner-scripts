/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo } from '/os/modules/Server';
import { ControlCache, ServersCache } from '/os/modules/Cache';
/* eslint-enable */

export const main = async (ns: NS) => {
  const control = ControlCache.read(ns, 'control');
  control.serverNode.forEach(async (hostname: string) => {
    await ServersCache.update(ns, ServerInfo.details(ns, hostname));
  });
  control.serverFocus.forEach(async (hostname: string) => {
    await ServersCache.update(ns, ServerInfo.details(ns, hostname));
  });

  // const servers = ServerInfo.all(ns);
  // for (const server of servers) {
  //   // ns.tprint(`Host ${server.hostname} | Level: ${server.level}`);
  //   await ServersCache.update(ns, server);
  //   // await ns.asleep(1000);
  }
};
