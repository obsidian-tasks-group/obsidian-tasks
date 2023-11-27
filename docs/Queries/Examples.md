---
publish: true
---

# Examples

All open tasks that are due today:

    ```tasks
    not done
    due today
    ```

---

All open tasks that are due within the next two weeks, but are not overdue (due today or later):

    ```tasks
    not done
    due AFTER yesterday
    due BEFORE in two weeks
    ```

Most query instructions can include [[About Queries#Capitals in Query Instructions - Case Insensitivity|capital letters]], which are used here for emphasis.

---

All open tasks that are due within the next two weeks, and either have the `#inbox` tag, or are in an Inbox note:

    ```tasks
    not done
    (due after yesterday) AND (due before in two weeks)
    (tags include #inbox) OR (path includes Inbox)
    ```

(The `AND` and `OR` must be in capitals.)

---

All open tasks due during the next calendar month but not scheduled:

    ```tasks
    not done
    due next month
    no scheduled date
    ```

---

All done tasks that are anywhere in the vault under a `tasks` heading (e.g. `## Tasks`):

    ```tasks
    done
    heading includes tasks
    ```

---

All tasks done this calendar month but that were due or scheduled on the month before:

    ```tasks
    (due last month) OR (scheduled last month)
    done this month
    ```

---

Show all tasks that aren't done, are due on the 9th of April 2021, and where the path includes `GitHub`:

    ```tasks
    not done
    due on 2021-04-09
    path includes GitHub
    ```

---

Show all open tasks that are due in a two week range inclusively, hide the due date and edit button:

    ```tasks
    not done
    due 2021-05-01 2021-05-14
    hide due date
    hide edit button
    ```

---

Show all tasks that were done before the 1st of December 2020:

    ```tasks
    done before 2020-12-01
    ```

---

Show all tasks scheduled for this quarter and that have a tag:

    ```tasks
    scheduled this quarter
    has tags
    ```

---

Show one task that is due on the 5th of May and includes `#prio1` in its description:

    ```tasks
    not done
    due on 2021-05-05
    description includes #prio1
    limit to 1 tasks
    ```

---

All open tasks that are due today or earlier, sorted by due date, then grouped together by the folder containing the task:

    ```tasks
    not done
    due before tomorrow
    sort by due
    group by folder
    ```

---

All open tasks that begin with a time stamp in `HH:mm` format, followed by any white space character:

    ```tasks
    not done
    description regex matches /^[012][0-9]:[0-5][0-9]\s/
    ```
