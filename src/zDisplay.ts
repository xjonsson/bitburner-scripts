/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs.js';
import Player from './zPlayer.js';
import Server from './zServer.js';
import Network from './zNetwork.js';
/* eslint-enable */

const cellsMax = 4;

function threadsCount(availableRAM: number, scriptRAM: number) {
  return Math.floor(availableRAM / scriptRAM);
}

export default class Display {
  ns: NS;
  p: Player;
  xnet: Network;
  scriptHackRAM: number;
  scriptWeakRAM: number;
  scriptGrowRAM: number;

  constructor(ns: NS, player: Player, network: Network) {
    this.ns = ns;
    this.p = player;
    this.xnet = network;
    this.scriptHackRAM = ns.getScriptRam(configs.xHack);
    this.scriptWeakRAM = ns.getScriptRam(configs.xWeak);
    this.scriptGrowRAM = ns.getScriptRam(configs.xGrow);
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
        this.ns.formatNumber(this.p.money.real, 3)
      );
    } else {
      this.ns.printf(header, 'bNode', 'Hack', 'Money');
      this.ns.printf(
        header,
        this.p.bitnode,
        this.p.hacking,
        this.ns.formatNumber(this.p.money.real, 3)
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
    this.ns.print('\n');
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

  displayNetwork() {
    const home = new Server(this.ns, 'home');
    const { reclaim } = this.xnet;

    const totalRAM =
      home.ram.now + this.xnet.serverRAM + this.xnet.reclaimedRAM;
    const totalThreads = threadsCount(totalRAM, this.scriptGrowRAM);
    const totalHack = threadsCount(totalRAM, this.scriptHackRAM);
    const totalWeak = threadsCount(totalRAM, this.scriptWeakRAM);
    const totalGrow = threadsCount(totalRAM, this.scriptGrowRAM);

    const rows = ' %-7s %5s | %8s | %8s | %8s | %8s | %8s | %-12s ';
    this.ns.print('\n');
    this.ns.printf(
      ' %-7s  %5s  %8s | %8s | %8s | %8s | %8s  %-12s ',
      '',
      '',
      'RAM',
      'Threads',
      'Hack',
      'Weak',
      'Grow',
      ''
    );
    this.ns.printf(
      rows,
      'Net',
      `${this.xnet.networkOwnership}/${this.xnet.networkCount}`,
      this.ns.formatRam(totalRAM),
      totalThreads,
      totalHack,
      totalWeak,
      totalGrow,
      'Hostname'
    );
    this.ns.printf(
      rows,
      '-------',
      '-----',
      '--------',
      '--------',
      '--------',
      '--------',
      '--------',
      '--------'
    );
    this.ns.printf(
      rows,
      `Home`,
      `1`,
      this.ns.formatRam(home.ram.now, 2),
      threadsCount(home.ram.now, this.scriptGrowRAM),
      threadsCount(home.ram.now, this.scriptHackRAM),
      threadsCount(home.ram.now, this.scriptWeakRAM),
      threadsCount(home.ram.now, this.scriptGrowRAM),
      ''
    );
    this.ns.printf(
      rows,
      `Servers`,
      this.xnet.serverCount,
      this.ns.formatRam(this.xnet.serverRAM, 2),
      threadsCount(this.xnet.serverRAM, this.scriptGrowRAM),
      threadsCount(this.xnet.serverRAM, this.scriptHackRAM),
      threadsCount(this.xnet.serverRAM, this.scriptWeakRAM),
      threadsCount(this.xnet.serverRAM, this.scriptGrowRAM),
      ''
    );
    this.ns.printf(
      rows,
      `Taken`,
      this.xnet.reclaimedCount,
      this.ns.formatRam(this.xnet.reclaimedRAM, 2),
      threadsCount(this.xnet.reclaimedRAM, this.scriptGrowRAM),
      threadsCount(this.xnet.reclaimedRAM, this.scriptHackRAM),
      threadsCount(this.xnet.reclaimedRAM, this.scriptWeakRAM),
      threadsCount(this.xnet.reclaimedRAM, this.scriptGrowRAM),
      ''
    );
    if (reclaim.length > 0) {
      this.ns.printf(
        rows,
        `Reclaim`,
        this.xnet.reclaimCount,
        `~${this.ns.formatRam(this.xnet.reclaimRAM, 2)}`
      );
      this.ns.printf(
        rows,
        '-------',
        '-----',
        '--------',
        '--------',
        '--------',
        '--------',
        '--------',
        '--------'
      );
      reclaim
        .sort((a: any, b: any) => a.challenge - b.challenge)
        .forEach((r: any) => {
          this.ns.printf(
            rows,
            'Reclaim',
            r.challenge,
            this.ns.formatRam(r.ram.max, 2),
            '',
            '',
            '',
            '',
            r.hostname
          );
        });
    }
    this.ns.printf(
      rows,
      `Bots`,
      this.xnet.botCount,
      this.ns.formatRam(this.xnet.botsRAM, 2),
      threadsCount(this.xnet.botsRAM, this.scriptGrowRAM),
      threadsCount(this.xnet.botsRAM, this.scriptHackRAM),
      threadsCount(this.xnet.botsRAM, this.scriptWeakRAM),
      threadsCount(this.xnet.botsRAM, this.scriptGrowRAM),
      ''
    );
  }

  displayTargets(limit = -1, xmap: any) {
    const { targets } = this.xnet;
    const tFocus: any = targets.sort(
      (a: any, b: any) => b.nodeValueHWGW - a.nodeValueHWGW
    )[0];
    targets.sort((a: any, b: any) => b.money.max - a.money.max);

    if (targets.length > 0) {
      const rows =
        ' %3s | %5s | %6s | %8s | %8s | %12s | %12s | %12s | %6s |  %-7s | %-12s ';

      this.ns.print('\n');
      this.ns.printf(
        ' %-5s %-19s %5s | %8s | %12s | %12s | %12s             %-7s | %-12s ',
        'Focus',
        tFocus.hostname,
        'Money',
        'Max',
        'Hack',
        'Weak',
        'Grow',
        '',
        'Server'
      );
      this.ns.printf(
        rows,
        'CRD',
        'HWGW',
        'Sec',
        this.ns.formatNumber(this.xnet.targetsValueNow, 2),
        this.ns.formatNumber(this.xnet.targetsValue, 2),
        '',
        '',
        '',
        'Action',
        'Update',
        targets.length
      );
      this.ns.printf(
        rows,
        '---',
        '-----',
        '------',
        '--------',
        '--------',
        '------------',
        '------------',
        '------------',
        '------',
        '-------',
        '------------'
      );
      targets.forEach((t: any, index) => {
        const x = xmap.get(t.hostname);
        const mUpdate = this.ns
          .tFormat((x?.recheck || 0) - performance.now())
          .replace(' minutes', 'm')
          .replace(' minute', 'm')
          .replace(' seconds', 's')
          .replace(' second', 's');
        const mCRD = `${t.root ? '  ' : t.challenge + t.root}${
          !t.door ? 'D' : ' '
        }`;

        const mHackP = x?.hackP > 0 ? ` (${x?.hackP})` : '';
        const mHack =
          t.getHackThreads > 0 ? `${t.getHackThreads}${mHackP}` : '0';
        const mWeakP = x?.weakP > 0 ? ` (${x?.weakP})` : '';
        const mWeak =
          t.getWeakThreads > 0 ? `${t.getWeakThreads}${mWeakP}` : '0';
        const mGrowP = x?.growP > 0 ? ` (${x?.growP})` : '';
        const mGrow =
          t.getGrowThreads > 0 ? `${t.getGrowThreads}${mGrowP}` : '0';

        if (index < limit || limit < 0) {
          this.ns.printf(
            rows,
            x?.focus,
            // t.level,
            t.nodeValueHWGW.toFixed(1),
            `+${(t.sec.now - t.sec.min).toFixed(1)}`,
            `${((t.money.now / t.money.max) * 100).toFixed(2)}%`,
            `${this.ns.formatNumber(t.money.max, 2)}`,
            mHack,
            mWeak,
            mGrow,
            t.nodeReady ? 'Hack' : 'Prep',
            mUpdate,
            t.hostname
          );
        }
      });
    }
  }
}
