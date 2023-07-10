---
publish: false
alias: Migration to Publish
---

# Migration to Publish

Notes and reminders of things to do.

## Notes for testers of the new site

### Goals

> [!success] Goal of this migration
> The goals of this migration:
>
> - **A direct translation of the existing Tasks user docs**:
>   - from: Jekyll
>   - to: Obsidian Publish
> - Retaining all information and meaning
> - Using a Python script, so that the migration can be repeated
>   - when we are ready for the final conversion
> - And creating idiomatic Obsidian markdown
>   - **For ease of future editing of documentation content.**
> - As much as possible, make pages on the old site redirect to the new one.

> [!failure] Non-goals of this migration
>
> - At this stage, we will not improve the structure of the site

### Current Status and Known Problems

> [!todo] Things still to be done, so known issues
> The only known remaining problems/things to do:
>
> - [ ] **Need to make it clearer, in each folder, what the starting page is**
>   - And update the URLs in Python conversion code to what the new location is
> - [ ] In [[Daily Agenda]] and [[Quick Reference]], table does not not scroll to right on iPhone, in Safari and Chrome
>   - Possibly useful links:
>     - <https://forum.obsidian.md/t/css-horizontal-scrolling-tables/26581>
>     - <https://stackoverflow.com/questions/41539803/html-table-wont-scroll-horizontal>
> - [ ] In [[Styling#Complete Example]] (and other sections) the comments are not visible in Safari on iPhone, iOS 15.6.1
>   - They do show up on Chrome on iPhone
>   - When I "reload without content blockers" in Safari, the comments do show up
> - In [[Set up custom statuses#Adding more statuses]], **the link** [[Status Settings#Bulk-adding Statuses|Bulk-adding Statuses]] **does not jump to the correct heading**, either in Obsidian or in Publish
>   - The Bulk adding link *does work here*
>   - But the "adding more statuses" one *doesn't* work here :-(
>   - Later: now they both work everywhere
>   - Most of the time
>
> If you notice any other problems, please give us the **url** and a **screenshot** in [#1706](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1706#issuecomment-1454284835). Thank you.

> [!bug] Bugs and annoyances that will likely not be fixed
>
> - Some images are a bit fuzzy at some window sizes, but the same applies to the Obsidian user docs, so I may not be able to do anything about it
> - When loading pages, there is a short flicker before the page is shown
>   - This happens on the Obsidian Help site, so is outside my control

### Tips for reviewing

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
| [New Docs](https://publish.obsidian.md/tasks/index) live           | [docs/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/port-user-guide-to-obs-publish-v3/docs) folder on the<br>[port-user-guide-to-obs-publish-v3 branch](https://github.com/obsidian-tasks-group/obsidian-tasks/compare/main...port-user-guide-to-obs-publish-v3) branch |
| Conversion script and tests                                        | [github.com/claremacrae/jekyll_to_obsidian_publish](https://github.com/claremacrae/jekyll_to_obsidian_publish)                                                                                                                                                                              |
| Issue tracking the work                                            | [#1706: # Migrate User Docs to Obsidian Publish, with current folder structure](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1706)                                                                                                                                         |

- [Obsidian Publish docs](https://help.obsidian.md/Obsidian+Publish/Introduction+to+Obsidian+Publish)
- [Callouts docs](https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types)
- [Obsidian Style Guide](https://help.obsidian.md/Contributing+to+Obsidian/Style+guide)

---

The remainder is detailed notes on the conversion

## Mechanics

- [x] Write a Python script to do the following
  - See [github.com/claremacrae/jekyll_to_obsidian_publish](https://github.com/claremacrae/jekyll_to_obsidian_publish)

## Basics

### Tables of contents

- [x] Remove old Table of Contents blocks
- [x] Remove `{: .no_toc }`

### File names and folders

- [x] Use file's `title` in Front Matter to rename it
  - This will take care of making sure all the `index.md` files have unique names
  - I tried this, and the new names were great.
  - But some of them changed only by capitalisation - [[grouping]] -> [[Grouping]], for example.
  - And git on my Mac then sees these files as not changed
  - I can work around it [Case-sensitive git in Mac OS X like a Pro](https://coderwall.com/p/mgi8ja/case-sensitive-git-in-mac-os-x-like-a-pro)
  - But even if I do that, for people who have previously cloned the repo on Windows and Mac, will it still be a problem?
  - A workaround is to move the docs to a new folder, but then we lose the original history
- [x] Need to figure out renaming folders too - probably by string manipulation
  - `getting-started` becomes
  - `Getting Started`
  - I ended up writing a script that wrote out the 'git mv' instructions, and executing them by hand, to check the status of each one.
- [x] Figure out how to get git on Mac to recognise the renamed files and folders
- [x] ABANDONED - Check programmatically that all filenames are unique

### Links

- [x] Update all internal links to use `[[ ]]` format - filenames only
- [x] Update all links to section headings
  - ~~Maybe convert hyphens in #.... (heading names) to spaces~~
  - ~~Probably need to parse files and find their corresponding headings~~
  - Done by hand
- [x] If the filename and original title are the same, don't put in the `|alias`
- [x] Remove the need for paths to files in links
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
- [x] Add CSS for custom callouts, like Released
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

- [x] Formatting of table of values in the [[Urgency]] docs - see [this comment](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1706#issuecomment-1454284835)

### Styling

- [x] Convert CSS from old site to new (for example, top-align all cells in tables)
  - Done in both Obsidian snippets and publish.css
- [x] I think that `text in backticks` does not stand out enough in the new site, compared to the old
- [x] Would really borders/key-lines around images
  - Done in both Obsidian snippets and publish.css

### Images

- [-] Image quality of some, such as [Create or Edit dialog](https://publish.obsidian.md/tasks/getting-started/create-or-edit-task) is very poor
  - It may depend on the window size
- [ ] Change images so that they are simple embeds, `![[]]`

### Codeblocks

- [ ] Convert indented codeblocks to fenced code blocks and add languages

## Old GitHub Pages site

- [ ] Write out a mapping/redirect file:
  - `Old URL` -> `New URL`
- [ ] Test out using Aliases to point browsers to the new location of renamed files. See [Discord](https://discord.com/channels/686053708261228577/1078726185590194196/1081998454739439707).
- [ ] Set up redirects on the old site to point to the new locations
- [x] Stop `release.sh` merging to `gh-pages` branch.

## Finally

Changes in the conversion script before final conversion:

- [x] Remove the 'about this site' banner at top of front page
- [x] Remove the `View this page on the old documentation site` section and callouts from the script
- [x] Rework the script so that it renames and overwrites the original content in 'docs/' (instead of saving in new 'docs/')

Actually doing the conversion

- [x] Create a new branch for the final conversion
- [x] Run the conversion script
- [x] Update the links in `docs-snippets/snippet-statuses-overview.md`
  - Probably by running the conversion script on it.
- [x] Commit the changes, ~~being sure to 'force' commit, so all the pure 'file renamings for capitalisation' are preserved~~.
- [x] Push the changes
- [x] Publish!!!

## Next steps

- [x] Save this `migration.md` file from branch `port-user-guide-to-obs-publish-v3` somewhere - probably attached to the PR - actually I just committed it on the branch `port-user-guide-to-obs-publish-v3` for now
- [-] Write a script to use for when renaming files and folders in the docs
  - ~~Add original path as alias, to enable redirects.~~
  - I decide this was too much clutter

## Contributing guide additions

- [ ] Update the Contributing Guide's [Documentation section](https://publish.obsidian.md/tasks-contributing/Documentation/Omitting+a+heading+from+the+page's+Table+of+Contents) to remove obsolete content, and update the rest with instructions for Obsidian Publish

Things to mention

- How to enable redirects when renaming files and folders (the script and aliases)
- When editing the CSS to improve styling, change it in two places, for consistent appearances in Obsidian and the published site:
  - Add and enable a snippet in `docs/.obsidian/snippets/`
  - Add to `docs/publish.css`

## Remaining steps

```tasks
not done

group by heading
```
