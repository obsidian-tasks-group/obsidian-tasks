---
publish: true
---

# Expressions

<span class="related-pages">#feature/scripting</span>

> [!released]
> Expressions were introduced in Tasks 4.0.0.

## Introduction

> [!Note]
> Writing a full explanation of the JavaScript language is outside the scope of this documentation.
>
> We provide some introductory material and some well-thought-out examples to give you ideas, and encourage you to experiment and try the feature out for yourself.

## What are Expressions?

- Language is JavaScript.
- The expression is a string instruction.
- Depending on the context, one or two tasks are passed in to the expression, and a calculation is performed.
  - As of Tasks 4.0.0, in fact only a single task is passed in, to implement [[Custom Grouping]].
- Tasks then calculates a value from the inputs.

## Example expressions

The real value of expressions is to calculate values from data in tasks.

In this section, we use artificially simple fixed expressions, to demonstrate the kinds of abilities available.

Each line below is of the form:

~~~text
expression => result
~~~

Sample expressions:

<!-- placeholder to force blank line before included text --> <!-- include: Expression.test.Expression_result.approved.md -->

~~~text
'hello' => 'hello'
"hello" => 'hello'
"" => ''
[] => []
"" || "No value" => 'No value'
false => false
true => true
1 => 1
0 => 0
0 || "No value" => 'No value'
1.0765456 => 1.0765456
6 * 7 => 42
["heading1", "heading2"] => ['heading1', 'heading2']
[1, 2] => [1, 2]
null => null
null || "No value" => 'No value'
undefined => undefined
undefined || "No value" => 'No value'
"I _am_ not _italic_".replaceAll("_", "\\_") => 'I \_am\_ not \_italic\_'
~~~

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

Note:

- Single quotes (`'`) and double quotes (`"`) are generally equivalent and you can use whichever you prefer.
- The `||` means 'or'. If the expression to the left of the `||` fails, the expression on the right is used instead.
- You can experiment with these values by adding them to a `group by function` line in a Tasks query block.
