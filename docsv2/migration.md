# Migration to Publish

Notes and reminders of things to do.

## Notes for testers of the new site

### Goals

> [!success] Goal of this migration
> The goals of this migration:
>
> - **A direct translation of the existing Tasks users docs**:
>   - from: Jekyll
>   - to: Obsidian Publish
> - Retaining all information and meaning
> - Using a Python script, so that the migration can be repeated
>   - when we are ready for the final conversion
> - And creating idiomatic Obsidian markdown
>   - **For ease of future editing of documentation content.**

> [!failure] Non-goals of this migration
>
> - At this stage, we will not improve the structure of the site

### Current Status

> [!todo] Things still to be done, so known issues
> The only known remaining problems/things to do:
>
> - **File and folder names** will be updated to match their naming in the old site
>   - **This will make the left sidebar a lot more readable**
>   - Once this is done, the links will no longer need directories in them, as the filenames will be unique.
> - Links to **headings/sections** inside pages will be fixed to match Obsidian-style
> - Add some **styling**, for example to top-align all table cells
> - Broken table of values in the [[Urgency]] docs - see [this comment](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1706#issuecomment-1454284835)

> [!bug] Bugs and annoyances that will likely not be fixed
>
> - Some images are a bit fuzzy at some window sizes, but the same applies to the Obsidian user docs, so I may not be able to do anything about it
> - When loading pages, there is a short flicker before the page is shown
>   - This happens on the Obsidian Help site, so is outside my control

### Tips for reviewing

> [!tip] Tips for reviewing the new documentation
>
> - You can view the new site at: [publish.obsidian.md/tasks](https://publish.obsidian.md/tasks)
> - You can view the Markdown source in Obsidian:
>   - download the Tasks repo on the [branch for this work](https://github.com/obsidian-tasks-group/obsidian-tasks/archive/refs/heads/port-user-guide-to-obs-publish-v2.zip):
>   - expand `obsidian-tasks-port-user-guide-to-obs-publish-v2.zip`
>   - open the `obsidian-tasks-port-user-guide-to-obs-publish-v2` folder
>   - open the `docsv2` sub-folder in Obsidian
>   - Click 'trust author and plugins'

> [!tip] Tips - things I will probably put in a 'how to use the docs' page
>
> - **search** doesn't search everything
>   - Just filenames (I think) and headings (definitely)
> - **Finding related content**
>   - scroll to the bottom of the page to see pages that link to your current one
>   - click on tags to see related content
> - how to get **URLs to sections**
>   - Click the **icon** that shows up when you **hover** over a header in the note content, that will also **copy it to the clipboard**
>     - So don't do it if you've got anything valuable on the clipboard and, you don't have clipboard history on your system

## Useful Links

| What                                                               | Location of source                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Old Docs](https://obsidian-tasks-group.github.io/obsidian-tasks/) | [docs](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/docs) folder on the main branch                                                                                                                                                                                     |
| [New Docs](https://publish.obsidian.md/tasks/index) live           | [docsv2/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/port-user-guide-to-obs-publish-v2/docsv2) folder on the<br>[port-user-guide-to-obs-publish-v2 branch](https://github.com/obsidian-tasks-group/obsidian-tasks/compare/main...port-user-guide-to-obs-publish-v2) branch |
| Conversion script and tests                                        | [github.com/claremacrae/jekyll_to_obsidian_publish](https://github.com/claremacrae/jekyll_to_obsidian_publish)                                                                                                                                                                              |
| Issue tracking the work                                            | [#1706: # Migrate User Docs to Obsidian Publish, with current folder structure](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1706)                                                                                                                                         |

- [Obsidian Publish docs](https://help.obsidian.md/Obsidian+Publish/Introduction+to+Obsidian+Publish)
- [Callouts docs](https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types)
- [Obsidian Style Guide](https://help.obsidian.md/Contributing+to+Obsidian/Style+guide)

---

The remainder is detailed notes on the conversion

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

- [x] Convert callouts to Obsidian style
- [ ] Add CSS for custom callouts, like Released
- [x] Use grey for Released, instead of Green, so it is less intrusive when reading
- [x] Fix this style of "callout":

```text
<div class="code-example" markdown="1">
Warning
{: .label .label-yellow }
Folders with a comma (`,`) in their name are not supported.
</div>
```

### Formatting errors

- [ ] Formatting of table of values in the [[Urgency]] docs - see [this comment](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1706#issuecomment-1454284835)

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
