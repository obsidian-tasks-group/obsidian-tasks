---
root_dirs_to_search:
  - Formats/
  - Filters/
task_instruction: group by filename
task_instructions: |
  group by root
  group by folder
    group by filename
  # a comment
    # an indented comment
task_instructions_with_continuation_line: |
  path \
    includes query_using_properties
task_instruction_with_spaces: "  path includes query_using_properties  "
link-in-frontmatter: "[[link_in_yaml]]"
---

# query_using_properties

- [ ] #task Task in 'query_using_properties'

Example link in body of a file, for documentation purposes: [[link_in_file_body_with_custom_display_text]].

## Use a one-line property: task_instruction

Read a Tasks instruction from a property in this file, and embed it in to any number of queries in the file:

```tasks
explain
ignore global query
{{query.file.property('task_instruction')}}
limit 10
```

## Use a one-line property: task_instruction_with_spaces

Read a Tasks instruction **that is surrounded by extra spaces** from a property in this file, and embed it in to any number of queries in the file:

```tasks
explain
ignore global query
{{query.file.property('task_instruction_with_spaces')}}
limit 10
```

## Use a multi-line property: task_instructions

Read multiple Tasks instructions from a property in this file, and embed them in to any number of queries in the file:

```tasks
ignore global query
folder includes Test Data
explain
{{query.file.property('task_instructions')}}
limit 10
```

## Use a multi-line property: task_instructions_with_continuation_line

Read multiple Tasks instructions with a continuation line from a property in this file, and embed them in to any number of queries in the file.

Continuation lines are currently unsupported in placeholders.

```tasks
ignore global query
folder includes Test Data
explain
{{query.file.property('task_instructions_with_continuation_line')}}
limit 10
```

## Use a list property in a custom filter: root_dirs_to_search

```tasks
ignore global query
explain

filter by function \
    if (!query.file.hasProperty('root_dirs_to_search')) { \
        throw Error('Please set the "root_dirs_to_search" list property, with each value ending in a backslash...'); \
    } \
    const roots = query.file.property('root_dirs_to_search'); \
    return roots.includes(task.file.root);

limit groups 5
group by root
```
