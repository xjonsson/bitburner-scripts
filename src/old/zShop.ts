/* eslint-disable */
import { NS } from '@ns';
import { configs } from '../configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
import Display from './zDisplay.js';
/* eslint-enable */

function sortPurchase(a: any, b: any) {
  return a.cost - b.cost;
}

export default class Shop {
  ns: NS;
  p: Player;
  xnet: Network;
  purchase: Array<any>;
  levelRAM: number;

  constructor(ns: NS, player: Player, network: Network) {
    this.ns = ns;
    this.p = player;
    this.xnet = network;
    this.purchase = [];
    this.levelRAM = 2;
  }

  get shop() {
    return this.purchase;
  }

  buyNext() {
    if (this.purchase.length > 0 && this.p.money.now > this.purchase[0].cost) {
      this.purchase.forEach((next: any) => {
        if (this.p.money.now >= next.cost) {
          this.ns.print(
            ` Buying [${next.id ? next.id : 'New'}] ${
              next.text
            } | ${this.ns.formatNumber(next.cost, 2)}`
          );
          switch (next.type) {
            case 'serverNew': {
              this.buyServer();
              break;
            }
            case 'serverRAM': {
              this.buyServerRAM(next);
              break;
            }
            case 'hnetNew': {
              this.buyNode();
              break;
            }
            case 'hnetLevel': {
              this.buyNodeLevel(next);
              break;
            }
            case 'hnetRAM': {
              this.buyNodeRAM(next);
              break;
            }
            case 'hnetCores': {
              this.buyNodeCores(next);
              break;
            }
            default: {
              this.ns.print('Could not detect type of purchase');
            }
          }
        }
      });
    } else if (this.purchase.length > 0) {
      const next = this.purchase[0];
      this.ns.print(
        ` Saving [${next.id ? next.id : 'New'}] ${
          next.text
        } | ${this.ns.formatNumber(next.cost, 2)}`
      );
    }
  }

  buyServer() {
    const serverID = this.xnet.serverCount || 0;
    const name = `ps-${serverID}`;
    const ref = this.ns.purchaseServer(name, this.levelRAM);
    return ref;
  }

  buyServerRAM(server: any) {
    const upgrade = server.ram * 2;
    this.ns.upgradePurchasedServer(server.name, upgrade);
    if (upgrade > this.levelRAM) {
      this.levelRAM = upgrade;
    }
  }

  buyNode() {
    const ref = this.ns.hacknet.purchaseNode();
    return ref;
  }

  buyNodeLevel(node: any) {
    this.ns.hacknet.upgradeLevel(node.id, 1);
  }

  buyNodeRAM(node: any) {
    this.ns.hacknet.upgradeRam(node.id, 1);
  }

  buyNodeCores(node: any) {
    this.ns.hacknet.upgradeCore(node.id, 1);
  }

  updateShopping() {
    const shop = [];
    if (this.xnet.serverDone < this.xnet.serversTargetCount) {
      const servers = this.ns.getPurchasedServers();
      const serversCount = servers.length;

      if (serversCount < this.xnet.serversTargetCount) {
        shop.push({
          id: null,
          cost: this.ns.getPurchasedServerCost(this.levelRAM),
          type: 'serverNew',
          text: `server (${this.levelRAM})`,
        });
      }

      servers
        .map((hostname, index) => ({
          id: index,
          name: hostname,
          ram: this.ns.getServerMaxRam(hostname),
        }))
        .filter((server) => server.ram < this.xnet.serversTargetRAM)
        .forEach((existing) => {
          shop.push({
            id: existing.id,
            name: existing.name,
            cost: this.ns.getPurchasedServerUpgradeCost(
              existing.name,
              existing.ram * 2
            ),
            ram: existing.ram,
            type: 'serverRAM',
            text: `server RAM (${existing.ram * 2})`,
          });
        });
    }

    if (this.xnet.hacknetDone < this.xnet.nodesTargetCount) {
      const nodesCount = this.ns.hacknet.numNodes();

      if (nodesCount < this.xnet.nodesTargetCount) {
        shop.push({
          id: null,
          cost: this.ns.hacknet.getPurchaseNodeCost(),
          type: 'hnetNew',
          text: `hacknet Node (1)`,
        });
      }

      for (let n = 0; n < nodesCount; n += 1) {
        const node = this.ns.hacknet.getNodeStats(n);
        const existingNode = {
          id: n,
          level: node.level,
          ram: node.ram,
          cores: node.cores,
        };

        if (existingNode.level < this.xnet.nodesTargetLevel) {
          shop.push({
            id: existingNode.id,
            cost: this.ns.hacknet.getLevelUpgradeCost(existingNode.id, 1),
            level: existingNode.level,
            type: 'hnetLevel',
            text: `hacknet node level (${existingNode.level + 1})`,
          });
        }

        if (existingNode.ram < this.xnet.nodesTargetRAM) {
          shop.push({
            id: existingNode.id,
            cost: this.ns.hacknet.getRamUpgradeCost(existingNode.id, 1),
            ram: existingNode.ram,
            type: 'hnetRAM',
            text: `hacknet node RAM (${existingNode.ram + 1})`,
          });
        }

        if (existingNode.cores < this.xnet.nodesTargetCores) {
          shop.push({
            id: existingNode.id,
            cost: this.ns.hacknet.getCoreUpgradeCost(existingNode.id, 1),
            cores: existingNode.cores,
            type: 'hnetCores',
            text: `hacknet node core (${existingNode.cores + 1})`,
          });
        }
      }
    }

    shop.sort(sortPurchase);

    this.purchase = shop;
    return this.purchase;
  }
}
