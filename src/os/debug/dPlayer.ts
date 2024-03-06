/* eslint-disable */
import { NS } from '@ns';
import { PlayerInfo } from '/os/modules/Player';
/* eslint-enable */

export async function main(ns: NS) {
  const flags = ns.flags([
    ['refresh', 1000],
    ['silent', false],
    ['help', false],
  ]);

  ns.tail();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  // ns.disableLog('ALL');

  function updatePlayer() {
    const player = PlayerInfo.details(ns);
    ns.clearLog();

    ns.print(
      `[Node] ${player.bitnode} [City] ${player.city} [Location] ${
        player.location
      } [Entropy] ${player.entropy} [HP] ${player.hp.now} / ${
        player.hp.max
      } [Money] ${ns.formatNumber(player.money, 2)}`
    );
    ns.print(
      `[Level] ${player.level} (${player.levelRange.min} - ${player.levelRange.max}) Focus: ${player.levelRange.focus}`
    );
    const headerPrograms = ' %12s | %3s | %3s | %3s | %4s | %4s | %3s ';
    ns.printf(
      headerPrograms,
      '[Challenge]',
      'Tor',
      'SSH',
      'FTP',
      'SMTP',
      'HTTP',
      'SQL'
    );
    ns.printf(
      headerPrograms,
      player.challenge,
      player.programs.tor ? 'X ' : '- ',
      player.programs.ssh ? 'X ' : '- ',
      player.programs.ftp ? 'X ' : '- ',
      player.programs.smtp ? 'X ' : '- ',
      player.programs.http ? 'X ' : '- ',
      player.programs.sql ? 'X ' : '- '
    );
    ns.print(`[Playtime] ${ns.tFormat(player.playtime.total)}`);
    ns.print(`  [Augment] ${ns.tFormat(player.playtime.aug)}`);
    ns.print(`  [Bitnode] ${ns.tFormat(player.playtime.node)}`);
    ns.print(`[Hack]`);
    ns.print(
      `  [Mults] Chance: ${ns.formatNumber(
        player.hack.mults.chance,
        3
      )} Grow: ${ns.formatNumber(
        player.hack.mults.grow,
        3
      )} Speed: ${ns.formatNumber(
        player.hack.mults.speed,
        3
      )} Money: ${ns.formatNumber(player.hack.mults.money, 3)}`
    );
    ns.print(
      `[Hacknet] Production: ${ns.formatNumber(
        player.hacknet.production,
        3
      )} Node: ${ns.formatNumber(
        player.hacknet.node,
        3
      )} Level: ${ns.formatNumber(
        player.hacknet.level,
        3
      )} Ram: ${ns.formatNumber(
        player.hacknet.ram,
        3
      )} Cores: ${ns.formatNumber(player.hacknet.cores, 3)}`
    );
    ns.print(`[Stats]`);
    const header = ' %4s | %5s | %5s | %5s | %6s ';
    ns.printf(header, 'Stat', 'Level', 'EXP', 'Level', 'EXP');
    ns.printf(
      header,
      'HACK',
      ns.formatNumber(player.hack.mults.level, 2),
      ns.formatNumber(player.hack.mults.exp, 2),
      ns.formatNumber(player.hack.level, 2),
      ns.formatNumber(player.hack.exp, 2)
    );
    ns.printf(
      header,
      'INT',
      '',
      '',
      ns.formatNumber(player.int.level, 2),
      ns.formatNumber(player.int.exp, 2)
    );
    ns.printf(
      header,
      'STR',
      ns.formatNumber(player.str.mults.level, 2),
      ns.formatNumber(player.str.mults.exp, 2),
      ns.formatNumber(player.str.level, 2),
      ns.formatNumber(player.str.exp, 2)
    );
    ns.printf(
      header,
      'DEF',
      ns.formatNumber(player.def.mults.level, 2),
      ns.formatNumber(player.def.mults.exp, 2),
      ns.formatNumber(player.def.level, 2),
      ns.formatNumber(player.def.exp, 2)
    );
    ns.printf(
      header,
      'DEX',
      ns.formatNumber(player.dex.mults.level, 2),
      ns.formatNumber(player.dex.mults.exp, 2),
      ns.formatNumber(player.dex.level, 2),
      ns.formatNumber(player.dex.exp, 2)
    );
    ns.printf(
      header,
      'AGI',
      ns.formatNumber(player.agi.mults.level, 2),
      ns.formatNumber(player.agi.mults.exp, 2),
      ns.formatNumber(player.agi.level, 2),
      ns.formatNumber(player.agi.exp, 2)
    );
    ns.printf(
      header,
      'CHA',
      ns.formatNumber(player.cha.mults.level, 2),
      ns.formatNumber(player.cha.mults.exp, 2),
      ns.formatNumber(player.cha.level, 2),
      ns.formatNumber(player.cha.exp, 2)
    );
    ns.print(`[Work] ${ns.formatNumber(player.work.mults.money, 3)}`);
    ns.print(player.work.jobs);
    ns.print(`[Faction] ${ns.formatNumber(player.faction.mults.rep, 3)}`);
    ns.print(player.faction.factions);
    ns.print(`[Company] ${ns.formatNumber(player.company.mults.rep, 3)}`);
    ns.print(
      `[Crime] Kills ${player.crime.kills} | [Chance] ${ns.formatNumber(
        player.crime.mults.chance,
        3
      )} [Money] ${ns.formatNumber(player.crime.mults.money, 3)}`
    );
    ns.print(`[Bladeburner]`);
    ns.print(player.bladeburner);
    ns.print(`[Source]`);
    ns.print(player.sourcefiles);
    ns.print(`[Augments]`);
    ns.print(player.augments);
  }

  while (true) {
    updatePlayer();

    await ns.sleep(flags.refresh as number);
  }
}
