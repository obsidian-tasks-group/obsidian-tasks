---
publish: true
---

# Line Continuations
> [!released]
> Introduced in Tasks X.Y.Z.

Long queries can be organized across multiple lines using a trailing backslash:

    ```tasks
    (priority is highest) OR \
    (priority is lowest)
    ```

This can be helpful for long [[Combining Filters|combined filters]],  [[Custom
Filters|custom filters]], and other queries that may be difficult to read on one line.

In the rare case that a trailing backslash is needed for a query, the trailing backslash
may be escaped by doubling it:

    ```tasks
    # Searches for a single backslash
    description includes \\
    ```
