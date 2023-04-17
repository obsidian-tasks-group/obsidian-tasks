# Tasks

## All

```tasks
```

Task SQL Query Version

```tasks-sql

```

## Open tasks from Important Project

```tasks
not done
path includes Important Project
```

Task SQL Query Version

```tasks-sql
WHERE status->symbol = ' ' AND path LIKE '%Important Project%'
```

## Due before 6th of December

```tasks
not done
due before 2021-12-06
```

Task SQL Query Version

```tasks-sql
WHERE status->symbol = ' ' AND dueDate < moment('2021-12-06')
```

## Short Mode

```tasks
not done
due before 2021-12-06
short mode
```

Task SQL Query Version

```tasks-sql
WHERE status->symbol = ' ' AND dueDate < moment('2021-12-06')
#short mode
```

## No match

```tasks
not done
done after 2021-11-21
```

Task SQL Query Version

```tasks-sql
WHERE status->symbol = ' ' AND doneDate > moment('2021-11-21')
#short mode
```
