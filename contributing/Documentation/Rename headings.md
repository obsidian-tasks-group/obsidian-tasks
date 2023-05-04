---
publish: true
---

# Rename headings

This note records why we prefer not to rename published headings, but how to safely rename headings if you need to.

See also [[Redirects - Renaming files]].

## Prefer not to rename published headings

Once a file has been published, users may bookmark links to individual headings within the file.

Also, the Tasks plugin's GitHub Issues and Discussions - and in the Obsidian Members Group Discord - all contain lots of links to sections within documentation pages.

And Obsidian Publish does not provide a redirect mechanism for renamed headings.

So broadly speaking, we prefer not to rename headings in documents that have already been published, to avoid breaking saved links to sections.

## Renaming headings

### 1. Rename the heading

If you do decide to rename a heading, do the following to ensure all internal links are updated:

1. Right-click on the heading
2. Select the option `Rename this heading...`

### 2. Update any URLs to the file

1. Search the whole repository to update any URLs to the old heading to point to the new instead.
