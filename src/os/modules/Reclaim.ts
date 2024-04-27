/* eslint-disable */
import { NS } from '@ns';
import { ServerInfo, Server } from '/os/modules/Server';
/* eslint-enable */

export function nukeServer(ns: NS, hostname: string) {
  try {
    ns.sqlinject(hostname);
  } catch (error) {
    // ns.print(error);
  }
  try {
    ns.httpworm(hostname);
  } catch (error) {
    // ns.print(error);
  }
  try {
    ns.relaysmtp(hostname);
  } catch (error) {
    // ns.print(error);
  }
  try {
    ns.ftpcrack(hostname);
  } catch (error) {
    // ns.print(error);
  }
  try {
    ns.brutessh(hostname);
  } catch (error) {
    // ns.print(error);
  }

  try {
    ns.nuke(hostname);
  } catch (error) {
    // ns.print(error);
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
      nukeServer(ns, s.hostname);
    });
}
