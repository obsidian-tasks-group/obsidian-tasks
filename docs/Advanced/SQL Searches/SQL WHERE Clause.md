---
publish: true
---

# WHERE Clause

<span class="related-pages">#advanced/sql-search</span>

## Operators in The WHERE Clause

The following basic operators can be used in the `WHERE` clause. More can be found on the [[SQL Operators]] page.

| Operator | Description                                                                 |
| -------- | --------------------------------------------------------------------------- |
| =        | Equal                                                                       |
| >        | Greater than                                                                |
| <        | Less than                                                                   |
| >=       | Greater than or equal                                                       |
| <=       | Less than or equal                                                          |
| <>       | Not equal                                                                   |
| BETWEEN  | Between a certain range                                                     |
| LIKE     | Search for a pattern                                                        |
| IN       | To specify multiple possible values for a column                            |

## The SQL AND, OR and NOT Operators

The `WHERE` clause can be combined with `AND`, `OR`, and `NOT` operators.

The `AND` and `OR` operators are used to filter records based on more than one condition:

- The `AND` operator displays a record if all the conditions separated by `AND` are TRUE.
- The `OR` operator displays a record if any of the conditions separated by `OR` is TRUE.

The `NOT` operator displays a record if the condition(s) is NOT TRUE.

You can also combine the `AND`, `OR` and `NOT` operators.

The following SQL statement selects all tasks where priority is "2" AND indicator must be "!" OR "?" (use parenthesis to form complex expressions)

````text
```tasks-sql
WHERE priority = '2' AND (status->symbol='!' OR status->symbol='?')
```
````

## The LIKE Operator

The `LIKE` operator is used in a `WHERE` clause to search for a specified pattern, it is a simpler approach than using a Regular Expression.

There are two wild cards you can use.

- The percent sign (%) represents zero, one, or multiple characters
- The underscore sign (_) represents one, single character

These can also be combined. For example the following query will return all tasks where the notes they are on have anything followed by `/2023/2023-0` then a single character followed by `/` then by anything. This would match the following example folders:

"1 Journal/2023/2023-04/2023-04-17.md"
"General Notes/2023/2023-04/my cool idea.md"
"Reference/school/2023/2023-04/lecture one.md"

````text
```tasks-sql
WHERE path LIKE '%/2023/2023-0_/%'
```
````

Any column that is of type `string` can be queried using the `LIKE` operator.
