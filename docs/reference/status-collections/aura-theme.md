---
layout: default
title: Aura Theme (Dark mode only)
parent: Status Collections
grand_parent: Reference
has_toc: false
---

# Aura Theme (Dark mode only)
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Introduction

|                       Location | Link                                                                                                                                                          |
| ------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                        GitHub: | <https://github.com/ashwinjadhav818/obsidian-aura>                                                                                                            |
|                  Obsidian Hub: | [Aura Theme](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.05+All+Community+Expansions/Themes/Aura)                                            |
| Test note in Tasks-Demo vault: | [Theme - Aura Theme](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Styling/Theme%20-%20Aura%20Theme.md) |
|                         Notes: | **Dark mode only**                                                                                                                                            |

## Screenshot

![Sample tasks show in Reading mode, with the Aura Theme](../../../images/theme-aura-reading-view.png)

## Supported statuses

<!-- snippet: DocsSamplesForStatuses.test.Theme_Aura Text.approved.txt -->
```txt
- [ ] #task `space` incomplete
- [x] #task `x` complete / done
- [-] #task `-` cancelled
- [>] #task `>` deferred
- [/] #task `/` in progress, or half-done
- [!] #task `!` Important
- [?] #task `?` question
- [R] #task `R` review
- [+] #task `+` Inbox / task that should be processed later
- [b] #task `b` bookmark
- [B] #task `B` brainstorm
- [D] #task `D` deferred or scheduled
- [I] #task `I` Info
- [i] #task `i` idea
- [N] #task `N` note
- [Q] #task `Q` quote
- [W] #task `W` win / success / reward
- [P] #task `P` pro
- [C] #task `C` con
```
<!-- endSnippet -->

## Tasks' one-click addition

Tasks' setting pane has a one-click button to add the following information, representing the custom checkboxes in this plugin.

<!-- placeholder to force blank line before included text --> <!-- include: DocsSamplesForStatuses.test.Theme_Aura Table.approved.md -->

| Status Symbol | Next Status Symbol | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `space` | `x` | incomplete | `TODO` | No |
| `x` | `space` | complete / done | `DONE` | No |
| `-` | `x` | cancelled | `CANCELLED` | Yes |
| `>` | `x` | deferred | `TODO` | Yes |
| `/` | `x` | in progress, or half-done | `IN_PROGRESS` | Yes |
| `!` | `x` | Important | `TODO` | Yes |
| `?` | `x` | question | `TODO` | Yes |
| `R` | `x` | review | `TODO` | Yes |
| `+` | `x` | Inbox / task that should be processed later | `TODO` | Yes |
| `b` | `x` | bookmark | `TODO` | Yes |
| `B` | `x` | brainstorm | `TODO` | Yes |
| `D` | `x` | deferred or scheduled | `TODO` | Yes |
| `I` | `x` | Info | `TODO` | Yes |
| `i` | `x` | idea | `TODO` | Yes |
| `N` | `x` | note | `TODO` | Yes |
| `Q` | `x` | quote | `TODO` | Yes |
| `W` | `x` | win / success / reward | `TODO` | Yes |
| `P` | `x` | pro | `TODO` | Yes |
| `C` | `x` | con | `TODO` | Yes |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->
