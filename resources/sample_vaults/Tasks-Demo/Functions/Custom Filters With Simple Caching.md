# Custom Filters With Simple Caching

> [!error] WARNING
> These searches use a `query.searchCache` mechanism that is experimental, and may be changed or removed at any time: it is not recommended for use by users at this stage.

## Find tasks with duplicate non-empty IDs - slow on many tasks

```tasks
filter by function { \
    const thisValue = task.id; \
    if (thisValue === '') return false; \
    let count = 0; \
    query.allTasks.forEach(t => { \
        if (t.id === thisValue) count += 1; \
    }); \
    return (count > 1); \
}

group by id
```

## Find tasks with duplicate non-empty IDs - fast on many tasks

```tasks
filter by function { \
    const cacheKey = 'idCounts'; \
    const getValue = (task) => task.id; \
    if (!query.searchCache[cacheKey]) { \
        const taskCounts = new Map(); \
        query.allTasks.forEach(t => { \
            const group = getValue(t); \
            taskCounts.set(group, (taskCounts.get(group) || 0) + 1); \
        }); \
        query.searchCache[cacheKey] = taskCounts; \
    } \
    const taskCounts = query.searchCache[cacheKey]; \
    const value = getValue(task); \
    if (value === '') return false; \
    const count = taskCounts.get(value); \
    return count > 1; \
}

group by id
```
