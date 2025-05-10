---
TQ_explain: false
---
# Reuse instructions across the vault

These searches are for experimenting with, and understanding, the new "Includes" facility, which was released in Tasks X.Y.Z.

Includes values can be defined in the Tasks settings.

## List all the known 'include' values in settings

(assuming there is not one called `xxxx`!)

```tasks
include xxxx
```

## Show all the fields

explain: `INPUT[toggle:TQ_explain]`

```tasks
limit 10
```

## Hide all the fields

explain: `INPUT[toggle:TQ_explain]`

```tasks
include hide_all_dates
include hide_other_fields
limit 10
```

## Hide all the Tasks user interface elements

explain: `INPUT[toggle:TQ_explain]`

```tasks
include hide_buttons
limit 10
```

## Hide everything, including tags

```tasks
include just_the_description_and_tags
limit 10
```
