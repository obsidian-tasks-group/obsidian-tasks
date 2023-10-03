---
publish: true
---

# SlRvb's Alternate Checkboxes

## Introduction

This theme offers the same checkboxes as [[ITS Theme]], but will work with other themes too, so is more flexible.

|                       Location | Link                                                                                                                                                                                                    |
| ------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                        GitHub: | <https://github.com/SlRvb/Obsidian--ITS-Theme/blob/main/Guide/Alternate-Checkboxes.md>                                                                                                                  |
|                  Obsidian Hub: | [Alternate Checkboxes](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.05+All+Community+Expansions/CSS+Snippets/Alternate+Checkboxes+(SlRvb))                                              |
| Test note in Tasks-Demo vault: | [Snippet - SlRvb's Alternate Checkboxes](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Styling/Snippet%20-%20SlRvb's%20Alternate%20Checkboxes.md) |

## Screenshot

![Sample tasks show in Reading mode, with the SlRvb's Alternate Checkboxes Snippet](../../../images/snippet-slrvb-alternate-checkboxes.png)

## Supported statuses

<!-- snippet: DocsSamplesForStatuses.test.Theme_ITS_Text.approved.txt -->
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

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_ITS_Table.approved.md -->

| Status Symbol | Next Status Symbol | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `space` | `x` | Unchecked | `TODO` | No |
| `x` | `space` | Regular | `DONE` | No |
| `X` | `space` | Checked | `DONE` | Yes |
| `-` | `space` | Dropped | `CANCELLED` | Yes |
| `>` | `x` | Forward | `TODO` | Yes |
| `D` | `x` | Date | `TODO` | Yes |
| `?` | `x` | Question | `TODO` | Yes |
| `/` | `x` | Half Done | `IN_PROGRESS` | Yes |
| `+` | `x` | Add | `TODO` | Yes |
| `R` | `x` | Research | `TODO` | Yes |
| `!` | `x` | Important | `TODO` | Yes |
| `i` | `x` | Idea | `TODO` | Yes |
| `B` | `x` | Brainstorm | `TODO` | Yes |
| `P` | `x` | Pro | `TODO` | Yes |
| `C` | `x` | Con | `TODO` | Yes |
| `Q` | `x` | Quote | `TODO` | Yes |
| `N` | `x` | Note | `TODO` | Yes |
| `b` | `x` | Bookmark | `TODO` | Yes |
| `I` | `x` | Information | `TODO` | Yes |
| `p` | `x` | Paraphrase | `TODO` | Yes |
| `L` | `x` | Location | `TODO` | Yes |
| `E` | `x` | Example | `TODO` | Yes |
| `A` | `x` | Answer | `TODO` | Yes |
| `r` | `x` | Reward | `TODO` | Yes |
| `c` | `x` | Choice | `TODO` | Yes |
| `d` | `x` | Doing | `IN_PROGRESS` | Yes |
| `T` | `x` | Time | `TODO` | Yes |
| `@` | `x` | Character / Person | `TODO` | Yes |
| `t` | `x` | Talk | `TODO` | Yes |
| `O` | `x` | Outline / Plot | `TODO` | Yes |
| `~` | `x` | Conflict | `TODO` | Yes |
| `W` | `x` | World | `TODO` | Yes |
| `f` | `x` | Clue / Find | `TODO` | Yes |
| `F` | `x` | Foreshadow | `TODO` | Yes |
| `H` | `x` | Favorite / Health | `TODO` | Yes |
| `&` | `x` | Symbolism | `TODO` | Yes |
| `s` | `x` | Secret | `TODO` | Yes |

<!-- placeholder to force blank line after included text --><!-- endInclude -->
