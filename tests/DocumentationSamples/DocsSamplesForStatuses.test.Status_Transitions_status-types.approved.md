<!-- placeholder to force blank line before included text -->

| Operation and status.type | TODO | IN_PROGRESS | ON_HOLD | DONE | CANCELLED | NON_TASK |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Example Task | `- [ ] demo` | `- [/] demo` | `- [h] demo` | `- [x] demo` | `- [-] demo` | `- [~] demo` |
| Matches `not done` | YES | YES | YES | no | no | no |
| Matches `done` | no | no | no | YES | YES | YES |
| Matches `status.type is TODO` | YES | no | no | no | no | no |
| Matches `status.type is IN_PROGRESS` | no | YES | no | no | no | no |
| Matches `status.type is ON_HOLD` | no | no | YES | no | no | no |
| Matches `status.type is DONE` | no | no | no | YES | no | no |
| Matches `status.type is CANCELLED` | no | no | no | no | YES | no |
| Matches `status.type is NON_TASK` | no | no | no | no | no | YES |
| Matches `status.name includes todo` | YES | no | no | no | no | no |
| Matches `status.name includes in progress` | no | YES | no | no | no | no |
| Matches `status.name includes on hold` | no | no | YES | no | no | no |
| Matches `status.name includes done` | no | no | no | YES | no | no |
| Matches `status.name includes cancelled` | no | no | no | no | YES | no |
| Name for `group by status` | Todo | Todo | Todo | Done | Done | Done |
| Name for `group by status.type` | %%2%%TODO | %%1%%IN_PROGRESS | %%3%%ON_HOLD | %%4%%DONE | %%5%%CANCELLED | %%6%%NON_TASK |
| Name for `group by status.name` | Todo | In Progress | On Hold | Done | Cancelled | My custom status |


<!-- placeholder to force blank line after included text -->
