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
  - This will take care of making sure all the `index.md` files have unique names
  - I tried this, and the new names were great.
  - But some of them changed only by capitalisation - [[grouping]] -> [[Grouping]], for example.
  - And git on my Mac then sees these files as not changed
  - I can work around it [Case-sensitive git in Mac OS X like a Pro](https://coderwall.com/p/mgi8ja/case-sensitive-git-in-mac-os-x-like-a-pro)
  - But even if I do that, for people who have previously cloned the repo on Windows and Mac, will it still be a problem?
  - A workaround is to move the docs to a new folder, but then we lose the original history
- [ ] Need to figure out renaming folders too - probably by string manipulation
  - `getting-started` becomes
  - `Getting Started`
- [ ] Figure out how to get git on Mac to recognise the renamed files and folders
- [ ] Check programmatically that all filenames are unique

### Links

- [x] Update all internal links to use `[[ ]]` format - filenames only
- [ ] Update all links to section headings
  - Maybe convert hyphens in #.... (heading names) to spaces
  - Probably need to parse files and find their corresponding headings
- [ ] If the filename and original title are the same, don't put in the `|alias`
- [ ] Remove the need for paths to files in links
  - By making every filename unique

### Frontmatter - other

- [x] Maybe convert all `title:` YAML to `alias:`
  - It didn't fix the file names
- [x] Remove historical frontmatter that is not relevant in Obsidian
  - [x] nav_order
  - [x] layout
  - [x] parent
  - [x] grand_parent
  - [x] has_toc
  - [x] has_children
  - [x] title

### Callouts

- [ ] Convert callouts to Obsidian style
  - Some done. Some are missing their leading '>' on subsequent lines
  - Info needs to be called Information
- [ ] Add CSS for custom callouts, like Released
- [ ] Use grey for Released, instead of Green, so it is less intrusive when reading
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
- [Callouts docs](https://help.obsidian.md/Editing+and+formatting/Callouts)
