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
parent:
  - child1:
    - grandchild1: 1
    - grandchild2: 2
  - child2:
    - grandchild3: 3
    - grandchild4: 4
---

# Tags in Frontmatter

- #tag-in-body
- #another-tag

## See the frontmatter in YAML

The code-block below is a [js-engine](https://www.moritzjung.dev/obsidian-js-engine-plugin-docs/) script that displays the Obsidian's frontmatter - in JSON - currently in this file.

If you edit the frontmatter, click the `i` button at the top-right of the code-block, then `Rerun`.

```js-engine
let markdownBuilder = engine.markdown.createBuilder();

const path = 'Manual Testing/Frontmatter/Tags in Frontmatter.md';

let tfile = app.vault.getAbstractFileByPath(path);
let cache = app.metadataCache.getFileCache(tfile);
let content = await app.vault.read(tfile);

// -------------------------------------------------------------------------
markdownBuilder.createHeading(3, '`CachedMetadata`');
jsonCodeBlock(cache)

// -------------------------------------------------------------------------
markdownBuilder.createHeading(3, 'get frontmatter text via `getFrontMatterInfo()`');
markdownBuilder.createParagraph( 'needs v.1.5.7 - released publicly in 1.5.8 on February 22, 2024');

// v.1.5.7 getFrontMatterInfo()
let frontmatterInfo = obsidian.getFrontMatterInfo(content);
markdownBuilder.createParagraph('`getFrontMatterInfo(content)`:');
jsonCodeBlock(frontmatterInfo)

// v0.11.11 parseYaml()
let parseYamlSays = obsidian.parseYaml(frontmatterInfo.frontmatter)
markdownBuilder.createParagraph('`parseYaml(frontmatterInfo.frontmatter)`:');
jsonCodeBlock(parseYamlSays)

// -------------------------------------------------------------------------
markdownBuilder.createHeading(3, 'get frontmatter text via `metadataCache` and `parseYaml()`');
markdownBuilder.createParagraph( 'should probably work with any version of Obsidian over the last couple of years???');

// TODO check its type is 'yaml'
let section = cache.sections[0];
let manualMetadataContent = content.slice(section.position.start.offset, section.position.end.offset)
markdownBuilder.createParagraph('metadata content via metadataCache:');
jsonCodeBlock(manualMetadataContent);

// Need to strip off first and last line
// TODO Make this work with lines longer than '---'
let manualMetadataContentStripped = manualMetadataContent.split('\n').filter((l) => l !== '---').join('\n')
markdownBuilder.createParagraph('metadata content via metadataCache - stripped of leading ---:');
jsonCodeBlock(manualMetadataContentStripped);

let parseYamlSays2 = obsidian.parseYaml(manualMetadataContentStripped);
markdownBuilder.createParagraph('`parseYaml(manualMetadataContentStripped)`:');
jsonCodeBlock(parseYamlSays2)

// -------------------------------------------------------------------------
markdownBuilder.createHeading(3, 'get all tags');
let allTags = obsidian.getAllTags(cache);
markdownBuilder.createParagraph('`getAllTags(cache)`:');
jsonCodeBlock(allTags)

// -------------------------------------------------------------------------
markdownBuilder.createHeading(3, 'get frontmatter manually');

let frontmatter = cache.frontmatter;
markdownBuilder.createParagraph('`cache.frontmatter`:');
jsonCodeBlock(frontmatter);

// Get the keys of the JSON object
const keys = Object.keys(frontmatter);
markdownBuilder.createParagraph('`Object.keys(frontmatter)`:');
jsonCodeBlock(keys)

// TODO Iterate over the keys and construct a tidied-up frontmatter object.

// v0.9.16 parseFrontMatterAliases()
markdownBuilder.createParagraph('`parseFrontMatterAliases(frontmatter)`:');
jsonCodeBlock(obsidian.parseFrontMatterAliases(frontmatter));

// v0.9.16 parseFrontMatterTags()
markdownBuilder.createParagraph('`parseFrontMatterTags(frontmatter)`:');
jsonCodeBlock(obsidian.parseFrontMatterTags(frontmatter));

function jsonCodeBlock(value) {
    markdownBuilder.createCodeBlock('json', JSON.stringify(value, null, 4));
}

return markdownBuilder;
```
