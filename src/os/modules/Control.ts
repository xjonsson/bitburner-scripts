/* eslint-disable */
import { NS } from '@ns';
/* eslint-enable */

export class Control {
  id: string;
  ticks: any;

  // ******** Constructor
  constructor(ns: NS, past: Control) {
    this.id = 'control';
    this.ticks = past ? past.ticks + 1 : 0;
  }
}

export const ControlInfo = {
  details(ns: NS, pastControl: Control) {
    return new Control(ns, pastControl);
  },
};
