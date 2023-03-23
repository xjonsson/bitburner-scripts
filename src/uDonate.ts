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
  const p = ns.getPlayer();
  const repHave = 877921;
  const repNeed = 998738;
  const repReq = repNeed - repHave;
  const repFactionX = p.mults.faction_rep;
  const repDivider = 10 ** 6;
  let donation = 1000000;
  const repGain = (donation * repFactionX) / repDivider;
  donation = (repReq * repDivider) / repFactionX;

  ns.print(
    `[Reputation] (${donation} x ${repFactionX.toFixed(
      2
    )}) / ${repDivider} = ${repGain}`
  );

  ns.print(
    `[RepBuy] (${repReq} * ${repDivider}) / ${repFactionX} = ${donation}`
  );
  ns.print(`[Cost] ${ns.formatNumber(donation, 2)} (${donation})`);
  // (rep * repDiver) / repFactionX
}

// const samplePlayer = {
//   hp: { current: 10, max: 10 },
//   skills: {
//     hacking: 2533,
//     strength: 3,
//     defense: 3,
//     dexterity: 2,
//     agility: 1,
//     charisma: 2,
//     intelligence: 0,
//   },
//   exp: {
//     hacking: 36462908.21450422,
//     strength: 0,
//     defense: 0,
//     dexterity: 0,
//     agility: 0,
//     charisma: 0,
//     intelligence: 0,
//   },
//   mults: {
//     hacking_chance: 2.698254346479704,
//     hacking_speed: 2.6396253736017785,
//     hacking_money: 8.753854312670855,
//     hacking_grow: 4.091103387083519,
//     hacking: 7.092586680414779,
//     strength: 3.2364508495614963,
//     defense: 3.9400271212052993,
//     dexterity: 2.9809415719645354,
//     agility: 1.9637296258000896,
//     charisma: 2.468688672434398,
//     hacking_exp: 7.470531189952404,
//     strength_exp: 2.3658266444162983,
//     defense_exp: 2.3658266444162983,
//     dexterity_exp: 2.3658266444162983,
//     agility_exp: 2.3658266444162983,
//     charisma_exp: 2.3658266444162983,
//     company_rep: 3.122891170629514,
//     faction_rep: 2.3658266444162988,
//     crime_money: 1.8702186912381806,
//     crime_success: 1.8702186912381806,
//     hacknet_node_money: 4.716866872304995,
//     hacknet_node_purchase_cost: 0.39857156999457344,
//     hacknet_node_ram_cost: 0.5210085882282005,
//     hacknet_node_core_cost: 0.5210085882282005,
//     hacknet_node_level_cost: 0.4428572999939705,
//     work_money: 2.0572405603619988,
//     bladeburner_max_stamina: 1,
//     bladeburner_stamina_gain: 1,
//     bladeburner_analysis: 1,
//     bladeburner_success_chance: 1,
//   },
//   numPeopleKilled: 0,
//   money: 486074858556.38727,
//   city: 'Sector-12',
//   location: 'Travel Agency',
//   bitNodeN: 1,
//   totalPlaytime: 1817255400,
//   playtimeSinceLastAug: 6598000,
//   playtimeSinceLastBitnode: 775520800,
//   jobs: {},
//   factions: [
//     'Daedalus',
//     'BitRunners',
//     'The Black Hand',
//     'NiteSec',
//     'Ishima',
//     'New Tokyo',
//     'Netburners',
//     'Tian Di Hui',
//     'CyberSec',
//   ],
//   entropy: 0,
// };
