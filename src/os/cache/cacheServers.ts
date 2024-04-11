/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo } from '/os/modules/Server';
// import { ControlCache, ServersCache } from '/os/modules/Cache';
/* eslint-enable */

// NOTE: DELETE ME

// export const main = async (ns: NS) => {
//   const control = ControlCache.read(ns, 'control');
//   if (control) {
//     control.serverNode.forEach(async (hostname: string) => {
//       await ServersCache.update(ns, ServerInfo.details(ns, hostname));
//     });

//     control.serverFocus.forEach(async (hostname: string) => {
//       await ServersCache.update(ns, ServerInfo.details(ns, hostname));
//     });
//   }
// };
