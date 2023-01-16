<!-- placeholder to force blank line before table -->

| Operation | TODO | IN_PROGRESS | DONE | CANCELLED | NON_TASK |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Example Task | `- [ ] demo` | `- [/] demo` | `- [x] demo` | `- [-] demo` | `- [~] demo` |
| Matches `done` | no | no | YES | YES | no |
| Matches `not done` | YES | YES | no | no | no |
| Matches `status.name includes todo` | YES | no | no | no | no |
| Matches `status.name includes in progress` | no | YES | no | no | no |
| Matches `status.name includes done` | no | no | YES | no | no |
| Matches `status.name includes cancelled` | no | no | no | YES | no |
| Name for `group by status` | Todo | Done | Done | Done | Done |


<!-- placeholder to force blank line after table -->
