---
layout: default
title: How to style backlinks
nav_order: 2
parent: How Tos
---

# How to style backlinks

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Motivation and assumptions

In Tasks results, by default each task is displayed with its filename,
and the name of the previous heading, for example `(ACME > Steps to world domination)`.
This is called a **backlink**.

If you don't like how backlinks look, this guide shows how you can modify their appearance.

We assume that you know how to [use CSS snippets in Obsidian](https://help.obsidian.md/How+to/Add+custom+styles#Use+Themes+and+or+CSS+snippets).

## Default backlink style

Here is an example task block that does not hide any components of the output: sometimes you want to see all the information in each task.

    ```tasks
    not done
    description includes trash
    ```

This screenshot shows what this might look like, with some sample data:

![Tasks with vanilla backlink styles](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-add-backlink-style-examples-2/resources/screenshots/backlinks-default-style.png)

Notice that the backlinks (the blue file and heading names) can quite dominate the results, visually.

## Built-in options

We could use `hide backlink`, but then we would lose the ability to navigate to the source file.

We could also use `short mode`, which would replace the backlink text with an icon, but this would hide all the other properties of the task, such as due date and recurrence.

## Using CSS to de-emphasize the backlinks

We can de-emphasize the text in the backlinks, with [this CSS snippet](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/docs-add-backlink-style-examples-2/resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-backlinks-small-grey.css):

    /* By David Phillips (autonia) https://github.com/autonia
       From https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/622#discussioncomment-2649299
    */
    .tasks-backlink {
        font-size: 0.7em;
        opacity: 0.6;
        filter: grayscale(60%);
    }

Which gives us this result:

![Tasks with small grey backlinks](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-add-backlink-style-examples-2/resources/screenshots/backlinks-snippet-tasks-plugin-backlinks-small-grey.png)

## Using CSS to replace the backlinks with icons

Or we can replace the backlink text with an icon, with [this CSS snippet](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/docs-add-backlink-style-examples-2/resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-backlinks-icon.css):

    /* By Anna Kornfeld Simpson (@AnnaKornfeldSimpson) https://github.com/AnnaKornfeldSimpson
       From https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/834#discussioncomment-3028600
    */
    li.plugin-tasks-list-item > span.tasks-backlink > a {
        content: url(https://github.githubassets.com/images/icons/emoji/unicode/1f517.png);
        height: .9em;
    }

Which gives us this result:

![Tasks with icons for backlink](https://github.com/obsidian-tasks-group/obsidian-tasks/raw/docs-add-backlink-style-examples-2/resources/screenshots/backlinks-snippet-tasks-plugin-backlinks-icon.png)
