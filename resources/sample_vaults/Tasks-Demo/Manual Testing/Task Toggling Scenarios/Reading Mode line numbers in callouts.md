# Reading Mode line numbers in callouts

## Instructions

**Given** a file is open in both two panes:

- an editing mode (Source or Live Preview)
- Reading mode

**When** I view the tasks in Reading mode with debug enabled

**Then** I see that the callout seems to start a new section line, but the backlinks show the actual ordinary heading name.

## Section 1

Some random tasks

- [ ] #task Section 1: Task 1
- [ ] #task Section 1: Task 2

> [!NOTE] Title of callout
>
> - [ ] #task Section 1: Task 3 - in callout
> - [ ] #task Section 1: Task 4 - in callout

## Query results

```tasks
path includes Reading Mode line numbers in callouts
sort by description
```
