---
publish: true
---

# Tags

## What are tags?

The Obsidian [Tags documentation](https://help.obsidian.md/Editing+and+formatting/Tags) says:

> [!Quote]
> Tags are keywords or topics that help you quickly find the notes you want.<br>
> To create a tag, enter a hashtag symbol (#) in the editor, followed by a keyword. For example, `#meeting`.

## Why use tags?

Selection of tags is of course a personal decision.

But here are some examples of tags that might be useful in conjunction with Tasks:

- For [Getting Things Done/GTD](https://en.wikipedia.org/wiki/Getting_Things_Done) concepts, such as context:
  - `#context/work`, `#context/home/ground-floor`
- Things to do at the start and end of the day
  - `#when/morning`, `#when/evening`
- Categorisation:
  - `#🏢/companyA`

## Tasks and your task lines

### The simple case

If you keep your tags to a hashtag symbol (`#`) followed by any of the following characters, you can ignore the detail in the [[#Recognising Tags]] section below.

- Alphabetical letters
- Underscore (`_`)
- Hyphen (`-`)
- Forward slash (`/`)

### Recognising Tags

There are some important differences in how Obsidian and Tasks recognise tags.

> [!Info]
> We are tracking these differences in [issue #929](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/929).<br>
> It is currently undecided whether tag recognition in Tasks will ever be modified to be more consistent with Obsidian.

| Situation                                  | Obsidian                                                                                                                                                                                                                                                                                                                                                                              | Tasks plugin                                                                                                                |
|--------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Characters allowed in tags                 | <p>See Obsidian's [Tag format](https://help.obsidian.md/Editing+and+formatting/Tags#Tag+format)</p><ul><li>Alphabetical letters</li><li>Numbers</li><li>Underscore (`_`)</li><li>Hyphen (`-`)</li><li>Forward slash (`/`) for [Nested tags](https://help.obsidian.md/Editing+and+formatting/Tags#Nested+tags)</li></ul><p>Tags must contain at least one non-numerical character.</p> | <p>Any characters **except** the following</p><ul><li><tt>space</tt></li><li><tt>!@#$%^&*(),.?":{}\|&lt;&gt;</tt></li></ul> |
| Number-only tags                           | Tags must contain at least one non-numerical character.<br>So `#1234` is **not** recognised a tag.                                                                                                                                                                                                                                                                                    | No restriction on all-digit tags.<br>So `#1234` **is** recognised as a tag.                                                 |
| Tags that look like floating-point numbers | Tags must contain at least one non-numerical character.<br>So `#12.34` is **not** recognised a tag.                                                                                                                                                                                                                                                                                   | No restriction on all-digit tags, but `.` is not allowed in tags.<br>So `#12.34` is treated as a tag `#12`.                 |
| Tag-like text in `%%` comments             | Ignored                                                                                                                                                                                                                                                                                                                                                                               | Recognised                                                                                                                  |
| Tag-like text in `<!-- .... -->`  comments | Ignored                                                                                                                                                                                                                                                                                                                                                                               | Recognised                                                                                                                  |

### Using tags in YAML, Frontmatter or file Properties

Obsidian allows [properties](https://help.obsidian.md/Editing+and+formatting/Properties) to be added at the start of notes.

These properties are also referred to as Frontmatter or YAML.

Here is an example, using tags:

```text
---
tags:
 - 🏷/some_tag
 - 🏢/companyA
---
```

Tasks does not currently read this data. We are tracking this in [discussion #232](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/232).

For now, see [Find tasks in notes with particular tag](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/How%20To/Find%20tasks%20in%20notes%20with%20particular%20tag.md) for a workaround using [[Dataview]] and Tasks together.

### Order of tags in task lines

- Tags can go in any place in any order on the task.
  - They can be mixed among your signifiers (due, priority etc).
  - See [[Auto-Suggest#What do I need to know about the order of items in a task?|What do I need to know about the order of items in a task?]]
- However, when lines are edited by Tasks (for example, via the [[Create or edit Task|‘Create or edit Task’ Modal]], or when a task is completed), the tags may get moved.

## Limitations

- The Description field in the [[Create or edit Task|‘Create or edit Task’ Modal]] does not give any help completing tags as you type them.
  - We are tracking this in [discussion #229](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/229).
- If you use a tag for the global filter, do not include it in your searches.
- Tasks does not read tags (or any other information) from file Frontmatter/YAML/Properties: tag values are only read from task lines
  - We are tracking this in [discussion #232](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/232).
  - See [[Tags#Using tags in YAML, Frontmatter or file Properties]] above for a dataview-assisted workaround.

## Tags and the Global Filter

> [!Warning]
> If the [[Global Filter]] is enabled, and is a tag, **do not use that global filter tag in your Tasks searches**.
> Global filter tags are removed when reading task lines, so you will not get the results you might expect.

## Related Tasks Block Instructions

The following instructions use any tags on task lines.

- `no tags`
- `has tags`
- `tags (include|do not include) <tag>` _or_
- `tag (includes|does not include) <tag>`
- `tags (regex matches|regex does not match) /<JavaScript-style Regex>/` _or_
- `tag (regex matches|regex does not match) /<JavaScript-style Regex>/`
  - [[Filters#Tags|Documentation]]
- `sort by tag`
- `sort by tag 2`
  - [[Sorting#Tags|Documentation]]
- `group by tags`
  - [[Grouping#Tags|Documentation]]
- `hide tags`
  - [[Layout|Documentation]]
- Accessible as `task.tags` in custom filters and groups
  - [[Task Properties#Values for Other Task Properties|Documentation]]
