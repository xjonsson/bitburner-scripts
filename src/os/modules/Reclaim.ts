/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export function reclaimServer(ns: NS, hostname: string) {
  // ns.tprint(`We would try on ${hostname}`);
  try {
    ns.brutessh(hostname);
  } catch (error) {
    ns.print(error);
  }
  try {
    ns.ftpcrack(hostname);
  } catch (error) {
    ns.print(error);
  }
  try {
    ns.relaysmtp(hostname);
  } catch (error) {
    ns.print(error);
  }
  try {
    ns.httpworm(hostname);
  } catch (error) {
    ns.print(error);
  }
  try {
    ns.sqlinject(hostname);
  } catch (error) {
    ns.print(error);
  }
  try {
    ns.nuke(hostname);
  } catch (error) {
    ns.print(error);
  }

  return ns.hasRootAccess(hostname);

  // ******** Initialize
}
