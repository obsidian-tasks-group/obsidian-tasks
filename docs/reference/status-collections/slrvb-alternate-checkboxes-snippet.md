---
layout: default
title: SlRvb's Alternate Checkboxes
parent: Status Collections
grand_parent: Reference
has_toc: false
---

# SlRvb's Alternate Checkboxes
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

This theme offers the same checkboxes as [ITS Theme]({{ site.baseurl }}{% link reference/status-collections/its-theme.md %}), but will work with other themes too, so is more flexible.

|                       Location | Link                                                                                                                                                                                                    |
| ------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                        GitHub: | <https://github.com/SlRvb/Obsidian--ITS-Theme/blob/main/Guide/Alternate-Checkboxes.md>                                                                                                                  |
|                  Obsidian Hub: | [Alternate Checkboxes](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.05+All+Community+Expansions/CSS+Snippets/Alternate+Checkboxes+(SlRvb))                                              |
| Test note in Tasks-Demo vault: | [Snippet - SlRvb's Alternate Checkboxes](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Styling/Snippet%20-%20SlRvb's%20Alternate%20Checkboxes.md) |

## Screenshot

![Sample tasks show in Reading mode, with the SlRvb's Alternate Checkboxes Snippet](../../../images/snippet-slrvb-alternate-checkboxes.png)

## Supported statuses

<!-- snippet: DocsSamplesForStatuses.test.Theme_ITS Text.approved.txt -->
```txt
- [ ] #task `space` Unchecked
- [x] #task `x` Regular
- [X] #task `X` Checked
- [-] #task `-` Dropped
- [>] #task `>` Forward
- [D] #task `D` Date
- [?] #task `?` Question
- [/] #task `/` Half Done
- [+] #task `+` Add
- [R] #task `R` Research
- [!] #task `!` Important
- [i] #task `i` Idea
- [B] #task `B` Brainstorm
- [P] #task `P` Pro
- [C] #task `C` Con
- [Q] #task `Q` Quote
- [N] #task `N` Note
- [b] #task `b` Bookmark
- [I] #task `I` Information
- [p] #task `p` Paraphrase
- [L] #task `L` Location
- [E] #task `E` Example
- [A] #task `A` Answer
- [r] #task `r` Reward
- [c] #task `c` Choice
- [d] #task `d` Doing
- [T] #task `T` Time
- [@] #task `@` Character / Person
- [t] #task `t` Talk
- [O] #task `O` Outline / Plot
- [~] #task `~` Conflict
- [W] #task `W` World
- [f] #task `f` Clue / Find
- [F] #task `F` Foreshadow
- [H] #task `H` Favorite / Health
- [&] #task `&` Symbolism
- [s] #task `s` Secret
```
<!-- endSnippet -->

## Tasks' one-click addition

Tasks' setting pane has a one-click button to add the following information, representing the custom checkboxes in this plugin.

<!-- placeholder to force blank line before included text --> <!-- include: DocsSamplesForStatuses.test.Theme_ITS Table.approved.md -->

| Status Character | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Next Status Character | Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `space` | Unchecked | `x` | `TODO` | No |
| `x` | Regular | `x` | `DONE` | No |
| `X` | Checked | `x` | `DONE` | Yes |
| `-` | Dropped | `x` | `CANCELLED` | Yes |
| `>` | Forward | `x` | `TODO` | Yes |
| `D` | Date | `x` | `TODO` | Yes |
| `?` | Question | `x` | `TODO` | Yes |
| `/` | Half Done | `x` | `IN_PROGRESS` | Yes |
| `+` | Add | `x` | `TODO` | Yes |
| `R` | Research | `x` | `TODO` | Yes |
| `!` | Important | `x` | `TODO` | Yes |
| `i` | Idea | `x` | `TODO` | Yes |
| `B` | Brainstorm | `x` | `TODO` | Yes |
| `P` | Pro | `x` | `TODO` | Yes |
| `C` | Con | `x` | `TODO` | Yes |
| `Q` | Quote | `x` | `TODO` | Yes |
| `N` | Note | `x` | `TODO` | Yes |
| `b` | Bookmark | `x` | `TODO` | Yes |
| `I` | Information | `x` | `TODO` | Yes |
| `p` | Paraphrase | `x` | `TODO` | Yes |
| `L` | Location | `x` | `TODO` | Yes |
| `E` | Example | `x` | `TODO` | Yes |
| `A` | Answer | `x` | `TODO` | Yes |
| `r` | Reward | `x` | `TODO` | Yes |
| `c` | Choice | `x` | `TODO` | Yes |
| `d` | Doing | `x` | `TODO` | Yes |
| `T` | Time | `x` | `TODO` | Yes |
| `@` | Character / Person | `x` | `TODO` | Yes |
| `t` | Talk | `x` | `TODO` | Yes |
| `O` | Outline / Plot | `x` | `TODO` | Yes |
| `~` | Conflict | `x` | `TODO` | Yes |
| `W` | World | `x` | `TODO` | Yes |
| `f` | Clue / Find | `x` | `TODO` | Yes |
| `F` | Foreshadow | `x` | `TODO` | Yes |
| `H` | Favorite / Health | `x` | `TODO` | Yes |
| `&` | Symbolism | `x` | `TODO` | Yes |
| `s` | Secret | `x` | `TODO` | Yes |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->
