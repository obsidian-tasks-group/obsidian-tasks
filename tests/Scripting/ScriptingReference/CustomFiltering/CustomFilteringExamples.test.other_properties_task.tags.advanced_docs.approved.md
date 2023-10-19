<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.tags.find( (tag) => tag.includes('/') ) && true || false
```

- Find all tasks that have at least one nested tag.

```javascript
filter by function task.tags.find( (tag) => tag.split('/').length >= 3 ) && true || false
```

- Find all tasks that have at least one doubly-nested tag, such as `#context/home/ground-floor`.
- This splits each tag at the `/` character, and counts as a match if there are at least 3 words.


<!-- placeholder to force blank line after included text -->
