/* eslint-disable */
import { NS } from '@ns';
import { DEPLOY } from '/os/configs';
/* eslint-enable */

const { xMin, xHack, xWeak, xGrow, xShare } = DEPLOY;

// ******** Copy scripts and return true if successful
export default function deployScripts(ns: NS, hostname: string): boolean {
  // ns.tprint(`Deploy: ${result} ${hostname}`);
  return ns.scp([xMin, xHack, xWeak, xGrow, xShare], hostname, 'home');
}
