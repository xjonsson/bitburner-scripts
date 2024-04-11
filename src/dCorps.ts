/* eslint-disable */
import { NS } from '@ns';
import { formatTime } from '/os/utils/formatTime';
/* eslint-enable */

// ******** Startup Stages
// Hardware, Robots, AI Cores, Real Estate
const rHardware = [125, 2675, 6500];
const rRobots = [0, 96, 630];
const rAI = [75, 2445, 3750];
const rReal = [27000, 119400, 84000];

// ******** Styling
const rowStyle =
  ' %-1s ' + // City
  '%1s ' + // Unassigned
  '%3s' + // Employees
  '|%-3s ' + // Size
  '%3s|' + // Morale %
  '%3s ' + // Energy %
  '%4s ' + // Production #
  '%-6s ' + // Operations # and Production
  '%-6s ' + // Engineering # and Production
  '%-6s ' + // Business # and Production
  '%-6s ' + // Management # and Production
  '%-6s ' + // R&D # and Production
  // '%-6s ' + // Interns # and Production
  '%4s ' + // Hardware #
  '%4s ' + // Robots #
  '%4s ' + // AI Cores #
  '%4s ' + // Real Estate #
  '%-8s'; // Action

// ******** Display
function updateHeader(ns: NS) {
  ns.printf(
    rowStyle,
    'O', // City
    'U',
    'Emp',
    'Siz',
    'M%',
    'E%',
    'Prod',
    'Ops',
    'Eng',
    'Bus',
    'Man',
    'R&D',
    // 'Int',
    'Hard',
    'Robo',
    'AI',
    'Real',
    'Action'
  );
}

async function checkEnergyMorale(ns: NS, divisionName: string, cities: any) {
  const c = ns.corporation;

  cities.forEach((city: any) => {
    const o = c.getOffice(divisionName, city);
    // Check Energy Levels
    if (o.avgEnergy < 0.95 * o.maxEnergy) {
      if (c.getCorporation().funds > o.size * 500e3) {
        c.buyTea(divisionName, o.city);
      }
    }

    if (o.avgMorale < 0.95 * o.maxMorale) {
      if (c.getCorporation().funds > o.size * 500e3) {
        c.throwParty(divisionName, o.city, 500e3);
      }
    }
  });
}

function updateOffices(
  ns: NS,
  divisionName: string,
  cities: any[],
  actions: any
) {
  const c = ns.corporation;

  cities.forEach((city) => {
    const o = c.getOffice(divisionName, city);

    // Boost Material
    const mHardware = c.getMaterial(divisionName, city, 'Hardware').stored;
    const mRobots = c.getMaterial(divisionName, city, 'Robots').stored;
    const mAI = c.getMaterial(divisionName, city, 'AI Cores').stored;
    const mReal = c.getMaterial(divisionName, city, 'Real Estate').stored;

    ns.printf(
      rowStyle,
      o.city.slice(0, 1),
      o.employeeJobs.Unassigned > 0 ? o.employeeJobs.Unassigned : '',
      o.numEmployees,
      o.size,
      `${ns.formatNumber(o.avgMorale, 0)}`,
      `${ns.formatNumber(o.avgEnergy, 0)}`,
      ns.formatNumber(o.employeeProductionByJob.total, 0),
      o.employeeJobs.Operations > 0
        ? `${o.employeeJobs.Operations} ${ns.formatNumber(
            o.employeeProductionByJob.Operations,
            0
          )}`
        : '',
      o.employeeJobs.Engineer > 0
        ? `${o.employeeJobs.Engineer} ${ns.formatNumber(
            o.employeeProductionByJob.Engineer,
            0
          )}`
        : '',
      o.employeeJobs.Business > 0
        ? `${o.employeeJobs.Business} ${ns.formatNumber(
            o.employeeProductionByJob.Business,
            0
          )}`
        : '',
      o.employeeJobs.Management > 0
        ? `${o.employeeJobs.Management} ${ns.formatNumber(
            o.employeeProductionByJob.Management,
            0
          )}`
        : '',
      o.employeeJobs['Research & Development'] > 0
        ? `${o.employeeJobs['Research & Development']} ${ns.formatNumber(
            o.employeeProductionByJob['Research & Development'],
            0
          )}`
        : '',
      // o.employeeJobs.Intern > 0
      //   ? `${o.employeeJobs.Intern} ${ns.formatNumber(
      //       o.employeeProductionByJob.Intern,
      //       0
      //     )}`
      //   : '',
      mHardware > 0 ? ns.formatNumber(mHardware, 1) : '',
      mRobots > 0 ? ns.formatNumber(mRobots, 1) : '',
      mAI > 0 ? ns.formatNumber(mAI, 1) : '',
      mReal > 0 ? ns.formatNumber(mReal, 1) : '',
      actions[city]
    );
  });
}

// ******** Main function
export async function main(ns: NS) {
  // ******** Single Vars
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();
  ns.setTitle('Corporation');
  ns.resizeTail(926, 230);
  ns.moveTail(60, 780);
  // const start = performance.now(); // DEBUG
  let cycles = 0;

  // ******** Single run code
  ns.print('========DEBUG========');
  // const check = ServerInfo.list(ns).includes('w0r1d_d43m0n');
  const isRegistered = ns.corporation.hasCorporation();
  if (isRegistered) {
    const corp = ns.corporation.getCorporation();
    const { divisions } = corp;

    // Agrico
    const agricoName = divisions[0];
    const agrico = ns.corporation.getDivision(agricoName);
    const agricoCities = agrico.cities;
    const agricoActions = {
      'Sector-12': 'READ',
      Aevum: '',
      Chongqing: '',
      'New Tokyo': '',
      Ishima: '',
      Volhaven: 'DEBUG',
    };

    // const sample = ns.corporation.getIndustryData('Agriculture');
    // const sample = ns.corporation.getOffice(agricoName, 'Sector-12');
    // ns.print(agricoCities, agricoCities.length);
    // ns.print(sample);

    while (true) {
      ns.clearLog();
      // ******** Tick Vars
      // const now = performance.now(); // DEBUG
      // ns.print(`[Running] ${formatTime(ns, now - start)}`);

      // ******** EACH CYCLE
      // ns.print('========DEBUG========');
      ns.clearLog();
      ns.print(`[Cycles] ${cycles}`);
      updateHeader(ns);
      updateOffices(ns, agricoName, agricoCities, agricoActions);

      // ******** EACH START
      while (ns.corporation.getCorporation().nextState === 'START') {
        // updateOffices(ns, agricoName, agricoCities);
        agricoActions.Aevum = 'RECHECK';
        // await ns.asleep(100);
        await ns.corporation.nextUpdate();
      }

      while (ns.corporation.getCorporation().nextState === 'PURCHASE') {
        // updateOffices(ns, agricoName, agricoCities);
        // await ns.asleep(100);
        await ns.corporation.nextUpdate();
      }

      while (ns.corporation.getCorporation().nextState === 'PRODUCTION') {
        // updateOffices(ns, agricoName, agricoCities);
        // await ns.asleep(100);
        await ns.corporation.nextUpdate();
      }

      while (ns.corporation.getCorporation().nextState === 'EXPORT') {
        // updateOffices(ns, agricoName, agricoCities);
        // await ns.asleep(100);
        await ns.corporation.nextUpdate();
      }

      while (ns.corporation.getCorporation().nextState === 'SALE') {
        // updateOffices(ns, agricoName, agricoCities);
        // await ns.asleep(100);
        await ns.corporation.nextUpdate();
      }
      await checkEnergyMorale(ns, agricoName, agricoCities);

      cycles += 1;
      await ns.asleep(100); // Maybe 10 seconds
    }
  }
  ns.print('No company registered');
}

// ******** SAMPLES

// const sGetCorporation = {
//   name: 'cosy-co',
//   funds: 11600174300.906786,
//   revenue: 655945.1563385163,
//   expenses: 237242.52517279144,
//   public: false,
//   totalShares: 1500000000,
//   numShares: 900000000,
//   shareSaleCooldown: 0,
//   investorShares: 600000000,
//   issuedShares: 0,
//   issueNewSharesCooldown: 0,
//   sharePrice: 136.9684063941454,
//   dividendRate: 0,
//   dividendTax: 0.15,
//   dividendEarnings: 0,
//   nextState: 'SALE',
//   prevState: 'EXPORT',
//   divisions: ['Agrico'],
//   state: 'SALE',
// };

// const sGetDivisions = {
//   name: 'Agrico',
//   type: 'Agriculture',
//   awareness: 3.0149999999999997,
//   popularity: 0.34220000000007356,
//   productionMult: 52.520344838191775,
//   researchPoints: 2273.079060667599,
//   lastCycleRevenue: 649724.1554812354,
//   lastCycleExpenses: 233703.51507308087,
//   thisCycleRevenue: 0,
//   thisCycleExpenses: 2275431.0251392247,
//   numAdVerts: 1,
//   cities: [
//     'Sector-12',
//     'Aevum',
//     'Chongqing',
//     'New Tokyo',
//     'Ishima',
//     'Volhaven',
//   ],
//   products: [],
//   makesProducts: false,
//   maxProducts: 0,
// };

// // Passed 'Agriculture'
// const sGetIndustryData = {
//   startingCost: 40000000000,
//   description: 'Cultivate crops and breed livestock to produce food.',
//   recommendStarting: true,
//   realEstateFactor: 0.72,
//   scienceFactor: 0.5,
//   hardwareFactor: 0.2,
//   robotFactor: 0.3,
//   aiCoreFactor: 0.3,
//   advertisingFactor: 0.04,
//   requiredMaterials: { Water: 0.5, Chemicals: 0.2 },
//   producedMaterials: ['Plants', 'Food'],
//   makesMaterials: true,
//   makesProducts: false,
// };

// // Passed 'Agrico', 'Sector-12'
// const sGetOffice = {
//   city: 'Sector-12',
//   size: 9,
//   maxEnergy: 100,
//   maxMorale: 100,
//   numEmployees: 9,
//   avgEnergy: 16.859807269123145,
//   avgMorale: 12.885375267953712,
//   totalExperience: 744.7330000001451,
//   employeeProductionByJob: {
//     total: 61.39454108200678,
//     Operations: 6.100848716188518,
//     Engineer: 6.956230164067287,
//     Business: 3.7201181042566,
//     Management: 7.410690896182508,
//     'Research & Development': 37.206653201311866,
//     Intern: 0,
//     Unassigned: 0,
//   },
//   employeeJobs: {
//     Operations: 1,
//     Engineer: 1,
//     Business: 1,
//     Management: 1,
//     'Research & Development': 5,
//     Intern: 0,
//     Unassigned: 0,
//   },
// };
