/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

function scanner(
  ns: NS,
  start = '',
): { route: string[]; servers: Set<string> } {
  const servers = new Set(['home']);
  const route: string[] = [];
  const scan = (
    parent: string,
    server: string,
    target: string,
    routes: string[],
  ) => {
    const children = ns.scan(server);
    for (const child of children) {
      if (!servers.has(child)) {
        servers.add(child);
      }
      if (parent !== child) {
        if (child === target) {
          routes.unshift(child);
          routes.unshift(server);
          return true;
        }

        if (scan(server, child, target, route)) {
          routes.unshift(server);
          return true;
        }
      }
    }
    return false;
  };
  scan('', 'home', start, route);
  return { route, servers };
}

export const Scan = {
  list(ns: NS) {
    const { servers } = scanner(ns);
    return Array.from(servers.keys());
  },
  route(ns: NS, target = '') {
    const { route } = scanner(ns, target);
    return route;
  },
  routeTerminal(ns: NS, target = '', backdoor = false) {
    const { route } = scanner(ns, target);
    if (backdoor) return `connect ${route.join('; connect ')}; backdoor;`;
    return `connect ${route.join('; connect ')};`;
  },
};
