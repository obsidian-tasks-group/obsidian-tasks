<!-- placeholder to force blank line before included text -->


```javascript
filter by function task.listMarker === '-' 
```

- Find tasks in unordered lists whose checkboxes begin `- [`

```javascript
filter by function task.listMarker === '+' 
```

- Find tasks in unordered lists whose checkboxes begin `+ [`

```javascript
filter by function task.listMarker === '*' 
```

- Find tasks in unordered lists whose checkboxes begin `* [`

```javascript
filter by function task.listMarker.endsWith('.')
```

- Find tasks in ordered whose checkboxes begin with a number and "." symbol, such as `2. [`

```javascript
filter by function task.listMarker.endsWith(')')
```

- Find tasks in ordered whose checkboxes begin with a number and ")" symbol, such as `2) [`


<!-- placeholder to force blank line after included text -->
