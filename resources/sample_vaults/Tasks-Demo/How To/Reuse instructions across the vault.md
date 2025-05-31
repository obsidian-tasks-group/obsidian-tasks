---
TQ_explain: false
TQ_extra_instructions: |-
  (filename includes Tasks Format) OR (tag includes #context)
  ignore global query
  limit 20
---
# Reuse instructions across the vault

These searches are for experimenting with, and understanding, the new "Includes" facility, which was released in Tasks X.Y.Z.

presets values can be defined in the Tasks settings.

explain: `INPUT[toggle:TQ_explain]`

## List all the known 'include' values in settings

(assuming there is not one called `xxxx`!)

````text
```tasks
preset xxxx
```
````

```tasks
preset xxxx
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
preset hide_all_dates
preset hide_other_fields
```
````

```tasks
preset hide_all_dates
preset hide_other_fields
```

## Hide all the Tasks user interface elements

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
preset hide_buttons
```
````

```tasks
preset hide_buttons
```

## Show only the description and any tags

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
preset just_the_description_and_tags
```
````

```tasks
preset just_the_description_and_tags
```

## Just show the description, without tags

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
preset just_the_description
```
````

```tasks
preset just_the_description
```

## Advanced use: return a function, that takes a parameter from the query source

### Has context 'home' - and group by the Include text - version 1

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{preset.filter_by_context}}"; return x

{{preset.filter_by_context}}('home')
```
````

```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{preset.filter_by_context}}"; return x

{{preset.filter_by_context}}('home')
```

### Has context 'home' - and group by the Include text - version 2

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{preset.extract_contexts_1}}"; return x

# includes.extract_contexts_1 value needs to be surrounded by parentheses ():
filter by function return ({{preset.extract_contexts_1}})('home')
```
````

```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{preset.extract_contexts_1}}"; return x

# includes.extract_contexts_1 value needs to be surrounded by parentheses ():
filter by function return ({{preset.extract_contexts_1}})('home')
```

### Has context 'home' - and group by the Include text - version 3

explain: `INPUT[toggle:TQ_explain]`

````text
```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{preset.extract_contexts_2}}"; return x

# includes.extract_contexts_1 value has the parentheses, to simplify use:
filter by function {{preset.extract_contexts_2}}('home')
```
````

```tasks
# For debug/explanatory purposes, show the source of the Include as a group name:
group by function const x = "{{preset.extract_contexts_2}}"; return x

# includes.extract_contexts_1 value has the parentheses, to simplify use:
filter by function {{preset.extract_contexts_2}}('home')
```
