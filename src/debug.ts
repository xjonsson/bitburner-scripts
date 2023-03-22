/* eslint-disable */
import { NS } from '@ns';
import { configs } from './configs';
import Player from './zPlayer';
import Server from './zServer';
/* eslint-enable */

export async function main(ns: NS) {
  ns.tail();
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.disableLog('ALL');
  const p = new Player(ns);
  const home = new Server(ns, 'home');
  const xshare = configs.xShare;
  const ramShare = ns.getScriptRam(configs.xShare);

  const maxThreads = home.nodeThreads(ramShare);
  ns.exec(xshare, 'home', maxThreads, true);
}

// const sample = {
//   hp: { current: 10, max: 10 },
//   skills: {
//     hacking: 1206,
//     strength: 2,
//     defense: 1,
//     dexterity: 2,
//     agility: 1,
//     charisma: 2,
//     intelligence: 0,
//   },
//   exp: {
//     hacking: 98453962.91900802,
//     strength: 0,
//     defense: 0,
//     dexterity: 0,
//     agility: 0,
//     charisma: 0,
//     intelligence: 0,
//   },
//   mults: {
//     hacking_chance: 2.032353267024972,
//     hacking_speed: 2.022203093529755,
//     hacking_money: 3.395980295603446,
//     hacking_grow: 2.033764699726582,
//     hacking: 3.101896444837534,
//     strength: 2.2452762284981462,
//     defense: 1.9524141117375187,
//     dexterity: 2.593294043915359,
//     agility: 1.708362347770329,
//     charisma: 2.1476555229112706,
//     hacking_exp: 4.095178678665241,
//     strength_exp: 2.058169876123301,
//     defense_exp: 2.058169876123301,
//     dexterity_exp: 2.058169876123301,
//     agility_exp: 2.058169876123301,
//     charisma_exp: 2.058169876123301,
//     company_rep: 2.716784236482757,
//     faction_rep: 2.058169876123301,
//     crime_money: 1.6270117597812657,
//     crime_success: 1.6270117597812657,
//     hacknet_node_money: 4.103476190520832,
//     hacknet_node_purchase_cost: 0.4581503455759973,
//     hacknet_node_ram_cost: 0.5988893406222188,
//     hacknet_node_core_cost: 0.5988893406222188,
//     hacknet_node_level_cost: 0.509055939528886,
//     work_money: 1.7897129357593924,
//     bladeburner_max_stamina: 1,
//     bladeburner_stamina_gain: 1,
//     bladeburner_analysis: 1,
//     bladeburner_success_chance: 1,
//   },
//   numPeopleKilled: 0,
//   money: 4161292969560.33,
//   city: 'Sector-12',
//   location: 'Alpha Enterprises',
//   bitNodeN: 1,
//   totalPlaytime: 1740283800,
//   playtimeSinceLastAug: 7201000,
//   playtimeSinceLastBitnode: 698549200,
//   jobs: {},
//   factions: [
//     'BitRunners',
//     'The Black Hand',
//     'NiteSec',
//     'Netburners',
//     'CyberSec',
//   ],
//   entropy: 0,
// };
