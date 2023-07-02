---
publish: true
---

# Global Filter

> [!tip]
> Since Tasks 3.5.0, a new [[Global Query]] facility has been added, which offers a lot more flexibility than the Global Filter.

## Optional Global Filter

You can set the Global Filter in the settings so that Tasks only matches specific checklist items.
For example, you could set it to `#task` to only track checklist items as task if they include the string `#task`.
It doesn't have to be a tag. It can be any string.
Leave it empty to regard all checklist items as tasks.

Example with Global Filter `#task`:

```markdown
- [ ] #task take out the trash
```

If you don't have the Global Filter set, all regular checklist items will be considered a task:

```markdown
- [ ] take out the trash
```

> [!warning]
> If you use a tag such as `#task` as the Global Filter, you cannot add sub-tags to that tag.

## Settings for the Global Filter

The following settings in the Tasks Options pane control the vault's Global Filter.

Note you must restart Tasks after changing any settings here.

![settings-global-filter](../images/settings-global-filter.png)

Image of the settings options for the Global Filter, showing the default settings.
