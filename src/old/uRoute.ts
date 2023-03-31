/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

function routeScan(
  ns: NS,
  node: string,
  current: string,
  target: string,
  route: any
) {
  const connections = ns.scan(current);
  for (const next of connections) {
    if (node !== next) {
      if (next === target) {
        route.unshift(next);
        route.unshift(current);
        return true;
      }
      if (routeScan(ns, current, next, target, route)) {
        route.unshift(current);
        return true;
      }
    }
  }
  return false;
}

function getRoute(ns: NS, hostname: string) {
  const route: any = [];
  routeScan(ns, '', 'home', hostname, route);
  return `connect ${route.join('; connect ')};`;
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const hostname = ns.args[0] as string;

  ns.clearLog();
  ns.disableLog('ALL');

  if (!hostname || flags.help) {
    ns.tprint('Gets route to server.');
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  ns.print(getRoute(ns, hostname));
  ns.tprint(getRoute(ns, hostname));
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
