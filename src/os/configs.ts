// TODO: Augments path
// Best University 4x Multiplier [Volhaven] - ZB Institute of Technology
// Best Gym 10x Multiplier [Sector 12] - Powerhouse Gym
// Best Infiltrate [Aevum] - ECorp

/* Augments path could go
 * [x] Netburners - Hacknet
 * [x] Sector-12
 * [x] CyberSec (CSEC) - Milestone m1
 * [x] Tian Di Hui
 * [x] NiteSec (avmnite-02h) - Milestone [112.500k rep] m2
 * [x] Aevum (40m)
 * [x] The Black Hand (I.I.I.I) - Milestone [175.000k rep] m3
 * [ ] Chongqing
 * [ ] New Tokyo (Uneeded, but can do with Chongqing)
 * [ ] Ishima (Uneeded, but can do with Chongqing)
 * [ ] Clarke Inc (Aevum) 400k [H 225 Software Engineering] ? (ZB best rates)
 * [ ] Bachman & Associates (Aevum) 400k [H 225 Software Engineering] ?
 * [ ] NWO (Volhaven) 400k [H 250 IT Intern]
 * [x] Bitrunners (run4theh111z) - Milestone m4
 * [ ] OmniTek Incorporated (Volhaven) 400k [H 225 IT Intern]
 * [ ] Fulcrum Technologies (Aevum) Backdoor 1585 400k [H 225 IT Intern]
 * [ ] Daedalus [Augmentations: a / 30] | Money: m / $100.000b | Hacking: 2500]
 * [ ] w0rld_d43m0n [H 3000]
 */

/*
 * Use this section to disable certain modules.
 * This can be useful for certain Bitnodes
 */

// ******** Game Modules
export const MODULES: any = {};
(function () {
  // System
  MODULES.HACKNET = true; // true will buy hacknets (~6 GB)
  MODULES.HOSTING = true; // true will buy servers (~8 GB)
  MODULES.CONTRACTS = true; // true will solve contracts (~27 GB)
  MODULES.PUPPETEER = true; // true will HWGW on servers (~18 GB)
  MODULES.CORPORATIONS = true; // true will run a corporation (~100 GB)
  MODULES.GANGS = false; // true will run a gang (~TBD)
})();

// ******** General Configurations
// These have been set for steady rampup, changes can cause errors
export const CONFIGS: any = {
  ramReserve: 32, // 8GB reserved ram
  moneyReserve: 0, // 100000 * 1000000, // 1000000 1 Million,
  moneyRatio: {
    // 50% 30% 20% (50% Essential, 30% life, 20% savings)
    hacknetMoneyRatio: 0.2, // 50% of money will be used on hacknet
    hostingMoneyRatio: 0.8, // 30% of money will be used on servers
    savingsMoneyRatio: 0.2, // 20% of money will be used for savings
  },
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
    workRamRatio: 0.7, // 0.7 (70%) of ram will be used for work
    shareRamRatio: 0.3, // 0.3 (30%) of ram will be used for shares
  },
  hacknet: {
    hacknetBreakevenTime: 2 * 60 * 60, // 2 hours in seconds
    hacknetTargetCount: 16, // 20 Soft Max (Real Max Infinity)
    hacknetTargetLevel: 200, // 200, // 200 (Real Max)
    hacknetTargetRam: 64, // 64, // 64 (Real Max)
    hacknetTargetCores: 16, // 16, // 16 (Real Max)
  },
  hosting: {
    hostingTargetCount: 25, // 25 (Real Max)
    hostingStartRam: 8,
    hostingTargetRam: 1048576, // L10 (1024) L15 (32768) L18 (262144) L20 (1048576) (Pow2 2, 4, 8)
  },
  hacking: {
    hackSkim: 0.1, // 10%
    hackBuffer: 1000, // Time in ms between scripts
    hackDelay: 3000, // Delay in ms between batches
    /* Max batches is calculated based on 1 minute intervals with short hack times
     * this ensures we do not lockup ram on long standing processess
     * while still allowing for long value hacks and generate smaller value quick cash
     * this prevents situations where you need to wait 30m for a large windfall
     */
    hackBatches: 128, // 128, // Batch 128 hack, weak, grow, weak
    hackTargetsMax: 10, // Only work on 25 servers
    hackTargetsPrepMax: 5, // Prepare the next n (must be less than targets max)
    hackMinBatches: 5, // Min number of batches before switching
    hackSwap: 3, // How many targets to swap at once (make less than min batches)
    /* hack Batches is the number of perfect HWGW being fired
     * we only target servers where our largest server can perfect batch to prevent locks
     * Target max is the amount of targets to focus on at the same time
     * TargetsPrep is the number of simultanious batches we need before switching targets
     * Retargeting happens on player level change
     * Early game 20 targets + 5 steps with low hack bathes works well
     * Lategame with high ram 16 batches is too low, swap to 128
     */
    // hackDistance: 15, // How much above 50% of player level we will target
  },
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
  CORE.PUPPETEER = `/debug.js`;
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
  // TIME.FACTIONS = 30 * 1000; // 30 second updates
  // TIME.CORPORATIONS = 20 * 1000; // 20 second updates
  // TIME.CRIMES = 2 * 1000; // 2 second updates
  // TIME.STOCKS = 1 * 1000; // 1 second updates
  TIME.TIMECONTRACTS = 60 * 1000; // 1.5 min updates
})();

// export const MINISAVE: any = {
//   FILE: `${PATHS.TMP}/Active.txt`,
// };

// ******** PORTS CONFIGURATIONS
export const PORTS: any = {};
(function () {
  PORTS[(PORTS.CONTROL = 1)] = 'CONTROL';
  PORTS[(PORTS.PLAYER = 2)] = 'PLAYER';
  // PORTS[(PORTS.BITNODE = 3)] = 'BITNODE'; // TODO: Add bitnode
  // PORTS[(PORTS.AUGMENTS = 5)] = 'AUGMENTS'; // TODO: Add augments
  // PORTS[(PORTS.SLEEVES = 6)] = 'SLEEVES'; // TODO: Add sleeves
  // PORTS[(PORTS.HACKNET = 7)] = 'HACKNET'; // TODO: Add hacknet
  // PORTS[(PORTS.SERVERS = 8)] = 'SERVERS'; // TODO: Add servers
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
  corpName: 'cosyco', // Corporations name
  farmName: 'Agrico', // Agriculture division name
  smokeName: 'Tobaco', // Tobacco division name
};
