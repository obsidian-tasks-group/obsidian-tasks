# Updating documentation

The documentation resides under the [./docs](./docs) directory.
It consists of markdown files, which [Jekyll](https://jekyllrb.com/) will transform into web pages that you can view at <https://obsidian-tasks-group.github.io/obsidian-tasks/> .
In the simplest case, you can update the existing markdown file and create a pull request (PR) with your changes.

## Documentation and branches

For documentation changes to show up at <https://obsidian-tasks-group.github.io/obsidian-tasks/> , they must be in the `gh-pages` branch.
If you want to see your changes available immediately and not only after the next release, you should make your changes on the `gh-pages` branch.
When you create a PR, it should merge into the `gh-pages` branch as well.
If you document an unreleased feature, you should update the documentation on `main` instead. Ideally together with the related code changes.
If this is confusing, don't worry.
We will help you make this right once you opened the PR.

## Adding Tables of Contents to rendered docs

Add the following between the H1 and the first H2, to show a table of contents in a page on the published documentation.

```text
# Page Heading
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
```

## Omitting a heading from the page's Table of Contents

To omit a heading from the page's table of contents, put a `{: .no_toc }` line immediately after the heading.

## Linking to other pages in the docs

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

## Screenshots in documentation

### Creating screenshots

For readability and accessibility, images should be created:

- Set the Obsidian window size to be around 1500 pixels wide about between 700 and 1100 pixels high.
- Using the Default Obsidian theme.
- In the Light colour scheme.
- With a large font size.
- With as little blank or dead space as possible around the area of focus.

### Saving screenshots

Saving images:

- Save them in .PNG format.
- Save them in [docs/images/](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/images/).

### Adding screenshots to the documentation

When embedding an image inside a documentation page, please link to the local file and include a brief summary underneath.

For example, to embed the `acme.png` file in the documentation:

```text
![ACME Tasks](images/acme.png)
The `ACME` note has some tasks - as linked to from `docs/index.md`.
```

or

```text
![ACME Tasks](../images/acme.png)
The `ACME` note has some tasks - as linked to from any file in a sub-directory of `docs/`.
```

With this mechanism, you can preview the embedded images in any decent Markdown editor, including by opening the `obsidian-tasks` directory in Obsidian.

## Callouts

The following callout styles are available. There must be no blank line between the style name and the content.

```text
{: .warning }
I will be shown in red

{: .info }
I will be shown in blue

{: .released }
I will be shown in green
```

## Version numbers in documentation

We have introduced version markers to the documentation, to show users in which Tasks version a specific feature was introduced.
This means that newly written documentation should be tagged with a placeholder, which will be replaced with the actual
version upon release.

There are 2 styles of placeholders used through the documentation, Please pick the one that
fits your text better. (If in doubt, take a look at the existing version tags for other features.)

This placeholder is usually used after a section heading:

```text
{: .released }
Introduced in Tasks X.Y.Z.
```

This placeholder is used when you need to tag a sub-part of something, for example a list:

```text
{: .released }
X (Y and Z) was introduced in Tasks X.Y.Z.
```

## How the documentation is generated

We use [GitHub pages](https://pages.github.com/) for our documentation.
You can read more about it at their [official documentation](https://docs.github.com/en/pages).

To generate the documentation site on your machine,
see [docs/README.md](docs/README.md).
