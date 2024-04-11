/* eslint-disable */
import { NS } from '@ns';
import { DEPLOY } from '/os/configs';
import { ServerInfo, Server } from '/os/modules/Server';
import ServerTarget from '/os/modules/ServerTarget';
/* eslint-enable */

const { xHack, xWeak, xGrow } = DEPLOY;
const { xHackRam, xWeakRam, xGrowRam } = DEPLOY;

// ******** Utility
function threads(ram: number, script = 1.6): number {
  return Math.floor(ram / script);
}

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('getHackingLevel');
  ns.disableLog('asleep');
  ns.disableLog('scan');

  ns.clearLog();
  ns.tail();

  // NOTE: ONETIME CODE
  // ******** Initialize

  // NOTE: DOES`THE LOOP
  while (true) {
    ns.clearLog();

    // Servers
    const servers = ServerInfo.list(ns)
      .filter((h: string) => h !== 'home')
      .map((h: string) => ServerInfo.details(ns, h));

    // Bots
    // const nodes = servers
    //   .filter((s: Server) => s.isNode)
    //   .sort((a: Server, b: Server) => b.ram.now - a.ram.now);
    // const ramTotal = nodes.reduce(
    //   (totalRam: number, s: Server) => totalRam + s.ram.now,
    //   0
    // );

    const targets = servers
      .filter((s: Server) => s.isTarget)
      .map((s: Server) => {
        const st = new ServerTarget(ns, s.hostname);
        // if (st.batch.dRam < ramTotal) {
        //   st.aBatch = true;
        // }
        return st;
      })
      .sort(
        (a: ServerTarget, b: ServerTarget) => b.sanity.value - a.sanity.value
      );

    // ns.print(
    //   `Nodes: ${nodes.length} | Ram Now: ${ns.formatRam(
    //     ramTotal
    //   )} (${ramTotal})`
    // );
    ns.print('===== DEBUG =====');

    targets.forEach((s: ServerTarget) => {
      const nodes = servers
        .filter((n: Server) => n.isNode && n.ram.now > 0)
        .sort((a: Server, b: Server) => b.ram.now - a.ram.now);

      const ramAvailable = nodes.reduce(
        (totalRam: number, n: Server) => totalRam + n.ram.now,
        0
      );

      const batch = s.getBatch(true, 1);

      // Can we do a full batch
      if (s.aAttack && batch.dRam < ramAvailable) {
        let { tHack } = batch;
        const { tWeak } = batch;
        const { tGrow } = batch;
        const { tWeakAG } = batch;

        nodes.forEach((n: Server) => {
          if (tHack > 0) {
            const tNodeHack = threads(n.ram.now, xHackRam);
            // ns.exec(xhack, source, amount, target, repeat, delay);
            ns.exec(
              xHack,
              n.hostname,
              tNodeHack,
              s.hostname,
              false,
              batch.dHack
            );
            tHack -= tNodeHack;
          }
        });
        ns.print(`${tHack} | ${tWeak} | ${tGrow} | ${tWeakAG}`);
      }

      ns.print(
        `${s.hostname} | ${ns.formatRam(s.sanity.tRam, 2)} | ${ns.formatNumber(
          s.sanity.value,
          2
        )} | ${s.aAttack} | ${s.sanity.action} | ARam: ${ns.formatRam(
          ramAvailable,
          2
        )}`
      );
    });

    // nodes.forEach((s: Server) => {
    //   ns.print(`Host: ${s.hostname} | ${s.ram.now}`);
    // });

    await ns.asleep(1000);
  }
}
