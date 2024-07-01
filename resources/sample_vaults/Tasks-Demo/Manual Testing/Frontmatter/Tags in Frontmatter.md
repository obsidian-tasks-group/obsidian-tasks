---
TAG: value1, value2
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
markdownBuilder.createCodeBlock('json', JSON.stringify(frontmatter, null, 4));
return markdownBuilder;
```

---

## tag

### TAG: Two values - single line, unquoted

```yaml
---
TAG: value1, value2
---
```

=>

```json
tag: Two values - single line, unquoted
```

### tag: Two values - single line, unquoted

```yaml
---
tag: value1, value2
---
```

=>

```json
{
    "tag": "value1, value2"
}
```

## tags

### tags: Two values - single line, unquoted

```yaml
---
tags: value1, value2
---
```

=>

```json
{
    "tags": "value1, value2"
}
```

### tags: Two values - separate lines

```yaml
---
tags:
  - value1
  - value2
---
```

=>

```json
{
    "tags": [
        "value1",
        "value2"
    ]
}
```

### tags: Single value - sample line

```yaml
---
tags: some-value
---
```

=>

```json
{
    "tags": "some-value"
}
```

### tags: Single value - separate line

```yaml
---
tags:
  - some-value
---
```

=>

```json
{
    "tags": [
        "some-value"
    ]
}
```

### tags: Empty tags line

```yaml
---
tags:
---
```

=>

```json
{
    "tags": null
}
```

## no frontmatter

### Empty YAML

```yaml
---
---
```

=>

```json
undefined
```

### No YAML

```yaml
```

=>

```json
undefined
```

---

==Template:==

### Template

```yaml
```

=>

```json
```
