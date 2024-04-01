/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo, Server } from '/os/modules/Server';
/* eslint-enable */

export function nukeServer(ns: NS, hostname: string, challenge: number) {
  if (challenge >= 5) {
    ns.sqlinject(hostname);
  }
  if (challenge >= 4) {
    ns.httpworm(hostname);
  }
  if (challenge >= 3) {
    ns.relaysmtp(hostname);
  }
  if (challenge >= 2) {
    ns.ftpcrack(hostname);
  }
  if (challenge >= 1) {
    ns.brutessh(hostname);
  }

  try {
    ns.nuke(hostname);
  } catch (error) {
    ns.print(error);
  }

  return ns.hasRootAccess(hostname);

  // ******** Initialize
}

export function reclaimer(ns: NS, pChallenge: number) {
  const servers = ServerInfo.list(ns)
    .filter((h: string) => h !== 'home')
    .map((h: string) => ServerInfo.details(ns, h))
    .filter((s: Server) => !s.isServer && s.challenge <= pChallenge)
    .forEach((s: Server) => {
      ns.tprint(`Server: ${s.hostname} | ${s.challenge}`);
      nukeServer(ns, s.hostname, s.challenge);
    });
}
