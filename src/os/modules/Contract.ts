/* eslint-disable */
import { NS } from '@ns';
import { TIME } from '/os/configs';
import { ServerInfo } from '/os/modules/Server';
import { solvers } from '/os/data/contracts';
/* eslint-enable */

// ******** Globals
const { TIMECONTRACTS } = TIME;

// ******** GET CONTRACTS
export function getContracts(ns: NS) {
  const contracts = [];
  for (const host of ServerInfo.list(ns)) {
    for (const file of ns.ls(host)) {
      if (file.match(/\.cct$/)) {
        const contract = {
          host,
          file,
          type: ns.codingcontract.getContractType(file, host),
          triesRemaining: ns.codingcontract.getNumTriesRemaining(file, host),
        };
        contracts.push(contract);
      }
    }
  }
  return contracts;
}

// ******** ATTEMPT CONTRACT
export function attemptContract(ns: NS, contract: any) {
  const solver = solvers[contract.type];
  if (solver) {
    ns.print(`Attempting ${JSON.stringify(contract, null, 2)}`);
    const solution = solver(
      ns.codingcontract.getData(contract.file, contract.host)
    );

    const reward = ns.codingcontract.attempt(
      solution,
      contract.file,
      contract.host
    );

    if (reward) {
      ns.tprint(`${reward} for solving "${contract.type}" on ${contract.host}`);
    } else {
      ns.tprint(
        `ERROR: Failed to solve "${contract.type}" on ${contract.host}`
      );
      ns.exit();
    }
  } else {
    ns.tprint(`WARNING: No solver for "${contract.type}" on ${contract.host}`);
  }
}

// ******** ATTEMP ALL CONTRACTS
export function attemptAllContracts(ns: NS) {
  const contracts = getContracts(ns);
  ns.print(`Found ${contracts.length} contracts.`);
  for (const contract of contracts) {
    attemptContract(ns, contract);
  }
}

// ******** Main function
export async function main(ns: NS) {
  // ******** Setup
  const xWidth = 200;
  const xHeight = 90; // OS is 190
  const xBufferY = 52; // Bottom terminal
  const wWidth = ns.ui.windowSize()[0];
  const wHeight = ns.ui.windowSize()[1];
  ns.disableLog('disableLog');
  ns.disableLog('clearLog');
  ns.disableLog('asleep');
  ns.disableLog('scan');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Contracts');
  ns.resizeTail(xWidth, xHeight);
  ns.moveTail(wWidth - xWidth, wHeight - xHeight - xBufferY - 190);

  // ******** Initialize (One Time Code)
  let count = 0;

  // ******** Primary (Loop Time Code)
  while (true) {
    count += 1;
    ns.clearLog();
    // ******** Time and Ram
    ns.print(`[Count] ${count}`);
    attemptAllContracts(ns);

    await ns.asleep(TIMECONTRACTS);
  }
}
