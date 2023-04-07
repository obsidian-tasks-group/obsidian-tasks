# Linking to other pages in the docs

## Link to other notes directly

We use ordinary Obsidian wikilinks, which are most easily created in Obsidian itself by dragging a file from the navigator in to the document being edited.

For example:

- Linking to a file:
  - `[[Filters]]`
- Linking to a file, using custom display text:
  - `[[Filters|search filters]]`
- Linking to a heading in a file:
  - `[[Filters#Appendix: Tasks 2.0.0 improvements to date filters|Appendix below]]`

See [Link notes](https://help.obsidian.md/Getting+started/Link+notes) in the Obsidian documentation.

## Link to a category of related pages via tags

We are starting to use tags to link together pages that refer to the same topic.

Example topics tags:

- `#css`
- `#plugin/dataview`
- `#plugin/quickadd`

These tags should be placed immediately after the first H1 Heading (`# ....`) in the file, and written like this:

```html
<span class="related-pages">#plugin/calendar #plugin/periodic-notes</span>

```
