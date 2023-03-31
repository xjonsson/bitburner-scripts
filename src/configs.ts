export const configs: any = {
  reserve: {
    money: {
      base: 0, // 100000 * 1000000, // 1000000 1 Million
      hacknet: 6 * 1000000, // 6 Million
      servers: 5 * 1000000, // 6 Million
    },
    ram: {
      home: 64, // // However much you want to keep available for other scripts
      work: 0.5, // How much to use forwork (decimal %)
      share: 0.25, // How much to use for shares (decimal %)
    },
  },
  hacknet: {
    count: 23, // 24 Soft Max (Real Max Infinity)
    level: 200, // 200 Max
    ram: 64, // 64 Max
    cores: 16, // 16 Max
  },
  servers: {
    count: 25, // 25 Max
    ram: 1048576, // L10 (1024) L15 (32768) L18 (262144) L20 (1048576) (Pow2 2, 4, 8)
  },
  shopping: {
    tor: 200000, // 200 K
    ssh: 500000, // 500 K
    ftp: 1500000, // 1.5 Million
    smtp: 5000000, // 5 Million
    http: 30000000, // 30 Million
    sql: 250000000, // 250 Million
    serverProfiler: 500000, // 500 K
    deepscanV1: 500000, // 500 K
    deepscanV2: 25000000, // 25 Million
    autolink: 1000000, // 1 Million
    formulas: 5000000000, // 5 Billion
  },
  scripts: {
    xMin: 'xmin.js', // Minimal script
    xHack: 'xhack.js', // HWGW Hack script
    xWeak: 'xweak.js', // HWGW Weak script
    xGrow: 'xgrow.js', // HWGW Grow script
    xShare: 'xshare.js', // Rep Share script
  },
  hacking: {
    skim: 0.1, // 10%
    buffer: 250, // Time in ms between scripts
    delay: 3000, // Delay in between batches
    batches: 128, // Batch 125 hack, weak, grow, weak
    targets: 25, // Only work on 25 servers
  },
};

export const PORTS: any = {
  LIST: [],
};
(function () {
  PORTS.LIST[(PORTS.CONTROL = 0)] = 'control';
  PORTS.LIST[(PORTS.PLAYER = 1)] = 'player';
  PORTS.LIST[(PORTS.NETWORK = 2)] = 'network';
  PORTS.LIST[(PORTS.HACKNET = 3)] = 'hacknet';
  PORTS.LIST[(PORTS.SERVERS = 4)] = 'servers';
})();

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
