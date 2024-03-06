/* eslint-disable */
import { NS } from '@ns';
import { TIME } from '/os/configs';
/* eslint-enable */

export const launch = async (
  ns: NS,
  script: string,
  threads = 1,
  args: any = []
) => {
  const pid = ns.exec(script, 'home', threads, ...args);
  await ns.asleep(TIME.LAUNCHING);
  while (ns.isRunning(pid)) {
    await ns.asleep(TIME.RUNNING);
  }
};
