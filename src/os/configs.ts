// TODO: Augments path
// Best University 4x Multiplier [Volhaven] - ZB Institute of Technology
// Best Gym 10x Multiplier [Sector 12] - Powerhouse Gym
// Best Infiltrate [Aevum] - ECorp

/*
 * Use this section to disable certain modules.
 * This can be useful for certain Bitnodes
 */

// ******** Game Modules
export const MODULES: any = {};
(function () {
  // System
  MODULES.HACKNET = true; // true will buy hacknets (~7.2 GB)
  MODULES.HOSTING = true; // true will buy servers (~8 GB)
  MODULES.CONTRACTS = true; // true will solve contracts (~27 GB)
  MODULES.PUPPETEER = true; // true will HWGW on servers (~18 GB)
  MODULES.CORPORATIONS = false; // true will run a corporation (~100 GB) //FIXME:
  MODULES.GANGS = false; // true will run a gang (~TBD)
})();

// ******** General Configurations
// These have been set for steady rampup, changes can cause errors
export const CONFIGS: any = {
  ramReserve: 32, // 8GB reserved ram
  moneyReserve: 1e6, // 100000 * 1000000, // 1000000 1 Million,
  moneyRatio: 0.2, // 20% of money will be used for savings
  shoppingPrices: {
    tor: 200e3, // 200 K
    ssh: 500e3, // 500 K
    ftp: 1.5e6, // 1.5 Million (1500000)
    smtp: 5e6, // 5 Million (5000000)
    http: 30e6, // 30 Million (30000000)
    sql: 250e6, // 250 Million (250000000)
    serverProfiler: 500e3, // 500 K (500000)
    deepscanV1: 500e3, // 500 K (500000)
    deepscanV2: 25e6, // 25 Million (25000000)
    autolink: 1e6, // 1 Million (1000000)
    formulas: 5e9, // 5 Billion (5000000000)
  },
  ramRatio: {
    /* It can be useful to ramp up share ratio for faction farming
     * this is especially true if batches are low and no prep threats required
     * 0.7 ~ 1.47 (47% bonus) ~ 135,305 threads
     * 0.6 ~ 1.47 (47% bonus) ~ 115,340 threads
     * 0.5 ~ 1.46 (46% bonus) ~ 96,987 threads
     * 0.4 ~ 1.45 (45% bonus) ~ 77,119 threads
     * 0.3 ~ 1.44 (44% bonus) ~ 58,064 threads - Best cost benefit
     * 0.2 ~ 1.42 (42% bonus) ~ 38,640 threads
     * 0.1 ~ 1.39 (39% bonus) ~ 19,630 threads
     */
    wRamRatio: 0.7, // 0.7 (70%) of ram will be used for work
    sRamRatio: 0.3, // 0.3 (30%) of ram will be used for shares
  },
  hacknet: {
    hnMoneyRatio: 0.2, // 20% of money will be used on hacknet
    hnBreakEvenTime: 2 * 60 * 60, // 2 hours in seconds
    hnTCount: 16, // 20 Soft Max (Real Max Infinity)
    hnTLevel: 200, // 200, // 200 (Real Max)
    hnTRam: 64, // 64, // 64 (Real Max)
    hnTCores: 16, // 16, // 16 (Real Max)
  },
  hosting: {
    hMoneyRatio: 0.8, // 80% of money will be used on servers
    hTCount: 25, // 25 (Real Max)
    hSRam: 8, // Iniital ram purchase
    hTRam: 1048576, // L10 (1024) L15 (32768) L18 (262144) L20 (1048576) (Pow2 2, 4, 8)
  },
  hacking: {
    xSkim: 0.1, // 10%
    xBuffer: 1000, // Time in ms between scripts (Lower than this and HWGW stops working)
    xDelay: 3000, // Delay in ms between batches
    xBatches: 16, // Batch minimum 16 hack, weak, grow, weak cycles
    xBatchesMax: 256, // Batch maximum. These are dynamically calculated
    xTargets: 10, // Only work on 10 servers
    xPrimed: 7, // Have at least 8 targets prepared before swapping (must be less than targets)
    /* hack Batches is the number of perfect HWGW being fired
     * Buffer is time between each script H/W/G/W
     * Delay is the time in between each batch of attaches, eg 128, delay, 128
     * Reducing timings below 1s buffer can desync HWGW 1s is (0.25s each for H/W/G/W)
     * Delay of 3s is pretty reasonable in between each set of attacks.
     * we only target servers where our largest server can perfect batch to prevent locks
     * Targets is the total amount of targets we will work on
     * Primed is how many are HWGW ready and can perfect batch
     * Retargeting happens on player level change
     * Batches scale dynamically based on how much available ram you have
     * Lategame increasing to higher max batches could be helpful.
     */
  },
};

// ******** Module Layout
export const LAYOUT: any = {
  // Width, Heigh, offset X, offsetY
  topBar: 38,
  textHeight: 24,
  bufferX: 58,
  bufferY: 52,
  OS: {
    xW: 200,
    xH: 158,
  },
  CONTRACT: {
    xW: 200,
    xH: 86,
    xOX: 0,
    xOY: 158,
  },
  HACKNET: {
    xW: 200,
    xH: 86,
    xOX: 0,
    xOY: 158 + 86,
  },
  HOSTING: {
    xW: 200,
    xH: 110,
    xOX: 0,
    xOY: 158 + 86 + 86,
  },
  PUPPETEER: {
    xW: 1050,
    xH: (CONFIGS.hacking.xTargets + 2) * 24 + 38, // 326,
    xOX: 220,
    xOY: 0,
  },
  // MODULES.PUPPETEER = true; // true will HWGW on servers (~18 GB)
  // MODULES.CORPORATIONS = false; // true will run a corporation (~100 GB) //FIXME:
};

// ******** OS PATHS
export const PATHS: any = {
  OS: '/os',
  // DATA: '/os/data',
  DEPLOY: '/os/deploy',
  MODULES: '/os/modules',
  CACHE: '/os/cache',
};

// ******** CORE PATHS
export const CORE: any = {};
(function () {
  // System
  CORE.LAUNCHER = `${PATHS.OS}/launcher.js`;
  CORE.TWITCH = `${PATHS.OS}/twitch.js`;

  // Modules
  CORE.HACKNET = `${PATHS.MODULES}/Hacknets.js`;
  CORE.HOSTING = `${PATHS.MODULES}/Hosting.js`;
  CORE.CONTRACTS = `${PATHS.MODULES}/Contract.js`;
  CORE.PUPPETEER = `${PATHS.MODULES}/Puppeteer.js`;
  CORE.CORPORATIONS = `/dCorps.js`;
  // CORE.GANGS = `/debug.js`;
})();

// ******** TIMING CALCULATIONS
export const TIME: any = {};
(function () {
  TIME.LAUNCHING = 1 * 1000; // 1 second launch wait
  TIME.RUNNING = 1 * 1000; // 1 second checking pids
  // TIME.CLOCK = 60 * 1000; // 1 min ticks
  // TIME.REBOOT = 2 * 60; // 2 hours in ticks (minutes)
  TIME.CONTROL = 1 * 1000; // 1 second updates (MINIMUM TIME FOR GAME)
  TIME.PLAYER = 60 * 1000; // 1 second updates
  // TIME.AUGMENTS = 3 * 60 * 1000; // 3 min updates
  // TIME.SLEEVES = 2 * 1000; // 2 second updates
  TIME.HACKNET = 3 * 1000; // 3 second updates
  TIME.HOSTING = 10 * 1000; // 10 second updates
  TIME.SERVERS = 10 * 1000; // 10 second updates
  TIME.PUPPETEER = 1 * 1000; // 1 second updates
  // TIME.FACTIONS = 30 * 1000; // 30 second updates
  // TIME.CORPORATIONS = 20 * 1000; // 20 second updates
  // TIME.CRIMES = 2 * 1000; // 2 second updates
  // TIME.STOCKS = 1 * 1000; // 1 second updates
  TIME.CONTRACTS = 2 * 60 * 1000; // 2 min updates
})();

// ******** PORTS CONFIGURATIONS
export const PORTS: any = {};
(function () {
  PORTS[(PORTS.CONTROL = 1)] = 'CONTROL';
  PORTS[(PORTS.PLAYER = 2)] = 'PLAYER';
  PORTS[(PORTS.HACKNET = 3)] = 'HACKNET';
  PORTS[(PORTS.HOSTING = 4)] = 'HOSTING';
  PORTS[(PORTS.PUPPETEER = 5)] = 'PUPPETEER'; // TODO: Add servers
  // PORTS[(PORTS.BITNODE = 3)] = 'BITNODE'; // TODO: Add bitnode
  // PORTS[(PORTS.AUGMENTS = 5)] = 'AUGMENTS'; // TODO: Add augments
  // PORTS[(PORTS.SLEEVES = 6)] = 'SLEEVES'; // TODO: Add sleeves
  // PORTS[(PORTS.FACTIONS = 9)] = 'FACTIONS'; // TODO: Add factions
  // PORTS[(PORTS.CORPORATIONS = 10)] = 'CORPORATIONS'; // TODO: Add corporations
  // PORTS[(PORTS.CRIMES = 11)] = 'CRIMES'; // TODO: Add crimes
  // PORTS[(PORTS.STOCKS = 12)] = 'STOCKS'; // TODO: Add stocks
})();

// ******** CACHE Configurations
export const CACHE: any = {};
(function () {
  CACHE.CONTROL = `${PATHS.CACHE}/cacheControl.js`;
  CACHE.PLAYER = `${PATHS.CACHE}/cachePlayer.js`;
  // CACHE.BITNODE = `${PATHS.CACHE}/cacheBitnode.js`; // TODO: Add bitnode cache
  // CACHE.AUGMENTS = `${PATHS.CACHE}/cacheAugments.js`; // TODO: Add augments cache
  // CACHE.SLEEVES = `${PATHS.CACHE}/cacheSleeves.js`; // TODO: Add sleeves cache
  // CACHE.HACKNET = `${PATHS.CACHE}/cacheHacknet.js`; // TODO: Add hacknet cache
  // CACHE.SERVERS = `${PATHS.CACHE}/cacheServers.js`;
  // CACHE.FACTIONS = `${PATHS.CACHE}/cacheFactions.js`; // TODO: Add factions cache
  // CACHE.CORPORATIONS = `${PATHS.CACHE}/cacheCorporations.js`; // TODO: Add corporations cache
  // CACHE.CRIMES = `${PATHS.CACHE}/cacheCrimes.js`; // TODO: Add crimes cache
  // CACHE.STOCKS = `${PATHS.CACHE}/cacheStocks.js`; // TODO: Add stocks cache
})();

// ******** Puppeteer HWGW
export const DEPLOY: any = {
  xMin: `${PATHS.DEPLOY}/xmin.js`, // Minimal script
  xMinRam: 2.41, // Minimal script RAM required
  xHack: `${PATHS.DEPLOY}/xhack.js`, // HWGW Hack script
  xHackRam: 1.71, // HWGW Hack script RAM required
  xWeak: `${PATHS.DEPLOY}/xweak.js`, // HWGW Weak script
  xWeakRam: 1.76, // HWGW Weak script RAM required
  xGrow: `${PATHS.DEPLOY}/xgrow.js`, // HWGW Grow script
  xGrowRam: 1.76, // HWGW Grow script RAM required
  xShare: `${PATHS.DEPLOY}/xshare.js`, // Rep Share script
  xShareRam: 4.0, // Rep Share RAM required
};

// ******** Corporations Configurations
export const CORP: any = {
  cName: 'cosyco', // Corporations name (Corp Name)
  fName: 'Agrico', // Agriculture division name (Farm Name)
  zName: 'Chemco', // Chemical division (Chem Name)
  sName: 'Smokeco', // Tobacco division name (Smoke Name)
  iRounds: [140e9, 2.1e12], // 150b, 2.5t (Tweak these later)
  warehouse: {
    boost: 0.5, // If under 50% boost
    grow: 0.9, // If over 90% grow
  },
  farm: {
    hires: [3, 9, 9],
    roles: [
      // 0, 1, 2, 3, 4, 5, 6
      // O, E, B, M, R, I, U
      [1, 1, 1, 0, 0, 0, 0], // (3) Initial setup
      [1, 1, 1, 1, 5, 0, 0], // (9) Upgrade
      [3, 2, 2, 2, 0, 0, 0], // (9) Reasign
    ],
    warehouse: [100, 300, 2000, 3800], // Max amounts at each stage
    boost: {
      // Max amounts at each stage (Names match game constants -.-)
      Hardware: [125, 2800, 9300],
      Robots: [0, 96, 726],
      'AI Cores': [75, 2520, 6270],
      'Real Estate': [27000, 146400, 230400],
    },
  },
  chem: {
    temp: '',
  },
  smoke: {
    dCity: 'Aevum', // Must match ENUM
    pPrefix: 'Snus', // will make Snus vX
    pVerson: 'v',
    hires: [30, 9],
    roles: [
      // O, E, B, M, R, I, U
      // [x, x, x/2, x, 0, 0] Dev city Ratio
      [8, 9, 5, 8, 0, 0, 0], // (30) In Dev city
      // [1, 1, 1, 1, x, 0]
      [1, 1, 1, 1, 5, 0, 0], // (9) all others
    ],
    investmentRatio: {
      dProductBase: 2e9, // 2billion
      dProductRatio: 0.02, // 2% of funds on Product (1% on Design 1% on Marketing)
      // uResearchRatio: 0.01, // 1% of funds on general research
      uUpgradesRatio: 0.02, // 2% of funds on Random upgrades
      uOfficeRatio: 0.2, // 20% of funds on Office
      uWarehouseRatio: 0.1, // 10% of funds on Warehouse
      uWilsonRatio: 0.8, // 20% of funds on Wilson Analytics
      uAdvertRatio: 0.2, // 20% of funds on Adverts
    },
  },
};

// Math.floor(c.getOffice(tobaccoName, cities[0]).employees.length / 3.5);
// Math.floor(c.getOffice(tobaccoName, cities[0]).employees.length / 3.5);
// Math.floor(0.5 * c.getOffice(tobaccoName, cities[0]).employees.length / 3.5);
// Math.ceil(c.getOffice(tobaccoName, cities[0]).employees.length / 3.5);

// const wChemBoost10p = {
//   size: 2940,
//   resultCity: 8.216,
//   resultTotal: 49.294,
//   'Hardware (x)': 10350, // 0.06
//   'Robots (y)': 1177, // 0.5
//   'AI Cores (z)': 6010, // 0.1
//   'Real Estate (w)': 167150, // 0.005
// };
