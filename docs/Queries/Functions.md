---
publish: true
---

# Functions

<span class="related-pages">#feature/scripting</span>

## Function instructions

> [!released]
> Function instructions were introduced in Tasks X.Y.Z.

When you want to express a search for your Tasks, and the existing [[Filters]] do not satisdy your requirements, you can use function instructions for more control.

Tasks code blocks allow certain instructions to be written as JavaScript expressions, to give great customisability.

This page shows the available function instructions, and the reference page [[Task Properties]] shows the data types available to you, for use in your function instructions.

### filter by function

Coming soon.

<!--
```text
group by function task.status.symbol === '/'
```
-->

### sort by function

Coming soon.

### group by function

#### grouping examples

```text
group by function task.priority
group by function task.status.nextStatusSymbol.replace(" ", "space")
group by function task.status.symbol.replace(" ", "space")
```

<!--
Using task.path, so not yet reading for public visibility:
```text
group by function task.path.replace("some/prefix/", "")
group by function reverse task.path.startsWith("journal/") ? "journal/" : task.path
group by function task.path.startsWith("journal/") ? "journal/" : task.path
```
-->

---

## Available Properties

The Reference section has a complete list of available [[Task Properties]].

---

## Troubleshooting

> [!Warning]
> Currently most types of error in function expressions are only evaluated when the search runs.
>
> This means that error messages are displayed in the group headings, when results are viewed.

### Syntax error

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

### Group names must be strings

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
