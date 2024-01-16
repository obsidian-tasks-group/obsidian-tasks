# Custom Sorting

This file contains samples for experimenting with 'sort by function'.

## Examples

==TODO==

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
