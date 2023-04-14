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
| <>       | Not equal. Note: In some versions of SQL this operator may be written as != |
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
