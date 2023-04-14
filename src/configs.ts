export const CONFIGS: any = {
  money: {
    reserve: {
      base: 0, // 100000 * 1000000, // 1000000 1 Million
      hacknet: 0 * 1e6, // 1 Million (Min before hacknet purchases)
      servers: 0 * 1e6, // 1 Million (Min before server purchases)
    },
    ratio: {
      // 50% 30% 20% (50% Essential, 30% life, 20% savings)
      hacknet: 0.5, // 50% of money will be used on hacknet
      servers: 0.3, // 50% of money will be used on servers
      savings: 0.2, // 20% of money will be used for savings
    },
    shopping: {
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
  },
  ram: {
    reserve: {
      home: 0, // However much you want to keep available for other scripts
    },
    ratio: {
      work: 0.6, // 60% of ram will be used for work
      shares: 0.3, // 30% of ram will be used for shares
      savings: 0.1, // 20% of ram will be used as reserve
    },
  },
  hacknet: {
    target: {
      count: 20, // 20 Soft Max (Real Max Infinity)
      level: 200, // 200 (Real Max)
      ram: 64, // 64 (Real Max)
      cores: 16, // 16 (Real Max)
    },
  },
  servers: {
    target: {
      count: 25, // 25 (Real Max)
      ram: 1048576, // L10 (1024) L15 (32768) L18 (262144) L20 (1048576) (Pow2 2, 4, 8)
    },
  },
  hacking: {
    skim: 0.1, // 10%
    buffer: 250, // Time in ms between scripts
    delay: 3000, // Delay in ms between batches
    batches: 128, // Batch 128 hack, weak, grow, weak
    targets: 25, // Only work on 25 servers
  },
};

export const PATHS: any = {
  DEPLOY: '/deploy',
  UTILS: '/utils',
  SYSTEM: '/system',
  CACHE: '/system/cache',
  DATA: '/system/data',
  TMP: '/tmp',
  LOG: '/tmp',
};

export const CORE: any = {
  LAUNCHER: '/launch.js',
  MINIMAL: '/minimal.js',
  CONTROL: '/control.js',
};

export const MINISAVE: any = {
  FILE: `${PATHS.TMP}/Active.txt`,
};

export const CACHE: any = {
  BITNODE: `${PATHS.CACHE}/cacheBitnode.js`,
  PLAYER: `${PATHS.CACHE}/cachePlayer.js`,
};

export const PORTS: any = {
  LIST: [],
};
(function () {
  PORTS.LIST[(PORTS.SYSTEM = 1)] = 'system';
  PORTS.LIST[(PORTS.CONTROL = 2)] = 'control';
  PORTS.LIST[(PORTS.BITNODE = 3)] = 'bitnode';
  PORTS.LIST[(PORTS.PLAYER = 4)] = 'player';
  // PORTS.LIST[(PORTS.NETWORK = 4)] = 'network';
  // PORTS.LIST[(PORTS.HACKNET = 5)] = 'hacknet';
  // PORTS.LIST[(PORTS.SERVERS = 6)] = 'servers';
})();

export const DEPLOY: any = {
  xMin: `${PATHS.DEPLOY}/xmin.js`, // Minimal script
  xHack: `${PATHS.DEPLOY}/xhack.js`, // HWGW Hack script
  xWeak: `${PATHS.DEPLOY}/xweak.js`, // HWGW Weak script
  xGrow: `${PATHS.DEPLOY}/xgrow.js`, // HWGW Grow script
  xShare: `${PATHS.DEPLOY}/xshare.js`, // Rep Share script
};

/* 
  Server Target RAM
  L1  2GB (2)
  L2  4GB (2*2)
  L3  8GB (2*2*2)
  L4  16GB (2*2*2)
  L5  32GB (2*2*2*2*2)
  L6  64GB (2*2*2*2*2*2)
  L7  128GB (2*2*2*2*2*2*2)
  L8  256GB (2*2*2*2*2*2*2*2)
  L9  512GB (2*2*2*2*2*2*2*2*2)
  L10 1024GB (2*2*2*2*2*2*2*2*2*2) **
  L11 2048GB (2*2*2*2*2*2*2*2*2*2*2)
  L12 4096GB (2*2*2*2*2*2*2*2*2*2*2*2)
  L13 8192GB (2*2*2*2*2*2*2*2*2*2*2*2*2)
  L14 16384GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2)
  L15 32768GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2*2)
  L16 65536GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2)
  L17 131072GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2)
  L18 262144GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2)
  L19 524288GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2)
  L20 1048576GB (2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2*2)
*/
