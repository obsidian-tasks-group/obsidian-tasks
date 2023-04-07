# Linking to other pages in the docs

## Linking to other notes directly

We use ordinary Obsidian wikilinks, which are most easily created in Obsidian itself.

For example:

- Linking to a file:
  - `[[Filters]]`
- Linking to a file, using an alias:
  - `[[Filters#Appendix: Tasks 2.0.0 improvements to date filters|Appendix below]]`
- Linking to a heading in a file:
  - `[[Filters#Appendix: Tasks 2.0.0 improvements to date filters|Appendix below]]`

See [Link notes](https://help.obsidian.md/Getting+started/Link+notes) in the Obsidian documentation.

## Linking to a category of related pages via tags

We are starting to tags to link together pages that refer to the same topic.

Example topics tags:

- `css`
- `plugin/dataview`
- `plugin/quickadd`

These tags should be placed immediately after the first H1 Heading (`# ....`) in the file, and written like this:

```html
<span class="related-pages">#plugin/calendar #plugin/periodic-notes</span>

```
