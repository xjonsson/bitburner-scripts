/* eslint-disable */
import { NS } from '@ns';
import { ControlCache, PlayerCache } from '/os/modules/Cache';
import { ControlInfo } from '/os/modules/Control';
import { CONFIGS, TIME } from '/os/configs';
import deployScripts from '/os/utils/deploy';
/* eslint-enable */

export async function main(ns: NS) {
  ns.disableLog('disableLog');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('purchaseServer');
  ns.disableLog('scp');
  ns.disableLog('asleep');
  ns.clearLog();
  ns.tail();

  // ******** Initialize
  const { moneyReserve } = CONFIGS;
  const { hostingMoneyRatio } = CONFIGS.moneyRatio;
  const hostingSleepTime = TIME.HOSTING;
  const { hostingTargetCount, hostingStartRam, hostingTargetRam } =
    CONFIGS.hosting;

  let serverRam = hostingStartRam;

  function getReserve() {
    const stage = ControlCache.read(ns, 'control')?.stage;
    switch (stage) {
      case 1: {
        return CONFIGS.shoppingPrices.tor;
      }
      case 2: {
        return CONFIGS.shoppingPrices.ssh;
      }
      case 4: {
        return CONFIGS.shoppingPrices.ftp;
      }
      case 6: {
        return CONFIGS.shoppingPrices.smtp;
      }
      case 8: {
        return CONFIGS.shoppingPrices.http;
      }
      case 10: {
        return CONFIGS.shoppingPrices.sql;
      }
      default: {
        return 0;
      }
    }
  }

  function getMoney() {
    return (
      (ns.getServerMoneyAvailable('home') - (moneyReserve + getReserve())) *
      hostingMoneyRatio
    );
  }

  function updateShop() {
    const shop = [];
    const servers = ns.getPurchasedServers();
    const serverCount = servers.length;

    if (serverCount < hostingTargetCount) {
      shop.push({
        id: null,
        cost: ns.getPurchasedServerCost(serverRam),
        type: 'SERVER_NEW',
        text: `server (${serverRam})`,
      });
    }

    ns.print(`💸 ${getReserve()}`);
    ns.printf(' %2s %-5s %4s %5s ', 'ID', 'HOST', 'RAM', 'Cost');
    servers
      .map((hostname, index) => ({
        id: index,
        name: hostname,
        ram: ns.getServerMaxRam(hostname),
      }))
      .filter((server) => server.ram < hostingTargetRam)
      .forEach((existing) => {
        shop.push({
          id: existing.id,
          name: existing.name,
          cost: ns.getPurchasedServerUpgradeCost(
            existing.name,
            existing.ram * 2
          ),
          ram: existing.ram,
          type: 'SERVER_RAM',
          text: `server RAM (${existing.ram * 2})`,
        });
        ns.printf(
          ' %2s %-5s %4s %5s ',
          existing.id,
          existing.name,
          ns.formatRam(existing.ram, 0),
          ns.formatNumber(
            ns.getPurchasedServerUpgradeCost(existing.name, existing.ram * 2),
            1
          )
        );
      });

    return shop.sort((a, b) => a.cost - b.cost);
  }

  // function buyServer(sCount: number, sRam: number) {
  //   const serverID = sCount || 0;
  //   const name = `ps-${serverID}`;
  //   const ref = ns.purchaseServer(name, sRam);
  //   return ref;
  // }

  // function buyServerRAM(server: any, sRam: number) {
  //   const upgrade = server.ram * 2;
  //   ns.upgradePurchasedServer(server.name, upgrade);
  //   if (upgrade > sRam) {
  //     serverRam = upgrade;
  //   }
  // }

  // const nodes = ns.getPurchasedServers();
  // const price = ns.getPurchasedServerCost(16);
  // ns.print(nodes);
  // ns.print(price);

  const repeat = true;
  while (repeat) {
    ns.clearLog();
    const purchase = updateShop();

    if (
      purchase.length === 0 &&
      ns.getPurchasedServers().length >= hostingTargetCount
    ) {
      const past = ControlCache.read(ns, 'control');
      const control = ControlInfo.details(ns, past);
      control.isShopHosting = false;
      await ControlCache.update(ns, control);
      return;
    }

    if (purchase.length > 0 && getMoney() > purchase[0].cost) {
      purchase.forEach((next: any) => {
        if (getMoney() > next.cost) {
          // ns.print(
          //   ` Buying [${next.id ? next.id : 'New'}] ${
          //     next.text
          //   } | ${ns.formatNumber(next.cost, 2)}`
          // );

          switch (next.type) {
            case 'SERVER_NEW': {
              const serverID = ns.getPurchasedServers().length || 0;
              const name = `ps-${serverID}`;
              const ref = ns.purchaseServer(name, serverRam);
              deployScripts(ns, name);
              break;
            }
            case 'SERVER_RAM': {
              // buyServerRAM();
              const upgrade = next.ram * 2;
              ns.upgradePurchasedServer(next.name, upgrade);
              if (upgrade > serverRam) {
                serverRam = upgrade;
              }
              break;
            }
            default: {
              ns.print('Could not detect type of purchase');
            }
          }
        } else if (purchase.length > 0) {
          const next = purchase[0];
          // ns.print(
          //   ` Saving [${next.id ? next.id : 'New'}] ${
          //     next.text
          //   } | ${ns.formatNumber(next.cost, 2)}`
          // );
        }
      });
    }
    // const servers = ns.getPurchasedServers();
    // servers.forEach((s) => {
    //   ns.print(s);
    // });
    await ns.asleep(hostingSleepTime);
  }
}
