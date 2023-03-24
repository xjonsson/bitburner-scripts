/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export function timeFormat(ns: NS, time: number): string {
  const regH = /( hours*)/gm;
  const regM = /( minutes*)/gm;
  const regS = /( seconds*)/gm;
  return ns
    .tFormat(time)
    .replace(regH, 'h')
    .replace(regM, 'm')
    .replace(regS, 's');
}
