---
publish: true
---

# Breaking changes

## Avoiding breaking changes

We work hard to avoid changing the behaviour of existing task lines and existing Tasks searches.

However, very occasionally a new feature or bug fix is so valuable that we consider the benefits to outweigh the cost.

In this case, as we use [semantic versioning](https://semver.org), we will always bump the major (first) version number.

## Documenting breaking changes

To help users updating across multiple Tasks releases, we collect here links to the few Tasks breaking changes.

- Tasks [2.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/2.0.0) (22 March 2023):
  - The introduction of filtering for date ranges [[Filters#Appendix Tasks 2.0.0 improvements to date filters|improved the results of some date searches]].
- Tasks [3.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/3.0.0) (2 April 2023):
  - Some CSS snippets that use `>` in their selectors [[Styling#Appendix Fixing CSS pre-existing snippets for Tasks 3.0.0|may need updating]].
  - For example, see comment mentioning `3.0.0` in the CSS sample in [[How to style backlinks#Using CSS to replace the backlinks with icons|Using CSS to replace the backlinks with icons]].
- Tasks [4.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/4.0.0) (15 June 2023):
  - The order of `group by urgency` [[Grouping#Urgency|was reversed]].
- Tasks [5.0.0](https://github.com/obsidian-tasks-group/obsidian-tasks/releases/tag/5.0.0) (21 October 2023):
  - The meaning of final backslash (`\`) characters on query lines [[Line Continuations#Appendix Updating pre-5.0.0 searches with trailing backslashes|has changed]].
