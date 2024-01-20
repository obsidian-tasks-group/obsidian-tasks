# SlrVb's Alternative Checkboxes

## Background

This page demonstrates SlRvb's [Alternate-Checkboxes](https://github.com/SlRvb/Obsidian--ITS-Theme/blob/main/Guide/Alternate-Checkboxes.md) from the [ITS-Theme.](https://github.com/SlRvb/Obsidian--ITS-Theme), with the Tasks plugin installed.

It was created to test the fix for [Tasks Issue #520: In combination with SlrVb's S-Checkbox CSS, Task Plugin breaks that style](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/520).

## How to use this file

### Setup

1. Go to Settings > Appearance > **Enable the 'S - Checkboxes' snippet**
2. Optionally, install and enable the [Style Settings](obsidian://show-plugin?id=obsidian-style-settings) plugin.

### Use

The tasks below should look like one of the images in the [Alternate Checkboxes documentation](https://github.com/SlRvb/Obsidian--ITS-Theme/blob/main/Guide/Alternate-Checkboxes.md), depending on your display settings.

## One of each task status

- These are grouped by whether Tasks sees them as Done or Todo.
- Their appearance can be modified by going to the options for the Style Settings plugin.

Available task states, as of version `7cb837d73d3f39e056d0be8c98539577529c0f90` of SlRvb's Checkboxes snippet:

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForStatuses.test.Theme_ITS_Tasks.approved.md -->

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

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Rendered in Tasks results block

```tasks
# We need to ignore the global query, as it ignores this file:
ignore global query

path includes {{query.file.path}}
group by filename
short mode
group by status
sort by description
```
