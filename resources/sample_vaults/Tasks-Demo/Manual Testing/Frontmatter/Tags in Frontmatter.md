---
TAG:
  - value1
  - value2
ALIAS:
  - test 1
  - test 2
custom_list:
  - value 1
  - value 2
custom_list_2:
  - x
custom_number_prop: 42
unknown_property:
  - hello
  - world
unknown_property_2:
  - 1
  - 2
unknown_number_property: 13
unknown_empty_property:
unknown_list:
  -
  -
---

# Tags in Frontmatter

## See the frontmatter in YAML

The code-block below is a [js-engine](https://www.moritzjung.dev/obsidian-js-engine-plugin-docs/) script that displays the Obsidian's frontmatter - in JSON - currently in this file.

If you edit the frontmatter, click the `i` button at the top-right of the code-block, then `Rerun`.

```js-engine
const path = 'Manual Testing/Frontmatter/Tags in Frontmatter.md';

let tfile = app.vault.getAbstractFileByPath(path);
let cache = app.metadataCache.getFileCache(tfile);
let content = await app.vault.read(tfile);

let frontmatter = cache.frontmatter;

let markdownBuilder = engine.markdown.createBuilder();
jsonCodeBlock(frontmatter);

// Get the keys of the JSON object
const keys = Object.keys(frontmatter);
jsonCodeBlock(keys)

// TODO Iterate over the keys and construct a tidied-up frontmatter object.

markdownBuilder.createParagraph('`parseFrontMatterAliases(frontmatter)`:');
jsonCodeBlock(obsidian.parseFrontMatterAliases(frontmatter));

markdownBuilder.createParagraph('`parseFrontMatterTags(frontmatter)`:');
jsonCodeBlock(obsidian.parseFrontMatterTags(frontmatter));

function jsonCodeBlock(value) {
    markdownBuilder.createCodeBlock('json', JSON.stringify(value, null, 4));
}

function showParseFrontMatterEntry(entryName) {
    markdownBuilder.createParagraph('`parseFrontMatterEntry(frontmatter, "' + entryName + '")`:');
    jsonCodeBlock(obsidian.parseFrontMatterEntry(frontmatter, entryName));
}

showParseFrontMatterEntry('custom_list');
showParseFrontMatterEntry('custom_list');
showParseFrontMatterEntry('custom_list_2');
showParseFrontMatterEntry('custom_number_prop');
showParseFrontMatterEntry('unknown_property');
showParseFrontMatterEntry('unknown_property_2');
showParseFrontMatterEntry('unknown_number_property');
showParseFrontMatterEntry('unknown_empty_property');
showParseFrontMatterEntry('unknown_list');

return markdownBuilder;
```

---

## tag

### TAG: Two values - single line, unquoted

--- start-multi-column: ID_ipb8

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
TAG: value1, value2
---
```

--- column-break ---

```json
{
    "TAG": "value1, value2"
}
```

--- end-multi-column

### tag: Two values - single line, unquoted

--- start-multi-column: ID_0r8n

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
tag: value1, value2
---
```

--- column-break ---

```json
{
    "tag": "value1, value2"
}
```

--- end-multi-column

## tags

### tags: Two values - single line, unquoted

--- start-multi-column: ID_u689

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
tags: value1, value2
---
```

--- column-break ---

```json
{
    "tags": "value1, value2"
}
```

--- end-multi-column

### tags: Two values - separate lines

--- start-multi-column: ID_lenc

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
tags:
  - value1
  - value2
---
```

--- column-break ---

```json
{
    "tags": [
        "value1",
        "value2"
    ]
}
```

--- end-multi-column

### tags: Single value - sample line

--- start-multi-column: ID_8de1

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
tags: some-value
---
```

--- column-break ---

```json
{
    "tags": "some-value"
}
```

--- end-multi-column

### tags: Single value - separate line

--- start-multi-column: ID_w0ie

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
tags:
  - some-value
---
```

--- column-break ---

```json
{
    "tags": [
        "some-value"
    ]
}
```

--- end-multi-column

### tags: Empty tags line

--- start-multi-column: ID_y99h

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
tags:
---
```

--- column-break ---

```json
{
    "tags": null
}
```

--- end-multi-column

## no frontmatter

### Empty YAML

--- start-multi-column: ID_hb38

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
---
---
```

--- column-break ---

```json
undefined
```

--- end-multi-column

### No YAML

--- start-multi-column: ID_vgpw

```column-settings
Number of Columns: 2
Largest Column: standard
```

```yaml
```

--- column-break ---

```json
undefined
```

--- end-multi-column
