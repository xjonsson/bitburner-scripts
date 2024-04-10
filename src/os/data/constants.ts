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

export const CITIES = [
  'Sector-12', // 0
  'Aevum', // 1
  'Chongqing', // 2
  'New Tokyo', // 3
  'Ishima', // 4
  'Volhaven', // 5
];
