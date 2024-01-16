# Custom Sorting

This file contains samples for experimenting with 'sort by function'.

## Tasks

- [ ] #task **I am in Custom Sorting.md**

## Examples

```tasks
folder includes {{query.file.folder}}

# Put tasks in the same file as the query first.
# Important:
#     It's a bit counter-intuitive:
#     False sort keys sort first, so we reverse the result, to get the desired results.
sort by function reverse task.file.path === query.file.path
```

## Error Handling

Demonstrate how errors are handled.

### Parsing Errors

Errors when reading 'sort by function' instructions.

#### SyntaxError

```tasks
sort by function task.due.formatAsDate(
```

### Evaluation Errors

Errors when evaluating 'sort by function' instructions during searches.

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
