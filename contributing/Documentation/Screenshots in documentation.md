# Screenshots in documentation

## Creating screenshots

For readability and accessibility, images should be created:

- Set the Obsidian window size to be around 1500 pixels wide about between 700 and 1100 pixels high.
- Using the Default Obsidian theme.
- In the Light colour scheme.
- With a large font size.
- With as little blank or dead space as possible around the area of focus.

## Saving screenshots

Saving images:

- Save them in .PNG format.
- Save them in [docs/images/](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/images/).

## Adding screenshots to the documentation

> [!Note]
> This section is about the original user documentation setup, published using #jekyll on #github-pages.

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
