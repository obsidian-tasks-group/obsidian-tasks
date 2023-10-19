<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.urgency > 8.9999
```

- Find tasks with an urgency score above `9.0`.
- Note that limiting value used is `8.9999`.
- Searches that compare two urgency values for 'less than' or 'more than' (using one of `>`, `>=`, `<` or `<=`) **must adjust their values slightly to allow for rounding**.

```javascript
filter by function task.urgency > 7.9999 && task.urgency < 11.0001
```

- Find tasks with an urgency score between `8.0` and `11.0`, inclusive.

```javascript
filter by function task.urgency.toFixed(2) === 1.95.toFixed(2)
```

- Find tasks with the [[Urgency#Why do all my tasks have urgency score 1.95?|default urgency]] of `1.95`.
- This is the correct way to do an equality or inequality search for any numeric values.
- The `.toFixed(2)` on both sides of the `===` ensures that two numbers being compared are both rounded to the same number of decimal places (2).
- This is important, to prevent being tripped up `10.29` being not exactly the same when comparing non-integer numbers.

```javascript
filter by function task.urgency.toFixed(2) !== 1.95.toFixed(2)
```

- Find tasks with any urgency other than the default score of `1.95`.

```javascript
filter by function task.urgency === 10.29
```

- **This will not find any tasks**.
- ==Do not use raw numbers in searches for equality or inequality of any numbers==, either seemingly integer or floating point ones.
- From using `group by urgency` and reviewing the headings, we might conclude that tasks with the following values have urgency `10.19`:
    - due tomorrow,
    - have no priority symbol.
- From this, it might be natural to presume that we can search for `task.urgency === 10.29`.
- However, our function is checking the following values for equality:
    - `task.urgency` is approximately:
        - `10.292857142857140928526860079728`
    - `10.29` is approximately:
        - `10.289999999999999147348717087880`
- These values are **not exactly equal**, so the test fails to find any matching tasks.


<!-- placeholder to force blank line after included text -->
