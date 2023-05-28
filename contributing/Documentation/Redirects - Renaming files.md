---
publish: true
---

# Redirects - Renaming files and headings

This note records why and how to keep published links working.

See also [[Redirects - Testing old links still work]] for how we test this.

You can also [[Rename headings]].

## Why we care about keeping links working

Once a file has been published, users may bookmark it, and search engines will find it and point users to it.

Also, the Tasks plugin's GitHub Issues and Discussions - and in the Obsidian Members Group Discord - all contain lots of links to documentation pages.

So we make an effort to keep published URLs working.

## Redirecting: the Theory

The Obsidian help page [Redirecting old notes](https://help.obsidian.md/Obsidian+Publish/Redirecting+old+notes) explains how redirects work.

## Redirecting: the Practice

Tasks has a Templater template in both the Docs and Contributing vaults to streamline this process.

Given a page that you wish to rename and/or move to a different folder.

### 1. Add an alias to the file, containing the current path

> [!Success]
> The goal is to go from this ...
>
> ```yaml
> ---
> publish: true
> aliases:
>   - 
> --- 
> ```
>
>
> ... to this ...
>
> ```yaml
> ---
> publish: true
> aliases:
>   - Current/Path/To/Documentation File
> ---
> ```
>
> ... without any error-prone manual typing of the file path!

Follow these steps:

1. In Obsidian, open the file that needs renaming.
2. Make its frontmatter look like the first block above, with an empty alias line:
    - or add a new line with hyphen and space, to create a new empty alias line in `aliases` if this file had already been renamed.
3. Put the cursor at the end of the empty alias line.
4. Apply the templater template `file path for redirecting alias`.

### 2. Add the old URL to list to test

1. Run the command `Open Publish URL in browser`, and confirm the URL works
2. Copy the old published URL
3. Paste the old URL to [[Redirects - Testing old links still work]], so we can check in future that the redirect works.

### 3. Rename the file in Obsidian

1. Use Obsidian's `Rename file` command to do the renaming, to ensure that all links to the file are updated.

### 4. Update any URLs to the file

1. Search the whole repository to update any URLs to the old location to point to the new instead.
