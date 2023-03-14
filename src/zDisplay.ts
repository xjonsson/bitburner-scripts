/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Network from './zNetwork.js';
/* eslint-enable */

const cellsMax = 4;

export default class Display {
  ns: NS;
  p: Player;
  xnet: Network;

  constructor(ns: NS, player: Player, network: Network) {
    this.ns = ns;
    this.p = player;
    this.xnet = network;
  }

  displayStats(bShort = false) {
    const header = bShort
      ? ' %5s | %4s | %8s '
      : ' %5s | %4s | %9s | %8s | %8s ';

    if (!bShort) {
      this.ns.printf(header, 'bNode', 'Hack', 'Challenge', 'Shop', 'Money');
      this.ns.printf(
        header,
        this.p.bitnode,
        this.p.hacking,
        this.p.challenge,
        this.ns.formatNumber(this.p.reserve, 3),
        this.ns.formatNumber(this.p.money, 3)
      );
    } else {
      this.ns.printf(header, 'bNode', 'Hack', 'Money');
      this.ns.printf(
        header,
        this.p.bitnode,
        this.p.hacking,
        this.ns.formatNumber(this.p.money, 3)
      );
    }
  }

  displayShopPrograms() {
    const header = ' %5s | %-7s | %-8s ';
    this.ns.printf(header, 'Buy', 'Program', 'Cost');
    Object.keys(this.p.programs)
      .filter((prog) => !this.p.programs[prog])
      .forEach((prog) => {
        this.ns.printf(
          header,
          '',
          prog,
          this.ns.formatNumber(configs.softwareCost[prog], 3)
        );
      });
  }

  displayShopHacknet() {
    const { hacknet } = this.xnet;
    this.xnet.updateHacknet();
    let cellCount = 0;
    const cells: any = ['', '', '', ''];
    const rows = ' %15s | %15s | %15s | %15s ';
    this.ns.printf(
      ' %-15s | %15s | %15s | %15s ',
      `Hacknet ${this.xnet.hacknetDone}/${configs.nodesTargetCount}`,
      `Level ${configs.nodesTargetLevel}`,
      `RAM ${configs.nodesTargetRAM}`,
      `Cores ${configs.nodesTargetCores}`
    );
    hacknet.forEach((node: any, index) => {
      if (!node.maxed) {
        if (index === hacknet.length - 1) {
          cells[cellCount] = node.maxed
            ? `${node.name} * Max`
            : `${node.name} L${node.level} (${node.ram}x${node.cores})`;
          this.ns.printf(rows, cells[0], cells[1], cells[2], cells[3]);
        } else {
          cells[cellCount] = node.maxed
            ? `${node.name} * Max`
            : `${node.name} L${node.level} (${node.ram}x${node.cores})`;
          cellCount += 1;
          if (cellCount >= cellsMax) {
            this.ns.printf(rows, cells[0], cells[1], cells[2], cells[3]);
            cells[0] = '';
            cells[1] = '';
            cells[2] = '';
            cells[3] = '';
            cellCount = 0;
          }
        }
      }
    });
  }

  displayShopServers() {
    const { servers } = this.xnet;
    this.xnet.updateServers();
    let cellCount = 0;
    const cells: any = ['', '', '', ''];
    const rows = ' %16s | %16s | %16s | %16s ';
    this.ns.printf(
      ' %-16s | %16s ',
      `Servers ${this.xnet.serverDone}/${configs.serversTargetCount}`,
      `RAM ${this.ns.formatRam(configs.serversTargetRAM, 4)}`
    );
    servers.forEach((node: any, index) => {
      if (!node.maxed) {
        if (index === servers.length - 1) {
          cells[cellCount] = node.maxed
            ? `${node.name} * Max`
            : `${node.name} (${this.ns.formatRam(node.ram, 2)})`;
          this.ns.printf(rows, cells[0], cells[1], cells[2], cells[3]);
        } else {
          cells[cellCount] = node.maxed
            ? `${node.name} * Max`
            : `${node.name} (${this.ns.formatRam(node.ram, 2)})`;
          cellCount += 1;
          if (cellCount >= cellsMax) {
            this.ns.printf(rows, cells[0], cells[1], cells[2], cells[3]);
            cells[0] = '';
            cells[1] = '';
            cells[2] = '';
            cells[3] = '';
            cellCount = 0;
          }
        }
      }
    });
  }
}
