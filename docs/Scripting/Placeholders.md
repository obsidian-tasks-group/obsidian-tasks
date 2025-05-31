---
publish: true
---

# Placeholders

<span class="related-pages">#feature/scripting</span>

> [!released]
> Placeholders were introduced in Tasks 4.7.0.

## Summary

- Tasks provides a placeholder facility to enable filters to access the location of the query file.
- Any known property inside a pair of `{{` and `}}` strings is expanded to a value obtained from the query file's path.
- For example,:
  - `{{query.file.path}}` might get expanded to
  - `some/sample/actions on my hobby.md` - for any Tasks queries inside that file.
- The available values for use in placeholders are listed in [[Query Properties]].
- Placeholders also provide the ability to write [[Comments#Inline comments|Inline comments]].

## Checking placeholder values

The [[Explaining Queries|explain]] instruction shows how any placeholders in the query are interpreted. This can be used to understand how placeholders are expanded generally.

For example, when the following query with [[Query Properties]] in [[Placeholders|placeholders]] is placed in a tasks query block in the file `some/sample/file path.md`:

<!-- snippet: DocsSamplesForExplain.test.explain_placeholders.approved.query.text -->
```text
explain
path includes {{query.file.path}}
path includes {{query.file.pathWithoutExtension}}
root includes {{query.file.root}}
folder includes {{query.file.folder}}
filename includes {{query.file.filename}}
filename includes {{query.file.filenameWithoutExtension}}

description includes Some Cryptic String {{! Inline comments are removed before search }}
```
<!-- endSnippet -->

the results begin with the following, which demonstrates how each value inside `{{...}}` was expanded:

<!-- snippet: DocsSamplesForExplain.test.explain_placeholders.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

  path includes {{query.file.path}} =>
  path includes some/sample/file path.md

  path includes {{query.file.pathWithoutExtension}} =>
  path includes some/sample/file path

  root includes {{query.file.root}} =>
  root includes some/

  folder includes {{query.file.folder}} =>
  folder includes some/sample/

  filename includes {{query.file.filename}} =>
  filename includes file path.md

  filename includes {{query.file.filenameWithoutExtension}} =>
  filename includes file path

  description includes Some Cryptic String {{! Inline comments are removed before search }} =>
  description includes Some Cryptic String
```
<!-- endSnippet -->

## Using Query Properties in Placeholders

> [!released]
> Use of Obsidian properties in placeholders was introduced in Tasks 7.15.0.

It is now possible to use properties in the query file. See [[Obsidian Properties#Using Query Properties in Searches]]

## Using preset.xxx

You can do the following:

```text
{{preset.my_snippet_from_settings}}
```

See also [[Presets]].

## Error checking: invalid variables

If there are any unknown properties in the placeholders, a clear message is written.

For example, the following shows that the names of query properties are case-sensitive:

<!-- snippet: DocsSamplesForExplain.test.explain_placeholders_error.approved.query.text -->
```text
# query.file.fileName is invalid, because of the capital N.
# query.file.filename is the correct property name.
filename includes {{query.file.fileName}}
```
<!-- endSnippet -->

... generates this output:

```text
Tasks query: There was an error expanding one or more placeholders.

The error message was:
    Unknown property: query.file.fileName

The problem is in:
    filename includes {{query.file.fileName}}
```

%% ---------------------------------------------------------------------------
IF THIS TEXT CHANGES, IT MEANS THE HARD-CODED OUTPUT ABOVE NEEDS TO BE UPDATED:

<!-- snippet: DocsSamplesForExplain.test.explain_placeholders_error.approved.explanation.text -->
```text
Explanation of this Tasks code block query:

Query has an error:
There was an error expanding one or more placeholders.

The error message was:
    Unknown property: query.file.fileName

The problem is in:
    filename includes {{query.file.fileName}}
```
<!-- endSnippet -->
--------------------------------------------------------------------------- %%

## Things to be aware of

- The symbols are case-sensitive:
  - `query.file.fileName` is not recognised
- When placeholders are used in custom filters and groups, they must be surrounded by quotes.
  - For example: `'{{query.file.folder}}'`

## Known Limitations

- It complains about any unrecognised placeholders in comments, even though comments are then ignored.
- Use in regular expressions is allowed
  - but due to [[Regular Expressions#Special characters|characters with special meanings]] in regular expressions, it is not recommended to use them.

## Missing Features

- Searching by today's date or time
- Getting date strings from file names

## Technical Details

- The templating library used is [mustache.js](https://www.npmjs.com/package/mustache).
- Error-checking to detect use of unknown variables is implemented via [mustache-validator](https://www.npmjs.com/package/mustache-validator).
