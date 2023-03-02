---
layout: default
title: Status Collections
nav_order: 1
parent: Reference
has_children: true
has_toc: true
---

# Status Collections

## Background

> [!success] Released
Custom statuses were introduced in Tasks 1.23.0.

You can control the behaviour of your tasks (such as what happens when you click on a checkbox), using Tasks' [Statuses]({{ site.baseurl }}{% link getting-started/statuses.md %}) feature.

<!-- force a blank line --> <!-- include: snippet-statuses-overview.md -->

> [!info]
> Broad steps to understand and set up Statuses (or "Alternate Checkboxes"):
>
> - Understand what Statuses are:
>   - [Statuses]({{ site.baseurl }}{% link getting-started/statuses.md %})
>   - [Custom Statuses]({{ site.baseurl }}{% link getting-started/statuses/custom-statuses.md %})
> - Choose your status styling scheme: this will determine the names and symbols for your custom statuses:
>   - Some common ones are shown in [Status Collections]({{ site.baseurl }}{% link reference/status-collections/index.md %})
> - Set up your status styling scheme
>   - [How to style custom statuses]({{ site.baseurl }}{% link how-to/style-custom-statuses.md %}).
> - Configure Tasks to use your custom statuses
>   - [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %})
> - Optionally, update your tasks searches to take advantage of the new flexibility
>   - [Filters for Task Statuses]({{ site.baseurl }}{% link queries/filters.md %}#filters-for-task-statuses)

<!-- force a blank line --> <!-- endInclude -->

The theme and snippet authors generally refer to this as 'custom checkboxes'.

Tasks only knows how to display two core statuses, `[space]` and `[x]`.

So before setting up custom statuses, you need to decide which CSS Snippet or Theme to adopt. This section will help with that.

## The Options

### Your current Theme or CSS Snippet

If you are already happy with a Theme or CSS Snippet that supports custom checkboxes, you can stop reading this section, and move on to configuring Tasks to use it: see [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %}).

### Selecting a Theme or CSS Snippet

Tasks provides easy one-click set up of all the Themes and CSS Snippets in the 'Table of Contents' below.

### Our recommendation: SlRvb’s Alternate Checkboxes

If you are unsure which to use, we recommend using a CSS Snippet rather than a Theme:

- Themes are very opinionated about lots of aspects of presenting your markdown.
- CSS Snippets can generally be used with a wide variety of Themes, so they keep your options a lot more open.

The very widely used [SlRvb’s Alternate Checkboxes]({{ site.baseurl }}{% link reference/status-collections/slrvb-alternate-checkboxes-snippet.md %}) snippet is excellent, and we recommend starting with that.

However, you can also browse through the pages in this section, to see the other options that Tasks is aware of.

## Coming soon

We plan to add one-click support for these themes in a future release:

- [LYT Mode](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.05+All+Community+Expansions/Themes/LYT+Mode)

## Supported CSS Snippets and Themes

See the table of contents below.
