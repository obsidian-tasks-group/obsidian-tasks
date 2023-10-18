---
publish: true
---

# Comments

All query lines beginning with a `#` character are treated as
comments, and will be ignored.

Example:

    ```tasks
    not done
    # Uncomment the following line to enable short mode:
    # short mode
    ```

## Inline comments

> [!released]
> Inline comments were introduced in Tasks 4.7.0.

[Mustache.js](https://www.npmjs.com/package/mustache) comments can also be used within a
line:

    ```tasks
    not done
    short mode {{! This comment will be ignored }}
    ```

Such comments will be removed when Tasks processes [[Placeholders]] in the query.

Any text between the `{{!` and `}}` of a line will be ignored. Multiline comments are
not supported (except perhaps in combination with [[Line Continuations|line continuations]]).
