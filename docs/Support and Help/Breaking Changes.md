---
publish: true
---

# Breaking changes

## Avoiding breaking changes

We work hard to avoid changing the behaviour of existing task lines and existing Tasks searches.

However, very occasionally a new feature or bug fix is so valuable that we consider the benefits to outweigh the cost.

In this case, as we use [semantic versioning](https://semver.org), we will always bump the major (first) version number.

## Documenting breaking changes

To help users updating across multiple Tasks releases, we collect here links to the few Tasks breaking changes - most recent first.

## Tasks 7.0.0 (14 April 2024)

*Release notes: [Tasks 7.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/7.0.0).*

- **Boolean expressions**
  - Significant improvements to [[Combining Filters]] with Boolean expressions.
  - See [[Combining Filters#Appendix Changes to Boolean filters in Tasks 7.0.0|the appendix]] for one small breaking change, and all the improvements.

## Tasks 6.0.0 (19 January 2024)

*Release notes: [Tasks 6.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/6.0.0).*

These are all bug-fixes, improving the default behaviour, and recorded here for transparency.

- **Sorting**
  - The [[Sorting#Default sort order|default sort order]] now sorts first by status type, to greatly improve search results that include completed tasks.
- **Invalid dates**
  - [[Filters#Happens|happens]] date now ignores any invalid dates.
  - `sort by [date]` puts invalid dates before valid dates, as action is required. See [[Sorting#How dates are sorted]].
  - `group by [date]` now puts `Invalid [date] date` as the first heading.
  - The [[urgency]] calculation now ignores any invalid dates.
  - `task.due.category` and `task.due.fromNow` now handle invalid dates as different from future dates. See [[Task Properties#Values in TasksDate Properties|Values in TasksDate Properties]].
- **Code snippets** used to change the look of the Edit and Postpone buttons must be changed, as explained in [[How to style buttons]], which gives several examples.

## Tasks 5.0.0 (21 October 2023)

*Release notes: [Tasks 5.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/5.0.0).*

- The meaning of final backslash (`\`) characters on query lines [[Line Continuations#Appendix Updating pre-5.0.0 searches with trailing backslashes|has changed]].

## Tasks 4.0.0 (15 June 2023)

*Release notes: [Tasks 4.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/4.0.0).*

- The order of `group by urgency` [[Grouping#Urgency|was reversed]].

## Tasks 3.0.0 (2 April 2023)

*Release notes: [Tasks 3.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/3.0.0).*

- Some CSS snippets that use `>` in their selectors [[Styling#Appendix Fixing CSS pre-existing snippets for Tasks 3.0.0|may need updating]].
- For example, see comment mentioning `3.0.0` in the CSS sample in [[How to style backlinks#Using CSS to replace the backlinks with icons|Using CSS to replace the backlinks with icons]].

## Tasks 2.0.0 (22 March 2023)

*Release notes: [Tasks 2.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/2.0.0).*

- The introduction of filtering for date ranges [[Filters#Appendix Tasks 2.0.0 improvements to date filters|improved the results of some date searches]].
