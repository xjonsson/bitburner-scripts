/* eslint-disable */
import { NS } from '@ns';
import { CORP } from '/os/configs';
import { corpLogicPhase0 } from '/os/modules/CorporationPhase0';
import { corpLogicPhase1 } from '/os/modules/CorporationPhase1';
import { corpLogicPhase2 } from '/os/modules/CorporationPhase2';
/* eslint-enable */

const { cName, fName, sName } = CORP;

export class Corporation {
  // ******** Base
  ns: NS;
  name: string;
  exists: boolean;
  phase: number;
  stage: number;
  waitCycles: number;

  constructor(ns: NS) {
    this.ns = ns;
    this.exists = ns.corporation.hasCorporation();
    this.name = this.exists ? ns.corporation.getCorporation().name : cName;
    this.phase = -1;
    this.stage = -1;
    this.waitCycles = 0;

    // const check = this.checkProgress(ns);
    // this.phase = check.phase;
    // this.stage = check.stage;
  }

  // get corpData(): any {
  //   return this.ns.corporation.getCorporation();
  // }

  get wait(): number {
    return this.waitCycles;
  }

  set wait(cycles: number) {
    this.waitCycles = cycles;
  }

  state(cPhase = 0, cStage = 0): { phase: number; stage: number } {
    const { ns } = this;
    let phase = cPhase;
    let stage = cStage;

    if (phase === 0) {
      ({ phase, stage } = corpLogicPhase0(ns));
      this.phase = phase;
      this.stage = stage;
    }

    if (phase === 1) {
      ({ phase, stage } = corpLogicPhase1(ns, stage, this));
      this.phase = phase;
      this.stage = stage;
    }

    if (phase === 2) {
      ({ phase, stage } = corpLogicPhase2(ns, stage, this));
      this.phase = phase;
      this.stage = stage;
      ns.print(`[DEBUG] P:${phase} S:${stage}`);
      // ns.tprint(`[P1] End P:${phase} S:${stage}`);
    }

    return { phase, stage };
  }

  async checkEnergyMorale(ns: NS, dName?: string) {
    const c = ns.corporation;
    let pass = true;

    function checkOffice(d: any, o: any) {
      // Check Energy Levels
      // ns.tprint(`Checking: ${d} - ${o.city}`);
      if (o.avgEnergy < 0.95 * o.maxEnergy) {
        pass = false;
        if (c.getCorporation().funds > o.size * 500e3) {
          // ns.tprint(`Buying Tea: ${d} | ${o.city}`);
          c.buyTea(d, o.city);
        }
      }

      if (o.avgMorale < 0.95 * o.maxMorale) {
        pass = false;
        if (c.getCorporation().funds > o.size * 500e3) {
          // ns.tprint(`Party: ${d} | ${o.city}`);
          c.throwParty(d, o.city, 500e3);
        }
      }
    }

    if (this.exists) {
      if (c.getCorporation().divisions.length > 0) {
        const divs = c.getCorporation().divisions;
        if (dName && divs.includes(dName)) {
          const d = c.getDivision(dName);
          d.cities.forEach((city: any) => {
            checkOffice(dName, c.getOffice(dName, city));
          });
        } else {
          divs.forEach((tName: any) => {
            const d = c.getDivision(tName);
            d.cities.forEach((city: any) => {
              checkOffice(tName, c.getOffice(tName, city));
            });
          });
        }
        return pass;
      }
      return false;
    }
    return false;
  }
}
