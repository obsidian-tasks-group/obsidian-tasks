---
layout: default
title: Global Filter
nav_order: 1
parent: Getting Started
has_toc: false
---

# Global Filter

You can set a global filter in the settings so that Tasks only matches specific checklist items.
For example, you could set it to `#task` to only track checklist items as task if they include the string `#task`.
It doesn't have to be a tag. It can be any string.
Leave it empty to regard all checklist items as tasks.

Example with global filter `#task`:

```markdown
- [ ] #task take out the trash
```

If you don't have a global filter set, all regular checklist items will be considered a task:

```markdown
- [ ] take out the trash
```

<div class="code-example" markdown="1">
Warning
{: .label .label-yellow }
If you use a tag such as `#task` as the global filter, you cannot add sub-tags to that tag.
</div>
