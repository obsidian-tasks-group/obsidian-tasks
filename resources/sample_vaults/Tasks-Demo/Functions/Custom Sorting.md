# Custom Sorting

This file contains samples for experimenting with `sort by function`.

## Tasks

- [ ] #task **I am in Custom Sorting.md**

## Examples

```tasks
folder includes {{query.file.folder}}

# Put tasks in the same file as the query first.
sort by function task.file.path === query.file.path
```

## Demonstrate Error Handling

### Parsing Errors

This section demonstrate how Tasks handles errors when reading `sort by function` instructions.

#### SyntaxError

```tasks
sort by function task.due.formatAsDate(
```

### Evaluation Errors

This section demonstrate how Tasks handles when evaluating `sort by function` instructions during searches.

#### ReferenceError

```tasks
sort by function hello
```

#### Non-existent task field

```tasks
sort by function task.nonExistentField
```

#### Unsupported sort key type

```tasks
sort by function task.tags
```
