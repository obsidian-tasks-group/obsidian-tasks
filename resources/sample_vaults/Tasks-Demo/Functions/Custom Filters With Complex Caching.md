# Custom Filters With Complex Caching

> [!error] WARNING
> These searches use a `query.searchCache` mechanism that is experimental, and may be changed or removed at any time: it is not recommended for use by users at this stage.

This is too complex an example for a general demonstration, or for the documentation.

But it was useful for confirming my (Clare's) understanding of the behaviour.

## Find tasks with duplicate descriptions - counts in group names differ from number of displayed

Show Tasks with more than one instance of the same description.

The counting is done across all tasks in the vault, including ones that do not match the Global Query, so some of the tasks counts in the groups are obviously wrong.

```tasks
not done

filter by function { \
    const cacheKey = 'descriptionCountsAllTasks'; \
    const getDescription = (t) => t.descriptionWithoutTags; \
    if (!query.searchCache[cacheKey]) { \
        console.log('Computing and caching description counts...'); \
        const taskCounts = new Map(); \
        query.allTasks.forEach(t => { \
            const group = getDescription(t); \
            taskCounts.set(group, (taskCounts.get(group) || 0) + 1); \
        }); \
        query.searchCache[cacheKey] = taskCounts; \
    } \
    const taskCounts = query.searchCache[cacheKey]; \
    const group = getDescription(task); \
    const counts = taskCounts.get(group); \
    return counts > 1; \
}

group by function { \
    const cacheKey = 'descriptionCountsAllTasks'; \
    const getDescription = (t) => t.descriptionWithoutTags; \
    const group = getDescription(task); \
    const counts = query.searchCache[cacheKey].get(group); \
    return `%%${1000000 - counts}%%` + group + " (" + (counts || 0) + " tasks)"; \
}
```

## Find tasks with duplicate descriptions - counts in group names match the number displayed

Show Tasks with more than one instance of the same description.

The counting is done only on tasks that match the query, by splitting it across the final two filter instructions in the search.

```tasks
not done

# Count the number of instances of descriptions that match this query.
# This must be the second-from-last filter in the query, to ensure the
# counts are accurate.
filter by function { \
    const cacheKey = 'descriptionCountsForMatchingTasks'; \
    if (!query.searchCache[cacheKey]) { \
        console.log('Initialising description counts map...'); \
        const taskCounts = new Map(); \
        query.searchCache[cacheKey] = taskCounts; \
    } \
    const group = task.descriptionWithoutTags; \
    taskCounts = query.searchCache[cacheKey]; \
    taskCounts.set(group, (taskCounts.get(group) || 0) + 1); \
    return true; \
}

# Filter out the instances with fewer than 2 actual matches...
# This must be the last filter in the query.
filter by function { \
    const cacheKey = 'descriptionCountsForMatchingTasks'; \
    const group = task.descriptionWithoutTags; \
    const count = query.searchCache[cacheKey].get(group); \
    return count > 1; \
}

group by function { \
    const cacheKey = 'descriptionCountsForMatchingTasks'; \
    const group = task.descriptionWithoutTags; \
    const count = query.searchCache[cacheKey].get(group); \
    return `%%${1000000 - count}%%` + group + " (" + (count || 0) + " tasks)"; \
}
```
