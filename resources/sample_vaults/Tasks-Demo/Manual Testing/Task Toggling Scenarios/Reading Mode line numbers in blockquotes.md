# Reading Mode line numbers in blockquote

## Instructions

**Given** a file **with tasks in a blockquote** is open in both two panes:

- an editing mode (Source or Live Preview)
- Reading mode

**When** I view the tasks in Reading mode with debug enabled

**Then** I see that the blockquote seems to start a new section line, but the backlinks show the actual ordinary heading name.

## Section 1

Some random tasks

- [ ] #task Section 1: Task 1
- [ ] #task Section 1: Task 2

> - [ ] #task Section 1: Task 3 - in blockquote
> - [ ] #task Section 1: Task 4 - in blockquote

## Query results

```tasks
path includes Reading Mode line numbers in blockquotes
sort by description
```
