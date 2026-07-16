# Nested Backlinks

## Sample Tasks

- [ ] #task parent task
    - [ ] #task child task 1
        - [ ] #task grandchild 1
    - [ ] #task child task 2
- [ ] #task sibling

## Sample Searches

### Tree with all backlinks (default)

Every task shows its backlink, so nested tasks repeat the filename of their parent: expect a backlink on all 5 tasks.

```tasks
path includes Manual Testing/Nested Backlinks
show tree
show nested backlink
```

### Tree with nested backlinks hidden

Expect a backlink only on the 2 top-level tasks (`parent task` and `sibling`), and no backlink on the nested tasks.

```tasks
path includes Manual Testing/Nested Backlinks
show tree
hide nested backlink
```

### Flat layout - `hide nested backlink` is a no-op

Without `show tree` there are no nested tasks: expect a backlink on all 5 tasks.

```tasks
path includes Manual Testing/Nested Backlinks
hide nested backlink
```

### `hide backlink` takes precedence

Expect no backlinks at all, even though the query contains `show nested backlink`.

```tasks
path includes Manual Testing/Nested Backlinks
show tree
hide backlink
show nested backlink
```
