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

### Pasting screenshots

You can paste images in to Obsidian notes directly. The `docs/` vault is configured to put new images in to the correct folder.

Please give them a meaningful name.

## Adding screenshots to the documentation

> [!warning]
> This section needs to be updated to record how to embed images after the move to Publish, including:
>
> - how to ensure that missing descriptions are provided
> - how to work well with screen readers

When embedding an image inside a documentation page, please link to the local file and include a brief summary underneath.

For example, to embed the `acme.png` file in the documentation:

```text
![ACME Tasks](acme.png)
The `ACME` note has some tasks.
```

In order to not have to update paths when notes are moved around, we prefer not to include the relative path to the image.
