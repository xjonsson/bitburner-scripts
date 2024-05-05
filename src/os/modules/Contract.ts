/* eslint-disable */
import { NS } from '@ns';
import { TIME, LAYOUT } from '/os/configs';
import { ServerInfo } from '/os/modules/Server';
import { solvers } from '/os/data/contracts';
import { Banner, Text } from '/os/utils/colors';
/* eslint-enable */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// ******** CONTRACTS CLASS
export default class Contracts {
  ns: NS;
  servers: Array<string>;
  found: number;
  attempted: number;
  solved: number;
  failed: number;
  missing: Array<string>;

  constructor(ns: NS) {
    this.ns = ns;
    this.servers = ServerInfo.list(ns);
    this.found = 0;
    this.attempted = 0;
    this.solved = 0;
    this.failed = 0;
    this.missing = [];
  }

  // ******** UPDATE & GET CONTRACTS
  update() {
    const contracts = [];
    for (const s of this.servers) {
      for (const f of this.ns.ls(s)) {
        if (f.endsWith('.cct')) {
          const contract = {
            server: s,
            file: f,
            type: this.ns.codingcontract.getContractType(f, s),
            tries: this.ns.codingcontract.getNumTriesRemaining(f, s),
          };
          contracts.push(contract);
        }
      }
    }

    this.found = contracts.length;

    for (const contract of contracts) {
      this.solve(contract);
    }
  }

  // ******** ATTEMPT CONTRACT
  solve(c: { server: string; file: string; type: string; tries: number }) {
    const { ns } = this;
    const { server: s, file: f, type: t, tries: a } = c;
    const solver = solvers[t];
    if (solver) {
      this.attempted += 1;
      const solution = solver(ns.codingcontract.getData(f, s));
      const r = ns.codingcontract.attempt(solution, f, s);

      if (r) {
        this.solved += 1;
        ns.tprint(Banner.info('Contracts', `${r} for solving "${t}" on ${s}`));
      } else {
        this.failed += 1;
        ns.tprint(Banner.error('Contracts', `Failed to solve "${t}" on ${s}`));
        ns.exit();
      }
    } else {
      this.missing.push(t);
      ns.tprint(Banner.warning('Contracts', `No solver for "${t}" on ${s}`));
    }
  }
}

// ******** Main function
export async function main(ns: NS) {
  const { bufferY } = LAYOUT;
  const { xW, xH, xOX, xOY } = LAYOUT.CONTRACT;
  // ******** Setup
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Contracts');
  ns.resizeTail(xW, xH);
  ns.moveTail(wWidth - xW - xOX, wHeight - xH - bufferY - xOY);

  // ******** Initialize (One Time Code)
  let searches = 0;
  const contracts = new Contracts(ns);

  // ******** Primary (Loop Time Code)
  while (true) {
    // ******** Find and solve
    const { found, attempted, solved, failed } = contracts;
    contracts.update();
    // ******** Display & stats
    ns.clearLog();
    ns.print(
      `⏱️${Text.arg(searches.toString())} ` +
        `📝${Text.magenta(attempted.toString())} ` +
        `✅${Text.normal(solved.toString())} ` +
        `❌${Text.error(failed.toString())} ` +
        `🔎${Text.info(found.toString())}`,
    );

    searches += 1;
    await ns.asleep(TIME.CONTRACTS);
  }
}
