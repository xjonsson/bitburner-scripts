export interface ResetInfo {
  lastAugReset: number;
  lastNodeReset: number;
  currentNode: number;
  ownedAugs: Map<string, number>;
  ownedSF: Map<number, number>;
}

export interface IPlayer {
  hp: {
    current: number;
    max: number;
  };
  skills: {
    hacking: number;
    strength: number;
    defense: number;
    dexterity: number;
    agility: number;
    charisma: number;
    intelligence: number;
  };
  exp: {
    hacking: number;
    strength: number;
    defense: number;
    dexterity: number;
    agility: number;
    charisma: number;
    intelligence: number;
  };
  mults: {
    hacking_chance: number;
    hacking_speed: number;
    hacking_money: number;
    hacking_grow: number;
    hacking: number;
    hacking_exp: number;
    strength: number;
    strength_exp: number;
    defense: number;
    defense_exp: number;
    dexterity: number;
    dexterity_exp: number;
    agility: number;
    agility_exp: number;
    charisma: number;
    charisma_exp: number;
    hacknet_node_money: number;
    hacknet_node_purchase_cost: number;
    hacknet_node_ram_cost: number;
    hacknet_node_core_cost: number;
    hacknet_node_level_cost: number;
    company_rep: number;
    faction_rep: number;
    work_money: number;
    crime_success: number;
    crime_money: number;
    bladeburner_max_stamina: number;
    bladeburner_stamina_gain: number;
    bladeburner_analysis: number;
    bladeburner_success_chance: number;
  };
  city: string;
  numPeopleKilled: number;
  money: number;
  location: string;
  // jobs: Partial<Record<CompanyName, JobName>>;
  jobs: Partial<Record<string, string>>;
  factions: string[];
  totalPlaytime: number;
  entropy: number;
  karma: number;
}
