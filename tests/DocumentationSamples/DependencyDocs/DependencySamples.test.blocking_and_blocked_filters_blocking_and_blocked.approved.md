<!-- placeholder to force blank line before included text -->

| Task | `is blocking` | `is blocked` |
| ----- | ----- | ----- |
| `- [ ] No dependency - TODO` | ❌ false | ❌ false |
| `- [x] No dependency - DONE` | ❌ false | ❌ false |
| `- [ ] scenario 1 - TODO depends on TODO 🆔 scenario1` | ✅ true | ❌ false |
| `- [ ] scenario 1 - TODO depends on TODO ⛔ scenario1` | ❌ false | ✅ true |
| `- [x] scenario 2 - TODO depends on DONE 🆔 scenario2` | ❌ false | ❌ false |
| `- [ ] scenario 2 - TODO depends on DONE ⛔ scenario2` | ❌ false | ❌ false |
| `- [ ] scenario 3 - DONE depends on TODO 🆔 scenario3` | ❌ false | ❌ false |
| `- [x] scenario 3 - DONE depends on TODO ⛔ scenario3` | ❌ false | ❌ false |
| `- [x] scenario 4 - DONE depends on DONE 🆔 scenario4` | ❌ false | ❌ false |
| `- [x] scenario 4 - DONE depends on DONE ⛔ scenario4` | ❌ false | ❌ false |
| `- [ ] scenario 5 - TODO depends on non-existing ID ⛔ nosuchid` | ❌ false | ❌ false |
| `- [ ] scenario 6 - TODO depends on self 🆔 self ⛔ self` | ✅ true | ✅ true |
| `- [x] scenario 7 - task with duplicated id - this is DONE                                  - 🆔 scenario7` | ❌ false | ❌ false |
| `- [ ] scenario 7 - task with duplicated id - this is TODO - and is blocking                - 🆔 scenario7` | ✅ true | ❌ false |
| `- [ ] scenario 7 - TODO depends on id that is duplicated - ensure all tasks are checked    - ⛔ scenario7` | ❌ false | ✅ true |
| `- [ ] scenario 8 - mutually dependant 🆔 scenario8a ⛔ scenario8b` | ✅ true | ✅ true |
| `- [ ] scenario 8 - mutually dependant 🆔 scenario8b ⛔ scenario8a` | ✅ true | ✅ true |
| `- [ ] scenario 9 - cyclic dependency 🆔 scenario9a ⛔ scenario9c` | ✅ true | ✅ true |
| `- [ ] scenario 9 - cyclic dependency 🆔 scenario9b ⛔ scenario9a` | ✅ true | ✅ true |
| `- [ ] scenario 9 - cyclic dependency 🆔 scenario9c ⛔ scenario9b` | ✅ true | ✅ true |
| `- [ ] scenario 10 - multiple dependencies TODO         - 🆔 scenario10a` | ✅ true | ❌ false |
| `- [/] scenario 10 - multiple dependencies IN_PROGRESS  - 🆔 scenario10b` | ✅ true | ❌ false |
| `- [x] scenario 10 - multiple dependencies DONE         - 🆔 scenario10c` | ❌ false | ❌ false |
| `- [-] scenario 10 - multiple dependencies CANCELLED    - 🆔 scenario10d` | ❌ false | ❌ false |
| `- [Q] scenario 10 - multiple dependencies NON_TASK     - 🆔 scenario10e` | ❌ false | ❌ false |
| `- [ ] scenario 10 - multiple dependencies              - ⛔ scenario10a,scenario10b,scenario10c,scenario10d,scenario10e` | ❌ false | ✅ true |
| `- [ ] scenario 11 - indirect dependency - indirect blocking of scenario11c ignored - 🆔 scenario11a` | ❌ false | ❌ false |
| `- [x] scenario 11 - indirect dependency - DONE                                     - 🆔 scenario11b ⛔ scenario11a` | ❌ false | ❌ false |
| `- [ ] scenario 11 - indirect dependency - indirect blocking of scenario11a ignored - 🆔 scenario11c ⛔ scenario11b` | ❌ false | ❌ false |


<!-- placeholder to force blank line after included text -->
