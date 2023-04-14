/* eslint-disable */
import { NS } from '@ns';
import { BitnodeDB } from '/system/cache/DB';
import { Bitnode } from '/system/bitnode/Bitnode';
/* eslint-enable */

export const main = async (ns: NS) => {
  const bitnodeFilePath = ns.args[0] as string;
  const saved = await JSON.parse(ns.read(bitnodeFilePath));
  const bitnode = new Bitnode(ns, saved.node, saved.level, saved.done);
  await BitnodeDB.update(ns, bitnode);
};
