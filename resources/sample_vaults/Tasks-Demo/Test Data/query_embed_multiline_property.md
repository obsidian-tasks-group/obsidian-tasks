---
task_instructions: |
  group by root
  group by folder
  group by filename
---
# query_embed_multiline_property

- [ ] #task Task in 'query_embed_multiline_property'

Once query.file.frontmatter is accessible, this will fail, as placeholders are applied after the query is split at line-endings...

```tasks
ignore global query
folder includes Test Data
explain
{{query.file.frontmatter.task_instructions}}
```
