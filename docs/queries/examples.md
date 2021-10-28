---
layout: default
title: Examples
nav_order: 4
parent: Queries
has_toc: false
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
    due after yesterday
    due before in two weeks
    ```

---

All done tasks that are anywhere in the vault under a `tasks` heading (e.g. `## Tasks`):

    ```tasks
    done
    heading includes tasks
    ```

---

Show all tasks that aren't done, are due on the 9th of April 2021, and where the path includes `GitHub`:

    ```tasks
    not done
    due on 2021-04-09
    path includes GitHub
    ````

---

Show all open tasks that are due within two weeks and hide the due date and edit button:

    ```tasks
    not done
    due after 2021-04-30
    due before 2021-05-15
    hide due date
    hide edit button
    ```

---

Show all tasks that were done before the 1st of December 2020:

    ```tasks
    done before 2020-12-01
    ```

---

Show one task that is due on the 5th of May and includes `#prio1` in its description:

    ```tasks
    not done
    due on 2021-05-05
    description includes #prio1
    limit to 1 tasks
    ````
