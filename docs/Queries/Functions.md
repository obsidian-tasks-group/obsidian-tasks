---
publish: true
---

# Functions

## Function instructions

> [!released]
> Function instructions were introduced in Tasks X.Y.Z.

Tasks code blocks allow certain instructions to be written as JavaScript expressions, to give great customisability.

## group by function

### Examples - grouping

### Problems and error-handling - grouping

> [!Warning]
> Currently most types of error in function expressions are only evaluated when the search runs.
>
> This means that error messages are displayed in the group headings, when results are viewed.

#### Syntax error

The following example gives an error:

````text
```tasks
group by function hello
```
````

gives this heading name:

```text
#### Error: Failed calculating expression "hello". The error message was: hello is not defined
```

#### Group names must be strings

Expressions for `group by function` must currently return a single `string` value.

The following example returns a `boolean`:

````text
```tasks
group by function task.status.symbol === '/'
```
````

gives this heading name:

```text
#### Error: Incorrect type from expression "task.status.symbol === '/'" returned value "false" of type "boolean" which is not a "string"
```

## Reference

### Values for Task Statuses

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_status.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `task.status.name` | `string` | `'Todo'` |
| `task.status.type` | `string` | `'TODO'` |
| `task.status.symbol` | `string` | `' '` |
| `task.status.nextStatusSymbol` | `string` | `'x'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

---

### Values for Dates in Tasks

None supported yet.

---

### Values for Other Task Properties

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_other_fields.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `task.description` | `string` | `'Do exercises #todo #health'` |
| `task.priority` | `string` | `'2'` |
| `task.urgency` | `number` | `3.3000000000000007` |
| `task.tags` | `object` | `#todo,#health` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

---

### Values for File Properties

TODO Maybe use `heading` instead? Try to make field names consistent with existing filter names

<!-- placeholder to force blank line before included text --> <!-- include: FunctionFieldReference.test.task_file_properties.approved.md -->

| Field | Type | Example |
| ----- | ----- | ----- |
| `task.precedingHeader` | `string` | `'My Header'` |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->
