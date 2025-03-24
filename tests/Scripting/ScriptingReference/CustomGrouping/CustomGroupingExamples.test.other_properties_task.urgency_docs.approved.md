<!-- placeholder to force blank line before included text -->


```javascript
group by function task.urgency.toFixed(3)
```

- Show the urgency to 3 decimal places, unlike the built-in "group by urgency" which uses 2.

```javascript
group by function task.urgency
```

- Show non-integer urgency values to 5 decimal places, and integer ones to 0 decimal places.
- Sorting of groups by name has been found to be unreliable with varying numbers of decimal places.
- So to ensure consistent sorting, Tasks will round non-integer numbers to a fixed 5 decimal places, returning the value as a string.
- This still sorts consistently even when some of the group's values are integers.


<!-- placeholder to force blank line after included text -->
