---
workdate: 2024-04-01
groupby: group by happens
---

# workdate Example

Simple use of properties in Tasks searches.

## Due

```tasks
#explain
due before {{query.file.property('workdate')}}
{{query.file.property('groupby')}}
limit 10
```

## Done

```tasks
#explain
done before {{query.file.property('workdate')}}
{{query.file.property('groupby')}}
limit 10
```
