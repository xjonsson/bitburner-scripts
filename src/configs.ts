export const configs: any = {
  hackAmount: 0.1, // 10%
  focusAmount: 125, // Batch 125 hack, weak, grow, weak
  focusLimit: 25, // Only work on 25 servers
  reserve: 1000000, // 1000000 1 Million
  reserveServers: 5000000, // 5000000 5 Million
  reserveNodes: 6000000, // 6000000000 6 Billion
  reserveRAM: 64, // However much you want to keep available for other scripts
  nodesTargetCount: 24, // 24 Soft Max (Real Max Infinity)
  nodesTargetLevel: 200, // 200 Max
  nodesTargetRAM: 64, // 64 Max
  nodesTargetCores: 16, // 16 Max
  serversTargetCount: 25, // 25 Max
  serversTargetRAM: 32768, // L10 (1024) L15 (32768) L20 (1048576) (Pow2 2, 4, 8)
  softwareCost: {
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
  xMin: 'xmin.js',
  xHack: 'xhack.js',
  xWeak: 'xweak.js',
  xGrow: 'xgrow.js',
  xShare: 'xshare.js',
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
