export const CONSTANTS = {
  ServerBaseGrowthRate: 1.03, // Unadjusted Growth rate
  ServerMaxGrowthRate: 1.0035, // Maximum possible growth rate (max rate accounting for server security)
  ServerFortifyAmount: 0.002, // Amount by which server's security increases when its hacked/grown
  ServerWeakenAmount: 0.05, // Amount by which server's security decreases when weakened
  TIME_HOUR: 60 * 60 * 1000,
  TIME_MIN: 60 * 1000,
  TIME_SEC: 1000,
};

export const ServerConstants: {
  BaseCostFor1GBOfRamHome: number;
  BaseCostFor1GBOfRamServer: number;
  HomeComputerMaxRam: number;
  ServerBaseGrowthIncr: number;
  ServerMaxGrowthLog: number;
  ServerFortifyAmount: number;
  ServerWeakenAmount: number;
  PurchasedServerLimit: number;
  PurchasedServerMaxRam: number;
} = {
  // Base RAM costs
  BaseCostFor1GBOfRamHome: 32000,
  BaseCostFor1GBOfRamServer: 55000, // 1 GB of RAM
  // Server-related constants
  HomeComputerMaxRam: 1073741824, // 2 ^ 30
  ServerBaseGrowthIncr: 0.03, // Unadjusted growth increment (growth rate is this * adjustment + 1)
  ServerMaxGrowthLog: 0.00349388925425578, // Maximum possible growth rate accounting for server security, precomputed as log1p(.0035)
  ServerFortifyAmount: 0.002, // Amount by which server's security increases when its hacked/grown
  ServerWeakenAmount: 0.05, // Amount by which server's security decreases when weakened

  PurchasedServerLimit: 25,
  PurchasedServerMaxRam: 1048576, // 2^20
};

// NOTE: These are ordered for arrays and slice. Dont change order.
export const CITIES = [
  'Sector-12', // 0
  'Aevum', // 1
  'Chongqing', // 2
  'New Tokyo', // 3
  'Ishima', // 4
  'Volhaven', // 5
];

export const UPGRADES = [
  'FocusWires', // 0
  'Neural Accelerators', // 1
  'Speech Processor Implants', // 2
  'Nuoptimal Nootropic Injector Implants', // 3
  'Smart Factories', // 4
  'Smart Storage', // 5
  // 'DreamSense', // 6 // Dont buy it
  'Wilson Analytics', // 7
  'ABC SalesBots', // 8
  'Project Insight', // 9
];

export const BOOST = [
  'Hardware', // 0
  'Robots', // 1
  'AI Cores', // 2
  'Real Estate', // 3
];

export const MATERIALS = {
  Water: 'Water',
  Ore: 'Ore',
  Minerals: 'Minerals',
  Food: 'Food',
  Plants: 'Plants',
  Metal: 'Metal',
  Hardware: 'Hardware',
  Chemicals: 'Chemicals',
  Drugs: 'Drugs',
  Robots: 'Robots',
  AiCores: 'AI Cores',
  RealEstate: 'Real Estate',
};

export const RESEARCH = {
  Lab: 'Hi-Tech R&D Laboratory',
  AutoBrew: 'AutoBrew',
  AutoParty: 'AutoPartyManager',
  AutoDrug: 'Automatic Drug Administration',
  CPH4Inject: 'CPH4 Injections',
  Drones: 'Drones',
  DronesAssembly: 'Drones - Assembly',
  DronesTransport: 'Drones - Transport',
  GoJuice: 'Go-Juice',
  RecruitHR: 'HRBuddy-Recruitment',
  TrainingHR: 'HRBuddy-Training',
  MarketTa1: 'Market-TA.I',
  MarketTa2: 'Market-TA.II',
  Overclock: 'Overclock',
  SelfCorrectAssemblers: 'Self-Correcting Assemblers',
  Stimu: 'Sti.mu',
  upgradeFulcrum: 'uPgrade: Fulcrum',
};

export const INDUSTRY = {
  Water: 'Water Utilities',
  Spring: 'Spring Water',
  Agriculture: 'Agriculture',
  Fishing: 'Fishing',
  Mining: 'Mining',
  Refinery: 'Refinery',
  Restaurant: 'Restaurant',
  Tobacco: 'Tobacco',
  Chemical: 'Chemical',
  Pharmaceutical: 'Pharmaceutical',
  Computers: 'Computer Hardware',
  Robotics: 'Robotics',
  Software: 'Software',
  Healthcare: 'Healthcare',
  RealEstate: 'Real Estate',
};

export const INDUSTRYRATIO = {
  [INDUSTRY.Agriculture]: {
    startingCost: 40e9,
    requiredMaterials: { Water: 0.5, Chemicals: 0.2 },
    scienceFactor: 0.5,
    advertisingFactor: 0.04,
    hardwareFactor: 0.2,
    robotFactor: 0.3,
    aiCoreFactor: 0.3,
    realEstateFactor: 0.72,
  },
  [INDUSTRY.Chemical]: {
    startingCost: 70e9,
    requiredMaterials: { Plants: 1, Water: 0.5 },
    scienceFactor: 0.75,
    advertisingFactor: 0.07,
    hardwareFactor: 0.2,
    robotFactor: 0.25,
    aiCoreFactor: 0.2,
    realEstateFactor: 0.25,
  },
  [INDUSTRY.Tobacco]: {
    startingCost: 20e9,
    product: {
      ratingWeights: {
        quality: 0.7,
        durability: 0.1,
        aesthetics: 0.2,
      },
    },
    requiredMaterials: { Plants: 1 },
    scienceFactor: 0.75,
    advertisingFactor: 0.2,
    hardwareFactor: 0.15,
    robotFactor: 0.2,
    aiCoreFactor: 0.15,
    realEstateFactor: 0.15,
  },
};

export const MATERIALWEIGHTS = {
  Water: 0.05,
  Food: 0.03,
  Plants: 0.05,
  Chemicals: 0.05,
  Hardware: 0.06,
  Robots: 0.5,
  'AI Cores': 0.1,
  'Real Estate': 0.005,
};
