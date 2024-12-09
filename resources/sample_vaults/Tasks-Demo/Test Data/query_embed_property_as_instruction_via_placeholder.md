---
task_instruction: group by filename
---
# query_embed_property_as_instruction_via_placeholder

- [ ] #task Task in 'query_embed_property_as_instruction_via_placeholder'

```tasks
explain
ignore global query
{{query.file.frontmatter.task_instruction}}
limit 10
```
