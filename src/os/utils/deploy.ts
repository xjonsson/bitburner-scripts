/* eslint-disable */
import { NS } from '@ns';
import { DEPLOY } from '/os/configs';
/* eslint-enable */

const { MIN, HACK, WEAK, GROW, SHARE } = DEPLOY;

// ******** Copy scripts and return true if successful
export default function deployScripts(ns: NS, hostname: string): boolean {
  // ns.tprint(`Deploy: ${result} ${hostname}`);
  return ns.scp([MIN.X, HACK.X, WEAK.X, GROW.X, SHARE.X], hostname, 'home');
}
