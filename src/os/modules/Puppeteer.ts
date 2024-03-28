/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, DEPLOY } from '/os/configs';
import { ControlCache, ServersCache } from '/os/modules/Cache';
import { Server, ServerInfo } from '/os/modules/Server';
import ServerHack from '/os/modules/ServerHack';
/* eslint-enable */

const { xMin, xHack, xWeak, xGrow, xShare } = DEPLOY;
const { xMinRam, xHackRam, xWeakRam, xGrowRam, xShareRam } = DEPLOY;

// ******** Utility
function threads(ram: number, script = 1.6): number {
  return Math.floor(ram / script);
}

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('exec');
  ns.disableLog('getHackingLevel');
  ns.clearLog();
  // ns.tail();

  // ******** Initialize

  // Launch modules

  const control = ControlCache.read(ns, 'control');
  const servers: any = [];
  if (control) {
    // ns.print(control.serverNode);
    // control.serverNode.forEach((h: string) => {
    //   const s = ServersCache.read(ns, h);
    //   ns.print(`H:${s.hostname} B:${s.isNode} R:${s.ram.max}`);
    // });

    let ramAvailable = 0;
    control.serverNode.forEach((h: string) => {
      const s = ServerInfo.details(ns, h);
      servers.push(s);
      ramAvailable += s.ram.now;
    });

    servers.sort((a: Server, b: Server) => b.ram.now - a.ram.now);

    // servers.forEach((s: Server) => {
    //   ns.print(`B:${s.hostname} R:${s.ram.now}`);
    // });

    ns.print(`Global Ram: ${ramAvailable}`);

    const targets: any = [];
    if (control.serverFocus && ramAvailable > 0) {
      control.serverFocus.forEach((h: string) => {
        targets.push(new ServerHack(ns, h));
      });

      targets
        .filter((s: Server) => s.root)
        .sort((a: ServerHack, b: ServerHack) => b.value.total - a.value.total);

      targets.forEach((sh: ServerHack) => {
        // ns.print(`${sh.hostname} A:${sh.action.action} V:${sh.value.total}`);
        switch (sh.action.action) {
          case 'WEAK': {
            // ns.print('WEAKEN');
            let { weakThreads } = sh;
            servers.forEach((s: Server) => {
              const t = threads(s.ram.now, xWeakRam);
              if (weakThreads > 0 && ramAvailable > 0 && t > 0) {
                ns.print(weakThreads);
                ramAvailable -= t * xWeakRam;
                weakThreads -= t;
                ns.exec(xWeak, s.hostname, t, sh.hostname, false, 0);
                // ns.print(`${s.hostname} T:${t}`);
              }
            });
            break;
          }
          case 'GROW': {
            let growThreads = sh.growThreads(1);
            servers.forEach((s: Server) => {
              const t = threads(s.ram.now, xGrowRam);
              if (growThreads > 0 && ramAvailable > 0 && t > 0) {
                // ns.print(growThreads);
                ramAvailable -= t * xGrowRam;
                growThreads -= t;
                ns.exec(xGrow, s.hostname, t, sh.hostname, false, 0);
                // ns.print(`${s.hostname} T:${t}`);
              }
            });
            break;
          }
          case 'HACK': {
            let { hackThreads } = sh;
            servers.forEach((s: Server) => {
              const t = threads(s.ram.now, xHackRam);
              if (hackThreads > 0 && ramAvailable > 0 && t > 0) {
                // ns.print(growThreads);
                ramAvailable -= t * xHackRam;
                hackThreads -= t;
                ns.exec(xHack, s.hostname, t, sh.hostname, false, 0);
                // ns.print(`${s.hostname} T:${t}`);
              }
            });
            break;
          }
          default:
        }
      });
    }
  }

  // Keep the game loop going
  // while (true) {
  //   await ns.asleep(1000);
  // }
}
