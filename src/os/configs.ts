// TODO: Augments path
// Best University 4x Multiplier [Volhaven] - ZB Institute of Technology
// Best Gym 10x Multiplier [Sector 12] - Powerhouse Gym
// Best Infiltrate [Aevum] - ECorp

/*
 * Use this section to disable certain modules.
 * This can be useful for certain Bitnodes
 */

// ******** Game Modules
export const MODULES = {
  // System
  HACKNET: true, // true will buy hacknets (~7.2 GB)
  HOSTING: true, // true will buy servers (~8 GB)
  CONTRACTS: true, // true will solve contracts (~27 GB)
  PUPPETEER: true, // true will HWGW on servers (~18 GB)
  CORPORATIONS: true, // true will run a corporation (~100 GB)
  GANGS: false, // true will run a gang (~TBD)
};

// ******** General Configurations
// These have been set for steady rampup, changes can cause errors
export const CONFIGS = {
  ramReserve: 32, // 8GB reserved ram
  moneyReserve: 0, // 100000 * 1000000, // 1000000 1 Million,
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
    corpStart: 150e9, // 150 Billion
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
export const LAYOUT = {
  // Width, Heigh, offset X, offsetY
  topBar: 38,
  textHeight: 24,
  bufferX: 58,
  bufferY: 52,
  OS: {
    xW: 220,
    xH: 132,
  },
  CONTRACT: {
    xW: 220,
    xH: 62,
    xOX: 0,
    xOY: 132,
  },
  HACKNET: {
    xW: 220,
    xH: 86,
    xOX: 0,
    xOY: 132 + 62,
  },
  HOSTING: {
    xW: 220,
    xH: 110,
    xOX: 0,
    xOY: 132 + 62 + 86,
  },
  PUPPETEER: {
    xW: 990,
    xH: (CONFIGS.hacking.xTargets + 2) * 24 + 38, // 326,
    xOX: 220,
    xOY: 0,
  },
  // MODULES.PUPPETEER = true; // true will HWGW on servers (~18 GB)
  // MODULES.CORPORATIONS = false; // true will run a corporation (~100 GB) //FIXME:
};

// ******** OS PATHS
export const PATHS = {
  OS: '/os',
  // DATA: '/os/data',
  DEPLOY: '/os/deploy',
  MODULES: '/os/modules',
  CACHE: '/os/cache',
};

// ******** CORE PATHS
export const CORE = {
  // System
  LAUNCHER: `${PATHS.OS}/launcher.js`,
  TWITCH: `${PATHS.OS}/twitch.js`,
  BN: `${PATHS.OS}/bn.txt`,

  // Modules
  HACKNET: `${PATHS.MODULES}/Hacknets.js`,
  HOSTING: `${PATHS.MODULES}/Hosting.js`,
  CONTRACTS: `${PATHS.MODULES}/Contract.js`,
  PUPPETEER: `${PATHS.MODULES}/Puppeteer/Puppeteer.js`,
  CORPORATIONS: '/dCorps.js',
  // CORE.GANGS = `/debug.js`;
};

// ******** TIMING CALCULATIONS
export const TIME = {
  LAUNCHING: 1 * 1000, // 1 second launch wait
  RUNNING: 1 * 1000, // 1 second checking pids
  // CLOCK: 60 * 1000, // 1 min ticks
  // REBOOT: 2 * 60, // 2 hours in ticks (minutes)
  CONTROL: 1 * 1000, // 1 second updates (MINIMUM TIME FOR GAME)
  PLAYER: 60 * 1000, // 1 second updates
  // AUGMENTS: 3 * 60 * 1000, // 3 min updates
  // SLEEVES: 2 * 1000, // 2 second updates
  HACKNET: 3 * 1000, // 3 second updates
  HOSTING: 10 * 1000, // 10 second updates
  SERVERS: 10 * 1000, // 10 second updates
  PUPPETEER: 1 * 1000, // 1 second updates
  // FACTIONS: 30 * 1000, // 30 second updates
  // CORPORATIONS: 20 * 1000, // 20 second updates
  // CRIMES: 2 * 1000, // 2 second updates
  // STOCKS: 1 * 1000, // 1 second updates
  CONTRACTS: 2 * 60 * 1000, // 2 min updates
};

// ******** PORTS CONFIGURATIONS
export const PORTS = {
  CONTROL: 1,
  PLAYER: 2,
  HACKNET: 3,
  HOSTING: 4,
  PUPPETEER: 5,
  // BITNODE: 3, // TODO: Add bitnode
  // AUGMENTS: 5, // TODO: Add augments
  // SLEEVES: 6, // TODO: Add sleeves
  // FACTIONS: 9, // TODO: Add factions
  // CORPORATIONS: 10, // TODO: Add corporations
  // CRIMES: 11, // TODO: Add crimes
  // STOCKS: 12, // TODO: Add stocks
};

// ******** CACHE Configurations
export const CACHE = {
  CONTROL: `${PATHS.CACHE}/cacheControl.js`,
  PLAYER: `${PATHS.CACHE}/cachePlayer.js`,
  // HACKNET: `${PATHS.CACHE}/cacheHacknet.js`, // TODO: Add hacknet cache
  // BITNODE: `${PATHS.CACHE}/cacheBitnode.js`, // TODO: Add bitnode cache
  // AUGMENTS: `${PATHS.CACHE}/cacheAugments.js`, // TODO: Add augments cache
  // SLEEVES: `${PATHS.CACHE}/cacheSleeves.js`, // TODO: Add sleeves cache
  // SERVERS: `${PATHS.CACHE}/cacheServers.js`,
  // FACTIONS: `${PATHS.CACHE}/cacheFactions.js`, // TODO: Add factions cache
  // CORPORATIONS: `${PATHS.CACHE}/cacheCorporations.js`, // TODO: Add corporations cache
  // CRIMES: `${PATHS.CACHE}/cacheCrimes.js`, // TODO: Add crimes cache
  // STOCKS: `${PATHS.CACHE}/cacheStocks.js`, // TODO: Add stocks cache
};

// ******** Puppeteer HWGW
export const DEPLOY = {
  // Script, Action, Icon, Ram, Script
  MIN: { A: 'MIN', I: '🐢', R: 2.41, X: `${PATHS.DEPLOY}/xmin.js` },
  HACK: { A: 'HACK', I: '💰', R: 1.71, X: `${PATHS.DEPLOY}/xhack.js` },
  WEAK: { A: 'WEAK', I: '🔓', R: 1.76, X: `${PATHS.DEPLOY}/xweak.js` },
  GROW: { A: 'GROW', I: '🌿', R: 1.76, X: `${PATHS.DEPLOY}/xgrow.js` },
  SHARE: { A: 'SHARE', I: '🫶', R: 4.0, X: `${PATHS.DEPLOY}/xshare.js` },
  WAIT: { A: 'WAIT', I: '⏱️' },
  RISK: { A: 'RISK', I: '🎲' },
  ERROR: { A: 'ERROR', I: '❌' },
};

// ******** Corporations Configurations
export const CORP = {
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
