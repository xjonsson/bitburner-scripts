/* eslint-disable */
import { NS } from '@ns';
import { Scan } from '/os/utils/scan';
/* eslint-enable */

// NOTE: You must be on the terminal tab for injection to work.

// const terminalInput = document.getElementById('terminal-input');
const terminalInput = document.getElementById(
  'terminal-input'
) as HTMLInputElement;
const handler = Object?.keys(terminalInput)[1];

function connect(ns: NS, route: string) {
  terminalInput.value = route;
  terminalInput[handler].onChange({
    target: terminalInput,
  });
  terminalInput[handler].onKeyDown({
    key: 'Enter',
    preventDefault: () => null,
  });
}

export async function main(ns: NS) {
  const flags = ns.flags([['help', false]]);
  const hostname = ns.args[0] as string;
  const door = ns.args[1] as boolean;

  // ns.disableLog('ALL');
  ns.clearLog(); // FIXME: Remove this later

  if (!hostname || flags.help) {
    ns.tprint('Gets route to server.');
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  const route = Scan.routeTerminal(ns, hostname);
  const routeDoor = `${route} backdoor;`;
  ns.tprint(`Route: ${hostname}`);
  ns.tprint(route);
  connect(ns, door ? routeDoor : route);
  // backdoor(ns, doors[0].route);

  // ns.print(s);
  // ns.print(p.level);
}

/* eslint-disable-next-line */
export function autocomplete(data: any, args: any) {
  return data.servers;
}
