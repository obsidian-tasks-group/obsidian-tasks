---
TQ_explain: false
TQ_extra_instructions: |-
  (filename includes Tasks Format) OR (tag includes #context)
  ignore global query
  limit 20
---
# Reuse instructions across the vault

These searches are for experimenting with, and understanding, the new "Includes" facility, which was released in Tasks X.Y.Z.

Includes values can be defined in the Tasks settings.

explain: `INPUT[toggle:TQ_explain]`

## List all the known 'include' values in settings

(assuming there is not one called `xxxx`!)

````text
```tasks
include xxxx
```
````

```tasks
include xxxx
```

## Show all the fields

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
```
````

```tasks
```

## Hide all the fields

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
include hide_all_dates
include hide_other_fields
```
````

```tasks
include hide_all_dates
include hide_other_fields
```

## Hide all the Tasks user interface elements

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
include hide_buttons
```
````

```tasks
include hide_buttons
```

## Show only the description and any tags

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
include just_the_description_and_tags
```
````

```tasks
include just_the_description_and_tags
```

## Just show the description, without tags

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
include just_the_description
```
````

```tasks
include just_the_description
```

## Advanced use: return a function, that takes a parameter from the query source

### Has context 'home' - and group by the Include text - version 1

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{includes.filter_by_context}}"; return x

{{includes.filter_by_context}}('home')
```
````

```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{includes.filter_by_context}}"; return x

{{includes.filter_by_context}}('home')
```

### Has context 'home' - and group by the Include text - version 2

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{includes.extract_contexts_1}}"; return x

# includes.extract_contexts_1 value needs to be surrounded by parentheses ():
filter by function return ({{includes.extract_contexts_1}})('home')
```
````

```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{includes.extract_contexts_1}}"; return x

# includes.extract_contexts_1 value needs to be surrounded by parentheses ():
filter by function return ({{includes.extract_contexts_1}})('home')
```

### Has context 'home' - and group by the Include text - version 3

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{includes.extract_contexts_2}}"; return x

# includes.extract_contexts_1 value has the parentheses, to simplify use:
filter by function {{includes.extract_contexts_2}}('home')
```
````

```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{includes.extract_contexts_2}}"; return x

# includes.extract_contexts_1 value has the parentheses, to simplify use:
filter by function {{includes.extract_contexts_2}}('home')
```
