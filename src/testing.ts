/* eslint-disable-next-line */
import { NS } from '@ns';

export async function main(ns: NS) {
  function test(name: string, times: number) {
    for (let n = 0; n < times; n += 1) {
      ns.print(`[MMMMMM Multiplier] ${n} times ${name}`);
    }
  }

  const something = 5;
  ns.tail();
  ns.clearLog();
  ns.print(`[Debug] This is something to be printed ${something}`);
  test('test', 5);
}
