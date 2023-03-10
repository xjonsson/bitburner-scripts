# Harooo!

Collection of scripts while trying out Bitburner

## Logic

Add image of logic flow here

### Scripts

| Script     | RAM    | Purpose                                                 | Logic                                        |
| ---------- | ------ | ------------------------------------------------------- | -------------------------------------------- |
| Start      | 2.7GB  | Controls the start of the run                           | ![Start](docs/Module-Start.jpg?raw=true)     |
| Configs    | X.XXGB | Global configuration options                            | - TBD                                        |
| Minimal    | 7.70GB | Handles basic gameplay with no ram                      | ![Minimal](docs/Module-Minimal.jpg?raw=true) |
| Controller | X.XXGB | Manages game loop with ram                              | - TBD                                        |
| Player     | X.XXGB | Handles player data                                     | - TBD                                        |
| Network    | X.XXGB | Handles ring network                                    | - TBD                                        |
| Server     | X.XXGB | Servers home, ring, hacknet, servers, bots and targets  | - TBD                                        |
| Focus      | X.XXGB | Handles targeting and distribution                      | - TBD                                        |
| Shop       | X.XXGB | Handles shopping and flow                               | - TBD                                        |
| Monitor    | 4.15GB | Monitors a server for security, money, threads and time | ![Monitor](docs/Module-Monitor.png?raw=true) |
| xmin       | 2.40GB | Minimal Hack, Weak, Grow on single target               | ![xmin](docs/Module-xmin.jpg?raw=true)       |
| xhack      | 1.75GB | Distributable hack script                               | -                                            |
| xweak      | 1.80GB | Distributable weak script                               | -                                            |
| xgrow      | 1.80GB | Distributable grow script                               | -                                            |

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
