---
layout: default
title: Custom Statuses
parent: Statuses
grand_parent: Getting Started
has_toc: false
---

# Custom Statuses

## Introduction

{: .released }
Custom Statuses were introduced in Tasks 1.23.0.

Custom statuses represent any non-standard markdown tasks.

Here are some tasks with example custom statuses, that is, with non-standard characters between the `[` and `]`:

```text
- [X] Checked
- [-] A dropped/cancelled task
- [?] A question
- [/] A Half Done/In-progress task
```

They **require custom CSS styling or theming** in order to display correctly in Tasks blocks or Live Preview.

Here's the kind of thing that you can do with custom statuses and styling:

![Selection of checkboxes from Minimal theme](../../images/theme-minimal-reading-view-sample.png) ![Selection of checkboxes from ITS theme](../../images/theme-its-reading-view-sample.png)

## What's the Big Deal?

People have been using themes and CSS snippets to style custom checkboxes in Obsidian all along.

What Tasks's custom statuses allow you to do is to **also customise the behaviour of your tasks**.

## Default custom statuses

This is what the Custom Statuses look like initially in Tasks' settings, showing the two custom statuses that Tasks provides by default:

![Default custom statuses](../../images/settings-custom-statuses-initial.png)

And this is how you can use them:

<!-- placeholder to force blank line before included text --> <!-- include: DocsSamplesForStatuses.test.DefaultStatuses_custom-statuses.approved.md -->

| Status Symbol | Next Status Symbol | Status Name<br>`status.name includes...`<br>`sort by status.name`<br>`group by status.name` | Status Type<br>`status.type is...`<br>`sort by status.type`<br>`group by status.type` | Needs Custom Styling |
| ----- | ----- | ----- | ----- | ----- |
| `/` | `x` | In Progress | `IN_PROGRESS` | Yes |
| `-` | `space` | Cancelled | `CANCELLED` | Yes |

<!-- placeholder to force blank line after included text --> <!-- endInclude -->

## Setting up your custom statuses

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

### First choose your styling scheme

You can use any snippet or theme you wish. If you are already using a snippet or theme that supports "custom checkboxes", you should stick with that.

If, however, you are using the default theme, or a theme that doesn't know style "custom checkboxes", you will need to pick one.

[Status Collections]({{ site.baseurl }}{% link reference/status-collections/index.md %}) has a list of the ones that Tasks already has one-click support for, to help you choose.

### Install your styling scheme

For example, you could follow [How to style custom statuses]({{ site.baseurl }}{% link how-to/style-custom-statuses.md %}).

### Editing custom statuses

Your choice of styling facility will determine which letters and characters you wish to you in your custom statuses.

Now you can follow [How to set up your custom statuses]({{ site.baseurl }}{% link how-to/set-up-custom-statuses.md %}).

Or you can read about [Status Settings]({{ site.baseurl }}{% link getting-started/statuses/status-settings.md %}), and see how to [edit a Status]({{ site.baseurl }}{% link getting-started/statuses/editing-a-status.md %}).

{: .warning }
Remember to set up your chosen CSS Snippet or Theme before setting up the custom statuses.
