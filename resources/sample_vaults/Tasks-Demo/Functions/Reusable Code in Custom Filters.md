# Reusable Code in Custom Filters

## Custom JS way

```tasks
group by function \
    const {Tasks} = customJS; \
    return Tasks.byParentItemDescription(task);
limit 1
```

```tasks
group by function customJS.Tasks.byParentItemDescription(task);
limit 1
```

## CodeScript Toolkit way

```tasks
group by function \
    const {parentDescription} = require('/Tasks.js'); \
    return parentDescription(task);
limit 1
```

```tasks
group by function require('/Tasks.js').parentDescription(task)
limit 1
```

```tasks
group by function Tasks.parentDescription(task)
limit 1
```

```tasks
group by function TasksNew.parentDescription(task)
limit 1
```
