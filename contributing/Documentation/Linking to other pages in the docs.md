# Linking to other pages in the docs

> [!Note]
> This page is about the original user documentation setup, published using #jekyll on #github-pages.

Linking to other pages in the documentation is non-obvious and a bit tedious.

Here are some examples to copy-and-paste:

To pages:

```text
[‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %})
[Dates]({{ site.baseurl }}{% link getting-started/dates.md %})
[Filters]({{ site.baseurl }}{% link queries/filters.md %})
[Global Filter]({{ site.baseurl }}{% link getting-started/global-filter.md %})
[Priorities]({{ site.baseurl }}{% link getting-started/priority.md %})
[Recurring Tasks]({{ site.baseurl }}{% link getting-started/recurring-tasks.md %})
```

To sections:

```text
[due]({{ site.baseurl }}{% link getting-started/dates.md %}#-due)
[scheduled]({{ site.baseurl }}{% link getting-started/dates.md %}#-scheduled)
[start]({{ site.baseurl }}{% link getting-started/dates.md %}#-start)
```
