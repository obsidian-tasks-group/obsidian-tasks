<%-*
const label = (await tp.system.prompt('Label (for example: scope: sub-tasks and super-tasks)')).replace(/"/g, '');

const encoded_label = label
  .trim()
  .replace(/ /g, '+')
  .replace(/:/g, '%3A');
-%>

## Support

Before creating a new bug report or feature request about <% tp.file.title %>, please check existing items to avoid duplicates.

You do not need to search manually: the links below are already filtered to the label `"<%* tR += label %>"`.

- Please check both Open and Closed items.
- If you find an existing item, please support it there instead of adding a `+1` comment. See [[About Support and Help#How to support an existing request|How to support an existing request]].

| Type | Open | Closed | Notes |
| --- | --- | --- | --- |
| Issues | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aopen%20label%3A%22<%* tR += encoded_label %>%22%20is%3Aissue%20) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/issues?q=is%3Aclosed%20label%3A%22<%* tR += encoded_label %>%22%20is%3Aissue%20) | bug reports and feature requests |
| Discussions | [Open](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aopen+label%3A%22<%* tR += encoded_label %>%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | [Closed](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/ideas-any-new-feature-requests-go-in-issues-please?discussions_q=is%3Aclosed+label%3A%22<%* tR += encoded_label %>%22+category%3A%22Ideas%3A+Any+New+Feature+Requests+go+in+Issues+please%22+sort%3Atop) | older feature discussions from before late 2022 |

If you do not find an existing item in Issues or Discussions, see [[About Support and Help]] for how to report a bug or request a feature.
