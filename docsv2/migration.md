# Migration to Publish

Reminders of things to do.

## Mechanics

- [ ] Write a Python script to do the following
  - See [github.com/claremacrae/jekyll_to_obsidian_publish](https://github.com/claremacrae/jekyll_to_obsidian_publish)

## Basics

### Tables of contents

- [x] Remove old Table of Contents blocks
- [x] Remove `{: .no_toc }`

### File names and folders

- [ ] Use file's `title` in Front Matter to rename it
- [ ] Figure out how to manage the many `index.md` files - give them sensible names, and link to them correctly.

### Links

- [x] Update all internal links to use `[[ ]]` format - filenames only
- [ ] Update all links to section headings
  - Maybe convert hyphens in #.... (heading names) to spaces
  - Probably need to parse files and find their corresponding headings
- [ ] Remove the need for paths to files in links
  - By making every filename unique

### Frontmatter - other

- [x] Maybe convert all `title:` YAML to `alias:`
  - It didn't fix the file names
- [ ] Remove historical frontmatter that is not relevant in Obsidian
  - [ ] nav_order
  - [ ] layout
  - [ ] parent
  - [ ] has_toc
  - [ ] has_children
  - [ ] title (after it has been used to set the new file name)

### Callouts

- [ ] Convert callouts to Obsidian style
  - Some done. Some are missing their leading '>' on subsequent lines
  - Info needs to be called Information
- [ ] Add CSS for custom callouts, like Released
- [ ] Fix this style of "callout":

```text
<div class="code-example" markdown="1">
Warning
{: .label .label-yellow }
Folders with a comma (`,`) in their name are not supported.
</div>
```

### Styling

- [ ] Convert CSS from old site to new (for example, top-align all cells in tables)

### Images

- [ ] Image quality of some, such as [Create or Edit dialog](https://publish.obsidian.md/tasks/getting-started/create-or-edit-task) is very poor
  - It may depend on the window size

### Codeblocks

- [ ] Convert indented codeblocks to fenced code blocks and add languages

## Finally

- [ ] Update the links in `docs-snippets/snippet-statuses-overview.md`
- [ ] Delete this `migration.md` file

## Useful Links

- [Old Site](https://obsidian-tasks-group.github.io/obsidian-tasks/)
- [New Site](https://publish.obsidian.md/tasks/index)
- Conversion Script: [github.com/claremacrae/jekyll_to_obsidian_publish](https://github.com/claremacrae/jekyll_to_obsidian_publish)
- [Obsidian Publish docs](https://help.obsidian.md/Obsidian+Publish/Introduction+to+Obsidian+Publish)
