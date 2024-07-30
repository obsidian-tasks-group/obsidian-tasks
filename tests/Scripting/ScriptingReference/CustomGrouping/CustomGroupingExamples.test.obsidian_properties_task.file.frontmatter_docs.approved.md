<!-- placeholder to force blank line before included text -->


```javascript
group by function task.file.property('creation date') ?? 'no creation date'
```

- group tasks by 'creation date' date property.

```javascript
group by function \
    const value = task.file.property('creation date'); \
    return value ? window.moment(value).format('MMMM') : 'no month'
```

- group tasks by month in 'creation date' date property.


<!-- placeholder to force blank line after included text -->
