# Pacific-Auckland

> [!NOTE]
> These instructions assume testing on Mac - hence use of `open` to an Obsidian URL...

## Setting up this manual test

1. Make sure that you have opened the [Tasks-Demo](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo) test vault previously, so that Obsidian knows where that vault is on your computer.
2. Run the following command

    ```bash
    TZ=Pacific/Auckland open 'obsidian://open?vault=Tasks-Demo&file=Manual%20Testing%2FTime%20Zones%2FPacific-Auckland'
    ```

3. View this page in Reading or Live Preview mode
4. Confirm that the headings in the Tasks block are:
    - `Timezone: Pacific/Auckland`
    - `2024-09-28 Saturday`

## Run the test

1. Complete the task in this file.
2. Check that the due date of the new task - and the new heading - is '2024-09-28 Sunday'

## Tasks Plugin Search

```tasks
not done
path includes {{query.file.path}}

group by function 'Timezone: ' + process.env.TZ
group by due

hide backlinks
```

## Test task

- [ ] #task Next due date should be `2024-09-28 Sunday` 🔁 every day 📅 2024-09-28

## Background

- This manual test shows the existence of the bug logged in:
  - [Completing a daily recurring task creates task set to same day [the day before Australian clocks switch to daylight savings]](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2309)
- It was written to test the behaviour of pull request \#3121:
  - [fix: advance recurring tasks correctly at start of Daylight Savings Time](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/3121)
