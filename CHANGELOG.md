# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.2](https://github.com/xjonsson/bitburner-scripts/compare/v0.2.1...v0.2.2) (2024-05-07)


### Features

* **colors:** added colors and linting to Hacknet and Hosting ([6eb5dd8](https://github.com/xjonsson/bitburner-scripts/commit/6eb5dd8e54be6da4163062f2338f4c4b7e28a1ed))
* **os:** refactored os and Fixed [#28](https://github.com/xjonsson/bitburner-scripts/issues/28) ([2b8f3e6](https://github.com/xjonsson/bitburner-scripts/commit/2b8f3e6f3ed348279f1aae6c85a89fa97b3f6dd1))
* **os:** upgrade linters, added colors, refactored general code ([eef6edf](https://github.com/xjonsson/bitburner-scripts/commit/eef6edfb882cdb0512f1f66814b69e5408c03957))

### [0.2.1](https://github.com/xjonsson/bitburner-scripts/compare/v0.2.0...v0.2.1) (2024-04-27)


### Features

* **contracts:** refactored and cleaned contracts. Easier to read and more efficient ([63fbc5a](https://github.com/xjonsson/bitburner-scripts/commit/63fbc5a2983f3c93de06ada2c9d0d3641f651fa1))
* **hosting:** fixed [#23](https://github.com/xjonsson/bitburner-scripts/issues/23) Refactor hosting to be cleaner, compact and more efficient ([e600d89](https://github.com/xjonsson/bitburner-scripts/commit/e600d8925ef4a6b420a2677f1342e992893ae399))
* **puppeteer:** added selection between primed and ready targets. Much cleaner faster loops ([224dfb9](https://github.com/xjonsson/bitburner-scripts/commit/224dfb9626d0c66a047fd5244b91d902b6cbd72c))
* **puppeteer:** clean switching, target selection, risk exclusion, reconnects, dynamic batching ([edc775f](https://github.com/xjonsson/bitburner-scripts/commit/edc775f9c2a86da76c634b4bc85e466a025d8473))
* **puppeteer:** reworked Puppeteer and ServerTarget, looks like garbage but 62% more efficient ([07c5007](https://github.com/xjonsson/bitburner-scripts/commit/07c5007f913c94676c97f1d8849744b44f5e95d6))
* **puppeteer:** working version, still small tweaks but 20b lvl450 from fresh in 45m is decent ([8fa872f](https://github.com/xjonsson/bitburner-scripts/commit/8fa872f31e7b5ab34b77e82d048aa8dda624dcd0))
* **servertarget:** added cleaner code, caching, and async functions. 38% faster, uses 5-6% CPU ([120ddd1](https://github.com/xjonsson/bitburner-scripts/commit/120ddd12ccc3d287078294a6173f5d86ac762222))


### Bug Fixes

* **puppeteer:** removing async keeps everything in sync and perfect HWGW batches once primed ([46b7288](https://github.com/xjonsson/bitburner-scripts/commit/46b7288a34577eaaa880ff7f171113493bebca2f))
* **puppeteer:** seeing if async is causing the issues in timings ([4f05fd4](https://github.com/xjonsson/bitburner-scripts/commit/4f05fd41912d81c3b58eaa4e0570ba2947e2cfda))
* **puppeteer:** wIP Issue is specifically with updateTargets during swap ([4a88102](https://github.com/xjonsson/bitburner-scripts/commit/4a88102f3ac91056e5a7a2276c2ae38f7d959f56))

## [0.2.0](https://github.com/xjonsson/bitburner-scripts/compare/v0.1.5...v0.2.0) (2024-04-17)


### ⚠ BREAKING CHANGES

* **os:** reworking from start, use this branch for new version of Bitburner

### Features

* **all:** saving state for large refactor ([c0f1ca4](https://github.com/xjonsson/bitburner-scripts/commit/c0f1ca4f9e7821c11d3c0f17fe51b1fdf417ee4b))
* **augments:** added script to pull data from augments ([2c5389f](https://github.com/xjonsson/bitburner-scripts/commit/2c5389f04dfa1a6e166d83561f8edcd14c2e3745))
* **backdoor:** added back and fixed backdoor script for all servers ([6033f98](https://github.com/xjonsson/bitburner-scripts/commit/6033f98be372f9d9706534d66f081f9d862f2a54))
* **backdoor:** added backdoor without singularity scripts ([713d490](https://github.com/xjonsson/bitburner-scripts/commit/713d490cbd5458962cc6e3b86a15d609ad4542dd))
* **batch:** working version of mini batcher ([3fd767e](https://github.com/xjonsson/bitburner-scripts/commit/3fd767e3c861ee38b512355ce64fe39d62688152))
* **cache:** added player cache ([679435e](https://github.com/xjonsson/bitburner-scripts/commit/679435e078a122d829f0ee128d54735e6c8ce932))
* **cache:** basic player data caching and reading ([2e97224](https://github.com/xjonsson/bitburner-scripts/commit/2e97224be227d1d6cf303ccf43ac686589022f3c))
* **cache:** proper version of launch and cache ([4837dbb](https://github.com/xjonsson/bitburner-scripts/commit/4837dbb82351d5925e519aa714e48f860bd43447))
* **cache:** working on bitnode cache ([e592055](https://github.com/xjonsson/bitburner-scripts/commit/e592055c15e89731d4b603cc70fbf5e858f56ad2))
* **configs:** made configs more readable and usable ([41deb29](https://github.com/xjonsson/bitburner-scripts/commit/41deb29b05d1b9fba6e029744780608db2836eb9)), closes [#13](https://github.com/xjonsson/bitburner-scripts/issues/13)
* **contracts:** added Merge Overlapping Intervals ([6c711fd](https://github.com/xjonsson/bitburner-scripts/commit/6c711fd8ab4e6c0a1aa9ea7348c193e70ffd1fef))
* **contracts:** added solver for Compression III: LZ Compression ([6013aab](https://github.com/xjonsson/bitburner-scripts/commit/6013aabde4f9223170dd2ed82cc948a849e24a9d))
* **contracts:** updated contracts solver to run on startup. Sanity checking each solution ([fa2ea88](https://github.com/xjonsson/bitburner-scripts/commit/fa2ea88ad00d2a94d4d60e4919eddd8fb7f45aff))
* **corp:** added ability to create new products and set prices ([8d98f7f](https://github.com/xjonsson/bitburner-scripts/commit/8d98f7f3b5662001d3894d4ad3c1ca00bdfe278a))
* **corp:** added Boosting, Warehouses, Employee assignments, Upgrades. Learned about exports ([6b68ef5](https://github.com/xjonsson/bitburner-scripts/commit/6b68ef5b595c550ffa4668154c18306cda8b497c))
* **corp:** added cleaner startup sequence ([2988cf5](https://github.com/xjonsson/bitburner-scripts/commit/2988cf572962fa36d7f139025fc2c78475eaaf5e))
* **corp:** added corporation startup state logic checks. Dirty, refactor if it works ([eea6351](https://github.com/xjonsson/bitburner-scripts/commit/eea63511c3541280b7de014024ae9e83da27cded))
* **corp:** added up to product industry. Need to figure out priorities with non linear ([ac91f2e](https://github.com/xjonsson/bitburner-scripts/commit/ac91f2e3b5c5735bcad56f1695fc8edbc38bf920))
* **corp:** added up to step 14 purchasing upgrades. Also refactored corp code a bit ([b6c4428](https://github.com/xjonsson/bitburner-scripts/commit/b6c4428ac31ffb0c91866c3d50b913023f85d540))
* **focus:** added focus for targets to only update cache with attacks ([46c18a2](https://github.com/xjonsson/bitburner-scripts/commit/46c18a238d8294e16b0a1b313ee01b9f02a6fc30))
* **hacknet:** hacknet is more compact, and efficient. Slower ramp, but less cpu usage ([8afe363](https://github.com/xjonsson/bitburner-scripts/commit/8afe363ac2d4ffe1382cf6b686778807a122bd9c))
* **hosting:** added basic hosting ([e989d86](https://github.com/xjonsson/bitburner-scripts/commit/e989d86ba78af31be8b85e3b1ee0ce3cdfcffc5c))
* **hwgw:** added auto stepper, prepper, and multi batcher. Need to clean up cpu usage 15% high ([94ae0f1](https://github.com/xjonsson/bitburner-scripts/commit/94ae0f1f27bdac51cd741b664c1861b6aab686a4))
* **hwgw:** added working batcher for puppeteer ([882b3e2](https://github.com/xjonsson/bitburner-scripts/commit/882b3e2d8b2187a0b03ea12145b982e1d8c705c7))
* **hwgw:** added working version of hwgw but needs better timings ([9599565](https://github.com/xjonsson/bitburner-scripts/commit/9599565e24e4edf9163f0053366554e9213b6088))
* **infiltration:** added Unique Paths in a Grid I, as well as auto infiltration scripts ([3d1c1fc](https://github.com/xjonsson/bitburner-scripts/commit/3d1c1fc54d1448b7fc414d9b3cf575d8e7d34579))
* **launcher:** added launcher, base for main code, and temp hacknet instead of our previous one ([6319247](https://github.com/xjonsson/bitburner-scripts/commit/6319247345ba36971a5ddce25ad312cd4db17bdb))
* **launcher:** added reworked launcher to handle bitnode input ([1f1c535](https://github.com/xjonsson/bitburner-scripts/commit/1f1c535400f3ab58257f56c69e518d18270e5017))
* **logic:** added basic early logic ([c5ed0ff](https://github.com/xjonsson/bitburner-scripts/commit/c5ed0ff43bce278facd7730e0858bc50c3696545))
* **logic:** added logic to better handle hacknets during game phases ([fcf7e1a](https://github.com/xjonsson/bitburner-scripts/commit/fcf7e1ac04e7f48d97c223d8c3af2a67ad9a2298))
* **os:** saving state for refactor ([2f57609](https://github.com/xjonsson/bitburner-scripts/commit/2f57609888cfbdf4c954ad6dad1f1f70b381d51d))
* **player:** added ability to debug player from file ([29a743e](https://github.com/xjonsson/bitburner-scripts/commit/29a743ecb28f601898752cff5170fd412e5251c4))
* **player:** player caching and functions ([9ffd984](https://github.com/xjonsson/bitburner-scripts/commit/9ffd9849a4d2296de9c7b531848e3711898e1334))
* **ports:** added working version of cache ports ([55adb25](https://github.com/xjonsson/bitburner-scripts/commit/55adb25c737ae921c5dea7a36efe8be252f4d679))
* **reclaim:** added reclaim module to control for nuking ([34b6fa6](https://github.com/xjonsson/bitburner-scripts/commit/34b6fa68c54d4232a0dc448a89e1d443bbc4e791))
* **server:** added ability to copy scripts over when server is created ([2095dd7](https://github.com/xjonsson/bitburner-scripts/commit/2095dd708b1fa8d1090dc5bd12ad7090cb0c4d03))
* **server:** added ability to use batch for initial prep ([f6f3561](https://github.com/xjonsson/bitburner-scripts/commit/f6f35615bf1536fa4aec9213aeb4960982d1e7e7))
* **servers:** added servers class ([83b863e](https://github.com/xjonsson/bitburner-scripts/commit/83b863ed4bb5df6658f0cd80dce3c884b43ab009))
* **servers:** fixed reclaimer and simplified servers ([cfde3ce](https://github.com/xjonsson/bitburner-scripts/commit/cfde3cef589892ca80d4bafb2fd9ecfa36ea9255))
* **server:** updated ROI calculation and finished display stats ([0e14610](https://github.com/xjonsson/bitburner-scripts/commit/0e146106de2e7e6b3d0ea082ab54cc9f3084eaa6))
* **server:** wip refactor ([68ffe3f](https://github.com/xjonsson/bitburner-scripts/commit/68ffe3f6578b33549e04bf79a3279f92f4ae2152))
* **server:** wip server refactor ([ce03728](https://github.com/xjonsson/bitburner-scripts/commit/ce0372826eb06868136355081877dd2d2554c8c6))
* **server:** working version but the calculation is based on roi ([d03cf6d](https://github.com/xjonsson/bitburner-scripts/commit/d03cf6dccb74299906f99b351934f41e1577c607))
* **server:** working version of server and batching ([cb05857](https://github.com/xjonsson/bitburner-scripts/commit/cb05857660caf91042da09aab89f8e581c5711f7))
* **shares:** added basic version to allow sharing ram for faction points ([08e957c](https://github.com/xjonsson/bitburner-scripts/commit/08e957c8eeffaa81257d2c07736db4a9c3a98c9a))
* **ui:** modified startup for consistent ui on load ([3b200fb](https://github.com/xjonsson/bitburner-scripts/commit/3b200fbd0267241f21e44b2cbf59309f5f045c8b))
* **utils:** alias generator, increased targets towards end game, and a few other tweaks ([9b33f89](https://github.com/xjonsson/bitburner-scripts/commit/9b33f897fe96e713efb0c57cdc4578551bf4356c))


### Bug Fixes

* **hwgw:** added case when chance is below 0 but still on target list ([ca80dc6](https://github.com/xjonsson/bitburner-scripts/commit/ca80dc6fc64e77cfa687284d6796686f480c1c9c))
* **os:** added new alias for nuke and door and prevent dual spawn hosting and hacknet ([3f1f36f](https://github.com/xjonsson/bitburner-scripts/commit/3f1f36f0cdeb17e6a744e821f24a3c7a52be87a7))
* **player:** fixed issue when programs are gained out of sequence ([40b50c8](https://github.com/xjonsson/bitburner-scripts/commit/40b50c86e13b95cecd4d942d95b2f1085eba97d6))


* **os:** chaning to new BitBurner version, requires rework ([68e472c](https://github.com/xjonsson/bitburner-scripts/commit/68e472c3d8d1bd03f58fd41c7563f3e8f33e63e2))

### [0.1.5](https://github.com/xjonsson/bitburner-scripts/compare/v0.1.4...v0.1.5) (2023-03-23)


### Features

* **controller:** added batching and focus controller ([1343840](https://github.com/xjonsson/bitburner-scripts/commit/1343840eba49142634102938447d6a757706820c))
* **share:** added share function for work ([23b3ca8](https://github.com/xjonsson/bitburner-scripts/commit/23b3ca8fca4537fc031d6d0a64e1ccfdd64e9e47))
* **shop:** added flow to loop through all purchases ([f330024](https://github.com/xjonsson/bitburner-scripts/commit/f33002489db503cf4ea30894fba2b711dbb078cd)), closes [#2](https://github.com/xjonsson/bitburner-scripts/issues/2)
* **utilities:** added rep calculation for purchase ([1f525e8](https://github.com/xjonsson/bitburner-scripts/commit/1f525e8c7c0f867875dd408d21ae515c4a6513bd))


### Bug Fixes

* **controller:** fixed issue when no challenge on node ([b15bcef](https://github.com/xjonsson/bitburner-scripts/commit/b15bcefb4ea095d060797bc2ec76bce196a0fcfa))
* **controller:** moved scp to reclaim where it should have been ([756e66a](https://github.com/xjonsson/bitburner-scripts/commit/756e66ae8bcbadc1ae91454afa614bf5e9d5f1cd))

### 0.1.4 (2023-03-15)


### Features

* **controller:** added controller, display and adjusted network slightly ([c633736](https://github.com/xjonsson/bitburner-scripts/commit/c6337369958f92d2c12bf45de07032fcafde4934))
* **controller:** added working version of batch controller ([123d0fc](https://github.com/xjonsson/bitburner-scripts/commit/123d0fcd881cf5efbe492068bfd345b87e17ea43))
* **controller:** merging this in so people can use it ([9ac1040](https://github.com/xjonsson/bitburner-scripts/commit/9ac10409dfb27e37c9a46cfd9d5b4aecd48b550c))
* **display:** added ability to show targets and their value ([3f543b1](https://github.com/xjonsson/bitburner-scripts/commit/3f543b17288abffc6937266265bb96e7c0e2b43a))
* **display:** added display for network and statistics ([5b4e9cc](https://github.com/xjonsson/bitburner-scripts/commit/5b4e9ccd45802e12e863c02c2a5e34de1c0886eb))
* **minideploy:** added script for minideploy from home ([13025c9](https://github.com/xjonsson/bitburner-scripts/commit/13025c9652122b3ee763b6e244a6eadbcdd694ba))
* **minimal:** added base for minimal ([28e0414](https://github.com/xjonsson/bitburner-scripts/commit/28e04141c1084fea7afe178a11eca5f7a5180e93))
* **minimal:** added focus target and display ([99f9dbd](https://github.com/xjonsson/bitburner-scripts/commit/99f9dbdf529670e5453a524b868c0fe896e90c94))
* **minimal:** added reclaim function to hack servers ([abab0d9](https://github.com/xjonsson/bitburner-scripts/commit/abab0d939dc400a556a35f08495a3fe57338cbf3))
* **minimal:** added xmin for bot usage and working version of minimal ([9eda81d](https://github.com/xjonsson/bitburner-scripts/commit/9eda81de7db94fd4acf201c19a65fb0dab6ff42b))
* **network:** added networking class to handle servers, bots, and ring ([cd340d2](https://github.com/xjonsson/bitburner-scripts/commit/cd340d2ea0e51144791c0c84c46ff55431c08311))
* **network:** added ring count to networking ([ee77b83](https://github.com/xjonsson/bitburner-scripts/commit/ee77b83b70fb8230e6cfc8e314adb7225d9fea18))
* **player:** added basic helper class to help with player data ([d3521e7](https://github.com/xjonsson/bitburner-scripts/commit/d3521e7a0593776fa5aed2a09559a619b1ec2283))
* **reclaim:** added server and network parts for reclaim stats ([c7fbd77](https://github.com/xjonsson/bitburner-scripts/commit/c7fbd77d5d0363f2ee590f451900c55570177cf6))
* **scripts:** working on distribution and early game scripts ([02e2ebe](https://github.com/xjonsson/bitburner-scripts/commit/02e2ebe806d0e0b76e7b6ca2af3436d0767f566b))
* **server:** added cores to Server class ([e255571](https://github.com/xjonsson/bitburner-scripts/commit/e255571d16f077286766c87b6f21c87611ba690b))
* **server:** added functions for thread counts ([86d1bc0](https://github.com/xjonsson/bitburner-scripts/commit/86d1bc0d0df1e92e31f44ee7051afdb10db91a04))
* **server:** added server class to help with network and calculations ([2bdc215](https://github.com/xjonsson/bitburner-scripts/commit/2bdc2152d94ae611dd392f91b97edfe24023efab))
* **start:** added script to handle start and script selection ([f018c5a](https://github.com/xjonsson/bitburner-scripts/commit/f018c5af89294824a28b2d25d7d3d8bd22e57f76))
* **udoor:** added utility script to backdoor all servers without singularity ([7777549](https://github.com/xjonsson/bitburner-scripts/commit/777754960e5d36062aec902947a88823e9a8ca1b))
* **uroute:** added utility for routing to servers ([2f629d9](https://github.com/xjonsson/bitburner-scripts/commit/2f629d9a198dc8c8a4ba77dcda712c26bdd0fe66))


### Bug Fixes

* **network:** added network ownership function for stats ([4b7607f](https://github.com/xjonsson/bitburner-scripts/commit/4b7607f528b93a31890389b37d7a01abf82779e9))
* **reclaim:** fixed reclaim to work with server nodes ([449e14a](https://github.com/xjonsson/bitburner-scripts/commit/449e14a655657148f17d77f2a70bbeb9baebaa99))
* **server:** removed redundant const from configs ([0af2513](https://github.com/xjonsson/bitburner-scripts/commit/0af25133f2c0f21f6001feb4ca1b372412838564))
