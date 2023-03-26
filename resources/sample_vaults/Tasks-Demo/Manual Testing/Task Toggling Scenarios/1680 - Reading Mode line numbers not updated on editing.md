# 1680 - Reading Mode line numbers not updated on editing

## Instructions

> [!Tip] Goal
> **Given** a file is open in both two panes:
>
> - an editing mode (Source or Live Preview)
> - Reading mode
>
> **When** I add or remove lines from the file
>
> **Then** rendered tasks in the Reading pane should be updated, so that when I toggle them, the correct line is toggled.

## Testing steps

> [!Todo] Testing Steps
>
> - 1 **Setup**
>   - Open this file in Source View
>   - Open it in a second pane, in Reading View
> - 2 **Add some white space before the tasks**
>   - After the line containing `In step 2`, enter 5 blank lines
> - 3 **Toggle a task in each section, in the Reading View pane**
>   - Toggle `Section 1/Task 1` to Done then to TODO
>   - Toggle `Section 2/Task 2` to Done then to TODO
> - 4 **Quickly delete the blank lines then toggle `Section 2/Task 1`**
>   - Select the 5 added lines
>   - Move the cursor next to the checkbox of `Section 2/Task 1`
>   - Hit the delete key to delete the blank lines
>   - **As quickly as possible** (and in under 2 seconds) **toggle `Section 2/Task 1`**
>   - **As quickly as possible** (and in under 2 seconds) **toggle `Section 2/Task 2`**

### Expected result

> [!Success]
>
> - `Section 2/Task 1` is marked as Done
> - `Section 2/Task 2` is marked as Done

---

## Test Data

### Tasks Section 1

In step 2, Insert 5 blank lines after this line.

Some random tasks:

- [ ] #task Section 1/Task 1
- [ ] #task Section 1/Task 2

### Tasks Section 2

Some more random tasks:

- [ ] #task Section 2/Task 1
- [ ] #task Section 2/Task 2

---

## Log of actual results - newest first

Actual result in Tasks 1.26.0

> [!Success]
>
> - `Section 2/Task 1` is marked as Done
> - `Section 2/Task 2` is marked as Done

Note that:

> [!Info]
> Tasks may write out a harmless message:
>
> > "Manual Testing/Task Toggling Scenarios/1680 - Reading Mode line numbers not updated on editing.md" has been modified externally, merging changes automatically.

### Actual result in `5649417`, PR #1702, 2023-02-27

<https://github.com/obsidian-tasks-group/obsidian-tasks/commit/5649417006a5ccf80cdaaaeb2bc404db5c6f6a86>

> [!Bug]
>
> - Two console error messages:
>
> ```text
> plugin:obsidian-tasks-plugin:17532 Tasks: could not find task to toggle in the file.
> plugin:obsidian-tasks-plugin:17532 Tasks: could not find task to toggle in the file.```
> ```

### Actual result in Tasks 1.25.0

> [!Bug]
>
> - **Step 3**
>   - Sometimes the task line that was toggled is copied over an earlier task line in the file, losing that original line
> - **Step 4**
>   - `Section 2/Task 1` is marked as Done
>   - Toggling `Section 2/Task 1`:
>     - sometimes works, but Obsidian shows a notice about the file being modified externally, and changes are being merged
>     - sometimes fails, giving console message:
>
> ```text
> Tasks: could not find task to toggle in the file.
> ```
