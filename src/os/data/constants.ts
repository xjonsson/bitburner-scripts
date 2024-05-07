// ******** SERVER CONSTANTS
const SERVERS = {
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

// ******** LOCATION CONSTANTS
const CITY = {
  Aevum: 'Aevum',
  Chongqing: 'Chongqing',
  Sector12: 'Sector-12',
  NewTokyo: 'New Tokyo',
  Ishima: 'Ishima',
  Volhaven: 'Volhaven',
};

// NOTE: These are ordered for arrays and slice. Dont change order.
const CITIES = [
  CITY.Sector12, // 0
  CITY.Aevum, // 1
  CITY.Chongqing, // 2
  CITY.NewTokyo, // 3
  CITY.Ishima, // 4
  CITY.Volhaven, // 5
];

// ******** CORPORATION CONSTANTS
const CORPJOBS = {
  Operations: 'Operations',
  Engineer: 'Engineer',
  Business: 'Business',
  Management: 'Management',
  RandD: 'Research & Development',
  Intern: 'Intern',
  Unassigned: 'Unassigned',
};

const CORPUNLOCK = {
  Export: 'Export',
  SmartSupply: 'Smart Supply',
  MarketResearchDemand: 'Market Research - Demand',
  MarketDataCompetition: 'Market Data - Competition',
  VeChain: 'VeChain',
  ShadyAccounting: 'Shady Accounting',
  GovernmentPartnership: 'Government Partnership',
  WarehouseAPI: 'Warehouse API',
  OfficeAPI: 'Office API',
};

const CORPUPGRADE = {
  SmartFactories: 'Smart Factories',
  SmartStorage: 'Smart Storage',
  DreamSense: 'DreamSense',
  WilsonAnalytics: 'Wilson Analytics',
  NuoptimalNootropicInjectorImplants: 'Nuoptimal Nootropic Injector Implants',
  SpeechProcessorImplants: 'Speech Processor Implants',
  NeuralAccelerators: 'Neural Accelerators',
  FocusWires: 'FocusWires',
  ABCSalesBots: 'ABC SalesBots',
  ProjectInsight: 'Project Insight',
};

const CORPUPGRADES = [
  CORPUPGRADE.FocusWires, // 0
  CORPUPGRADE.NeuralAccelerators, // 1
  CORPUPGRADE.SpeechProcessorImplants, // 2
  CORPUPGRADE.NuoptimalNootropicInjectorImplants, // 3
  CORPUPGRADE.SmartFactories, // 4
  CORPUPGRADE.SmartStorage, // 5
  // CORPUPGRADE.DreamSense // 'DreamSense', // 6 // Dont buy it
  CORPUPGRADE.WilsonAnalytics, // 7
  CORPUPGRADE.ABCSalesBots, // 8
  CORPUPGRADE.ProjectInsight, // 9
];

const CORPRESEARCH = {
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

const CORPMATERIALS = {
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

const CORPBOOST = [
  CORPMATERIALS.Hardware, // 0
  CORPMATERIALS.Robots, // 1
  CORPMATERIALS.AiCores, // 2
  CORPMATERIALS.RealEstate, // 3
];

const MATERIALWEIGHTS = {
  [CORPMATERIALS.Water]: 0.05,
  [CORPMATERIALS.Food]: 0.03,
  [CORPMATERIALS.Plants]: 0.05,
  [CORPMATERIALS.Chemicals]: 0.05,
  [CORPMATERIALS.Hardware]: 0.06,
  [CORPMATERIALS.Robots]: 0.5,
  [CORPMATERIALS.AiCores]: 0.1,
  [CORPMATERIALS.RealEstate]: 0.005,
};

const INDUSTRY = {
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

const INDUSTRYRATIO = {
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

export const CONSTANTS = {
  SERVERS,
  CITIES,
  CITY,
  CORPJOBS,
  CORPUNLOCK,
  CORPUPGRADES,
  CORPUPGRADE,
  CORPRESEARCH,
  CORPMATERIALS,
  CORPBOOST,
  MATERIALWEIGHTS,
  INDUSTRY,
  INDUSTRYRATIO,
};
