# Harooo!

Collection of scripts while trying out Bitburner

**Run filesync:**
How to run the sync

```
npm install
npm run watch
```

Then go to Bitburner and connect in the remote API options

**Alias:**
Launch the scripts

```
alias start="run /os/launcher.js"
```

Buy software

```
alias exes="home;connect darkweb;buy BruteSSH.exe;buy FTPCrack.exe;buy relaySMTP.exe;buy HTTPWorm.exe;buy SQLInject.exe;buy ServerProfiler.exe;buy AutoLink.exe;buy DeepscanV1.exe;buy DeepscanV2.exe;home";
```

Nuke server

```
alias nuke="run BruteSSH.exe;run FTPCrack.exe;run relaySMTP.exe;run HTTPWorm.exe;run SQLInject.exe;run NUKE.exe"
```

Route and door (host: string, door: boolean)

```
alias route="run os/modules/Route.js"
```

Backdoor all possible servers

```
alias doors="run /os/utils/backdoor.js"
```

Generate Milestone alias (m1-m4)

```
alias milestones="run os/utils/milestoneRoutes.js"
```

Automatically Complete all Infiltrations

```
alias infilStart="run /os/modules/Infiltration.js --start"
alias infilStop="run /os/modules/Infiltration.js --stop"
```

## Logic

Add image of logic flow here

### Scripts

| Script     | RAM     | Purpose                                                 | Logic                                               |
| ---------- | ------- | ------------------------------------------------------- | --------------------------------------------------- |
| Start      | 2.7GB   | Controls the start of the run                           | ![Start](docs/Module-Start.jpg?raw=true)            |
| Configs    | 1.60GB  | Global configuration options                            | -                                                   |
| Minimal    | 7.20GB  | Handles basic gameplay with no ram                      | ![Minimal](docs/Module-Minimal.jpg?raw=true)        |
| Controller | 14.90GB | Manages game loop with ram                              | -                                                   |
| Network    | 12.00GB | Handles ring and networking                             | -                                                   |
| Focus      | X.XXGB  | Handles targeting and distribution                      | - TBD                                               |
| Monitor    | 4.15GB  | Monitors a server for security, money, threads and time | ![Monitor](docs/Module-Monitor.png?raw=true)        |
| Minideploy | 4.65GB  | Script to help % targeting on home                      | ![Mini Deploy](docs/Module-Minideploy.png?raw=true) |
| xmin       | 2.40GB  | Minimal Hack, Weak, Grow on single target               | ![xmin](docs/Module-xmin.jpg?raw=true)              |
| xhack      | 1.75GB  | Distributable hack script                               | -                                                   |
| xweak      | 1.80GB  | Distributable weak script                               | -                                                   |
| xgrow      | 1.80GB  | Distributable grow script                               | -                                                   |
| zPlayer    | 2.25GB  | Handles player data, skill, programs, money, ports      | ![Player](docs/Module-Player.jpg?raw=true)          |
| zServer    | 5.55GB  | Servers home, ring, hacknet, servers, bots and targets  | -                                                   |
| zShop      | 10.75GB | Handles shopping and flow (Nodes and Servers)           | -                                                   |
| zCalc      | 2.10GB  | Calculation functions numCycleForGrowthCorrected        | -                                                   |
| zDisplay   | 5.60GB  | Used to handle printing and styling                     | -                                                   |
| uDoor      | 29.50GB | Auto backdoors all servers without singularity api      | -                                                   |
| uRoute     | 1.80GB  | Utility to provide route to server                      | -                                                   |

---

### Notes

- RAM usage is guidelines only if you were to run them individually. Eg, Controller uses many of the classes but only totals 14.90GB as RAM usage is only counted once per function.
- uDoor.js - Needs to be run while looking at terminal (InjectHTML limitation)
- uDoor.js - If using 'Do something else' can cause script to stop injecting, kill, refresh, start fixes it

---

### Resources

- [Bitburner Remote File API](zRemoteAPI.md)
- [Step by step install](zBeginnersGuide.md)
- [Bitburner Official Github - Typescript Template for Remote API](https://github.com/bitburner-official/typescript-template)
- [Bitburner Official Documentation - Remote API](https://bitburner-official.readthedocs.io/en/latest/remoteapi.html)
- [Bitburner Official Documentation - Netscript](https://bitburner-official.readthedocs.io/en/latest/netscript.html)
- [Bitburner Official Github - Netscript Interface](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md)

---

### Credit

- Remote API and wrapper thanks to the [Typescript Template repo](https://bitburner-official.readthedocs.io/en/latest/remoteapi.html) and hydroflame, Hoekstraa, based on work by SlyCedix
- Minimal.js borrows from [Official Getting Started Guide](https://bitburner-official.readthedocs.io/en/latest/guidesandtips/gettingstartedguideforbeginnerprogrammers.html)
- Hacknet payback time borrows from [@grimley517](https://gist.github.com/grimley517/c2d531976db057cede4ac8e367418971)
- HWGW Algorithm borrows from [@trhr](https://github.com/trhr/lets-play-bitburner/blob/ep7/hwgw.js)
- Contracts solver is straight from [@jjclark1982](https://github.com/jjclark1982/bitburner-scripts/tree/main/contracts)
