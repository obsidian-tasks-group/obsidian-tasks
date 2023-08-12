---
publish: true
---

# Ebullientworks Theme

## Introduction

|                       Location | Link                                                                                                                                                                |
| ------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                        GitHub: | <https://github.com/ebullient/obsidian-theme-ebullientworks>                                                                                                        |
|                  Obsidian Hub: | [Ebullientworks Theme](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.05+All+Community+Expansions/Themes/Ebullientworks)                              |
| Test note in Tasks-Demo vault: | [Theme - Ebullientworks](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Styling/Theme%20-%20Ebullientworks.md) |

## Screenshot

![Sample tasks show in Reading mode, with the Ebullientworks Theme](../../../images/theme-ebullientworks-reading-view.png)

## Supported statuses

<!-- snippet: DocsSamplesForStatuses.test.Theme_Ebullientworks_Text.approved.txt -->
```txt
- [ ] #task `space` Unchecked
- [x] #task `x` Checked
- [-] #task `-` Cancelled
- [/] #task `/` In Progress
- [>] #task `>` Deferred
- [!] #task `!` Important
- [?] #task `?` Question
- [r] #task `r` Review
```
<!-- endSnippet -->

## Tasks' one-click addition

Tasks' setting pane has a one-click button to add the following information, representing the custom checkboxes in this plugin.

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_Ebullientworks_Table.approved.md -->

| Status Symbol | Next Status Symbol | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `space` | `x` | Unchecked | `TODO` | No |
| `x` | `space` | Checked | `DONE` | No |
| `-` | `space` | Cancelled | `CANCELLED` | Yes |
| `/` | `x` | In Progress | `IN_PROGRESS` | Yes |
| `>` | `x` | Deferred | `TODO` | Yes |
| `!` | `x` | Important | `TODO` | Yes |
| `?` | `x` | Question | `TODO` | Yes |
| `r` | `x` | Review | `TODO` | Yes |

<!-- placeholder to force blank line after included text --><!-- endInclude -->
