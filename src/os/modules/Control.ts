/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS, CORE, MODULES } from '/os/configs';
import { osLogic } from '/os/modules/Logic';
import { PlayerCache, HacknetCache, HostingCache } from '/os/modules/Cache';
import { IBNMults, getBNData } from '/os/modules/BitNodes';
import { reclaimer } from '/os/modules/Reclaim';
import { Banner } from '/os/utils/colors';
/* eslint-enable */

// ******** Globals
const { HACKNET, HOSTING, CORPORATIONS } = MODULES;
const { corpStart } = CONFIGS.shoppingPrices;
const { hTCount } = CONFIGS.hosting;

// ******** CONTROL UTILITY FUNCTIONS
function getPurchaseServerCost(ram: number, cost: number, cap: number): number {
  const sRam = Math.round(ram);
  const sUpgrade = Math.max(0, Math.log(sRam) / Math.log(2) - 6);
  return sRam * 55000 * cost * cap ** sUpgrade;
}

export class Control {
  id: string;
  ticks: number;
  bitnode: number;
  bnLevel: number;
  bnMults: IBNMults;
  stage: number;
  level: number;
  challenge: number;
  isReserve: number;
  isShopHN: boolean;
  isShopH: boolean;
  isCorporation: boolean;
  phase: {
    done: boolean;
    msg: string;
    hn: boolean;
    hosting: boolean;
    reserve: number;
  };

  // ******** Constructor
  constructor(ns: NS, past?: Control) {
    // ******** Defaults
    this.id = 'control';
    this.ticks = past ? past.ticks + 1 : 0;
    const { bitnode, bnLevel, bnMults } = getBNData(ns);
    this.bitnode = past ? past.bitnode : bitnode;
    this.bnLevel = past ? past.bnLevel : bnLevel;
    this.bnMults = past ? past.bnMults : bnMults;
    this.stage = past ? past.stage : 0;
    this.phase = osLogic(ns, this.stage);
    this.level = past ? past.level : -1;
    this.challenge = past ? past.challenge : -1;

    // ******** Update shopping modules and logic
    this.isReserve = this.phase.reserve;
    this.isShopHN = HACKNET ? this.phase.hn : false;
    this.isShopH = HOSTING ? this.phase.hosting : false;
    this.isCorporation = CORPORATIONS && past ? past.isCorporation : false;

    // ******** Check for stage change
    if (this.phase.done) this.stage += 1;

    // ******** Check for player changes
    const p = PlayerCache.read(ns, 'player');
    if (p?.level > this.level) this.level = p?.level;
    if (p?.challenge > this.challenge) {
      this.challenge = p?.challenge;
      reclaimer(ns, this.challenge);
    }

    // ******** Check for corporation
    if (!this.isCorporation) {
      const hSoftCap = this.hostingSoftCap;
      const hHighest = HostingCache.read(ns).ramHighest;
      if (hHighest > hSoftCap) {
        this.isShopH = false;
        this.isReserve = corpStart;
      }
      // ns.tprint(Banner.warning('mphNode', hSoftCap.toString()));
    }
  }

  // ******** METHODS
  get hostingSoftCap() {
    if (!CORPORATIONS || this.isCorporation) return 1048576;
    const mphNode = corpStart / hTCount;
    const { PurchasedServerCost: sCost } = this.bnMults;
    const { PurchasedServerSoftcap: sCap } = this.bnMults;
    let softCap = 2;
    for (let i = softCap; i <= 1048576; i *= 2) {
      if (getPurchaseServerCost(i, sCost, sCap) < mphNode) softCap = i;
    }
    return softCap;
  }

  // ******** Functions
}

export const ControlInfo = {
  details(ns: NS, pastControl?: Control) {
    return new Control(ns, pastControl);
  },
};
