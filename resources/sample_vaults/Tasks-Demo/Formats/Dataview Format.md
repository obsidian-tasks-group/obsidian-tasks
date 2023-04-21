# Dataview Format

The fields shown below can be surrounded by either `[]` or `()`.

## Dataview Format Dates

- [ ] #task Has a created date [created:: 2023-04-17]
- [ ] #task Has a scheduled date [scheduled:: 2023-04-14]
- [ ] #task Has a start date [start:: 2023-04-15]
- [ ] #task Has a due date [due:: 2023-04-16]
- [x] #task Has a done date [completion:: 2023-04-17]

## Dataview Format for Priorities

- [ ] #task Low priority [priority:: low]
- [ ] #task Normal priority
- [ ] #task Medium priority [priority:: medium]
- [ ] #task High priority [priority:: high]

## Dataview Format for Recurrence

- [ ] #task Is a recurring task [repeat:: every day when done]

---

## Confirming that the fields are read correctly

```tasks
path regex matches /^Formats\/Dataview Format/
group by heading
sort by description
```
