---
layout: default
title: Global Filter
nav_order: 1
parent: Getting Started
has_toc: false
---

# Global Filter

You can set a global filter in the settings so that Tasks only matches specific checklist items.
For example, you could set it to `#tasks` to only track checklist items as task if they include the string `#tasks`.
It doesn't have to be a tag. It can be any string.
Leave it empty to regard all checklist items as tasks.

Example with global filter `#tasks`:

```
- [ ] #tasks take out the trash
```

If you don't have a global filter set, all regular checklist items work:

```
- [ ] take out the trash
```
