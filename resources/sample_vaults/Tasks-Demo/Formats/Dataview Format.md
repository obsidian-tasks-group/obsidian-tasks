# Dataview Format

The fields shown below can be surrounded by either `[]` or `()`.

## Dataview Format for Dates

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForTaskFormats.test.Serializer_Dates_dataview-include.approved.md -->

- [ ] #task Has a created date  [created:: 2023-04-13]
- [ ] #task Has a scheduled date  [scheduled:: 2023-04-14]
- [ ] #task Has a start date  [start:: 2023-04-15]
- [ ] #task Has a due date  [due:: 2023-04-16]
- [x] #task Has a done date  [completion:: 2023-04-17]
- [-] #task Has a cancelled date  [cancelled:: 2023-04-18]

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Dataview Format for Priorities

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForTaskFormats.test.Serializer_Priorities_dataview-include.approved.md -->

- [ ] #task Lowest priority  [priority:: lowest]
- [ ] #task Low priority  [priority:: low]
- [ ] #task Normal priority
- [ ] #task Medium priority  [priority:: medium]
- [ ] #task High priority  [priority:: high]
- [ ] #task Highest priority  [priority:: highest]

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Dataview Format for Recurrence

- [ ] #task Is a recurring task  [repeat:: every day when done]

## Dataview Format for Dependencies

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForTaskFormats.test.Serializer_Dependencies_dataview-include.approved.md -->

- [ ] #task do this first  [id:: dcf64c]
- [ ] #task do this after first and some other task  [dependsOn:: dcf64c,0h17ye]

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## All Dataview Fields

- [ ] #task Has one of every field except done  [priority:: high]  [repeat:: every day]  [start:: 2023-04-24]  [scheduled:: 2023-04-26]  [due:: 2023-04-27]
- [x] #task Has one of every except recurring  [priority:: high]  [created:: 2023-04-26]  [start:: 2023-04-23]  [scheduled:: 2023-04-25]  [due:: 2023-04-26]  [completion:: 2023-04-26]

---

## Confirming that the fields are read correctly

```tasks
path regex matches /^Formats\/Dataview Format/
group by heading
sort by description
```
