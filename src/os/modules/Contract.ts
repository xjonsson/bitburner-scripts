/* eslint-disable */
import { NS } from '@ns';
import { TIME, LAYOUT } from '/os/configs';
import { ServerInfo } from '/os/modules/Server';
import { solvers } from '/os/data/contracts';
/* eslint-enable */

// ******** CONTRACTS CLASS
export default class Contracts {
  ns: NS;
  servers: Array<string>;
  found: number;
  attempted: number;
  solved: number;
  failed: number;
  missing: Array<any>;

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
    const solver = solvers[c.type];
    if (solver) {
      this.attempted += 1;
      // this.ns.print(`Attempting ${JSON.stringify(c, null, 2)}`);
      const solution = solver(this.ns.codingcontract.getData(c.file, c.server));
      const reward = this.ns.codingcontract.attempt(solution, c.file, c.server);

      if (reward) {
        this.solved += 1;
        this.ns.tprint(`${reward} for solving "${c.type}" on ${c.server}`);
      } else {
        this.failed += 1;
        this.ns.tprint(`ERROR: Failed to solve "${c.type}" on ${c.server}`);
        this.ns.exit();
      }
    } else {
      this.missing.push(c.type);
      this.ns.tprint(`WARNING: No solver for "${c.type}" on ${c.server}`);
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
  // ns.disableLog('disableLog');
  // ns.disableLog('clearLog');
  // ns.disableLog('asleep');
  // ns.disableLog('scan');
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
    ns.print(`⏱️${searches}`);
    ns.print(`📝${attempted} ✅${solved} ❌${failed} 🔎${found}`);

    searches += 1;
    await ns.asleep(TIME.CONTRACTS);
  }
}
