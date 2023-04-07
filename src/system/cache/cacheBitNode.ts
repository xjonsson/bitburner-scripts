// import { BitnodeInfo } from "modules/bitnodes/Bitnodes";
// import { BitNodeCache } from 'modules/bitnodes/BitnodeCache';
/* eslint-disable */
import { NS } from '@ns';
import { MINISAVE } from '/configs';
import { Bitnode } from '/system/bitnode/BitNode';
import { PORTS } from '/configs';
import { BitNodeDB } from '/system/cache/DB';
/* eslint-enable */

export const main = async (ns: NS) => {
  const iNode = await JSON.parse(ns.read(MINISAVE.FILE));
  const currentNode = new Bitnode(ns, iNode.node, iNode.level);
  await BitNodeDB.update(ns, currentNode);
  // const savedNode = JSON.parse(ns.read(BITNODE.CURRENT));
  // ns.print(savedNode);
  // const currentNode = new Bitnode(ns, iNode.node, iNode.level);
  // ns.print(currentNode);
  // ns.tprint(currentNode);
  // await BitNodeDB.update(ns, currentNode);
  // for (const bn of currentNode.values()) {
  //   await BitNodeDB.update(ns, bn);
  // }
  // const bitnodes = BitnodeInfo.all(ns);
  // for (const bn of bitnodes.values()) {
  //   await BitNodeCache.update(ns, bn);
  // }
};
