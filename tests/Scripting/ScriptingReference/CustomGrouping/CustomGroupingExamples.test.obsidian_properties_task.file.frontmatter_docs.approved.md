<!-- placeholder to force blank line before included text -->


```javascript
group by function task.file.property('creation date') ?? 'no creation date'
```

- group tasks by 'creation date' date property.

```javascript
group by function task.file.property('creation date') ? window.moment(task.file.property('creation date')).format('MMMM') : 'no month'
```

- group tasks by month in 'creation date' date property.


<!-- placeholder to force blank line after included text -->
