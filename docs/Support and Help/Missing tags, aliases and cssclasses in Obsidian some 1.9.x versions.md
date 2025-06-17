---
publish: true
---

# Missing tags, aliases and cssclasses in Obsidian some 1.9.x versions

## Obsidian 1.9.0 reads properties strictly

> [!Warning] Warning: Breaking changes in Obsidian 1.9.x
>
> The [Bases](https://help.obsidian.md/bases) functionality in Obsidian 1.9.x is amazing.
>
> However, it is important to note the following in the [Obsidian 1.9.0 (Insider) changelog](https://obsidian.md/changelog/2025-05-21-desktop-v1.9.0/):
> > [!Quote] Breaking changes
> > We have officially removed support for the properties `tag`, `alias`, `cssclass` in favor of `tags`, `aliases` and `cssclasses`. In addition, the values of these properties _must_ be a list. If the current value is a text property, it will no longer be recognized by Obsidian.

## Things discovered whilst exploring this breaking change

All the following were observed and tested in Obsidian 1.9.2.

1. Any properties called `tag`, `alias`,  or `cssclass` are now ignored by Obsidian.
2. Obsidian no longer warns about incorrectly-formatted `tags`, `aliases` and `cssclasses` values, so they are easy to miss.
3. Any `tags`, `aliases` and `cssclasses` properties with non-list (incorrectly formatter) values will have their values deleted if Obsidian makes any changes to the file's frontmatter.
4. Obsidian does still support capitalised versions of the correctly spelled names: `TAGS`, `ALIASES` AND `CSSCLASSES`.

### You should check and fix your vault before using the 'File Properties' UI to edit any properties

Editing _any_ properties using **File Properties** or any other Obsidian properties editing UI causes Obsidian to delete text values for `tags`, `aliases` and `cssclasses`.

Unless you have version-controlled your vault, and you regularly check for differences, it's very possible your vault will lose values that previously were read.

The following sections show how you can fix and fix most of the problem cases.

### Find and rename old `tag`, `alias`, `cssclass` and properties

You will need to find all uses of the `tag`, `alias`, `cssclass` properties and manually rename them to `tags`, `aliases` and `cssclasses`, to ensure that Obsidian files these properties, as it did prior to version 1.9.0.

There doesn't seem to be a way to use [bases](https://help.obsidian.md/bases) to find these values.

So here is one way to do this.

> [!Tip]
> For maximum safety, you will need to be sure you edit the **Source** of the properties.
>
> - (Temporarily) Change your Obsidian **Editing settings** to:
>   - Properties in document: **Source**

Steps:

1. In the Obsidian **Search** box, paste in `["alias"]`.
    - If any values are found, click on each file, and **edit the property name to `aliases`**.
2. In the Obsidian **Search** box, paste in `["tag"]`.
    - If any values are found, click on each file, and **edit the property name to `tags`**.
3. In the Obsidian **Search** box, paste in `["cssclass"]`.
    - If any values are found, click on each file, and **edit the property name to `cssclasses`**.

### Find and fix the type of `tags`, `aliases` and `cssclasses` with string values

`tags`, `aliases` and `cssclasses` properties with string values will be discarded if you use Obsidian's UI to edit any properties in those files.

Here is one way to fix them.

1. Download the file **[Check Tags.base](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo/How%20To/Find%20properties%20not%20read%20by%20Obsidian%201.9.x)** - and open it in Obsidian 1.9.2 or newer.
    - Pin the file
    - Review _all_ the values in the **ErrorsAreTagsValuesNeedingFixing** column.
    - For every row that has an **⚠︎ Error** value:
        - Click on the file name
        - Put a `[` at the **start** of the **values** in the **tags** line
        - Put a `]` at the **end** of the **values** in the **tags** line
    - For example, change this:

        ```yaml
        ---
        tags: value-1-of-2-on-one-line, value-2-of-2-on-one-line
        ---
        ```

    - To this:

        ```yaml
        ---
        tags: [value-1-of-2-on-one-line, value-2-of-2-on-one-line]
        ---
        ```

2. Download the file **[Check Aliases.base](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo/How%20To/Find%20properties%20not%20read%20by%20Obsidian%201.9.x)** - and open it in Obsidian 1.9.2 or newer.
    - Pin the file
    - Review _all_ the values in the **ErrorsAreAliasesValuesNeedingFixing** column.
    - For every row that has an **⚠︎ Error** value:
        - Click on the file name
        - Put a `[` at the **start** of the **values** in the **aliases** line
        - Put a `]` at the **end** of the **values** in the **aliases** line
    - For example, change this:

        ```yaml
        ---
        aliases: value-1-of-2-on-one-line, value-2-of-2-on-one-line
        ---
        ```

    - To this:

        ```yaml
        ---
        aliases: [value-1-of-2-on-one-line, value-2-of-2-on-one-line]
        ---
        ```

3. Download the file **[Check CssClasses.base](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/resources/sample_vaults/Tasks-Demo/How%20To/Find%20properties%20not%20read%20by%20Obsidian%201.9.x)** - and open it in Obsidian 1.9.2 or newer.
    - Pin the file
    - Review _all_ the values in the **ErrorsAreCssclassesValuesNeedingFixing** column.
    - For every row that has an **⚠︎ Error** value:
        - Click on the file name
        - Put a `[` at the **start** of the **values** in the **cssclasses** line
        - Put a `]` at the **end** of the **values** in the **cssclasses** line
    - For example, change this:

        ```yaml
        ---
        cssclasses: value-1-of-2-on-one-line, value-2-of-2-on-one-line
        ---
        ```

    - To this:

        ```yaml
        ---
        cssclasses: [value-1-of-2-on-one-line, value-2-of-2-on-one-line]
        ---
        ```
