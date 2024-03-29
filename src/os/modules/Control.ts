/* eslint-disable */
import { NS } from '@ns';
import { CONFIGS } from '/os/configs';
import { osLogic } from '/os/modules/Logic';
/* eslint-enable */

export class Control {
  id: string;
  ticks: any;
  stage: number;
  phase: any;
  isShopHacknet: boolean;

  // ******** Constructor
  constructor(ns: NS, past: Control) {
    // ******** Defaults
    this.id = 'control';
    this.ticks = past ? past.ticks + 1 : 0;
    this.stage = past ? past.stage : 0;
    this.phase = osLogic(ns, this.stage);
    this.isShopHacknet = past ? past.isShopHacknet : true;

    // ******** Calculations
    if (this.phase.done) {
      this.stage += 1;
    }
  }
}

export const ControlInfo = {
  details(ns: NS, pastControl: Control) {
    return new Control(ns, pastControl);
  },
};
