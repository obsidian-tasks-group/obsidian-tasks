---
layout: default
title: Global Filter
nav_order: 1
parent: Getting Started
has_toc: false
---

# Global Filter

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Optional Global Filter

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

## Settings for the Global Filter

The following settings in the Tasks Options pane control the vault's global filter.

Note you must restart Tasks after changing any settings here.

![settings-global-filter](../images/settings-global-filter.png)

Image of the settings options for the global filter, showing the default settings.
