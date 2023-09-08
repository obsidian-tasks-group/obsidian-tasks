---
publish: true
---

# Templating

<span class="related-pages">#feature/scripting</span>

> [!released]
> Templating was introduced in Tasks X.Y.Z.

## Summary

- Tasks provides a templating facility to enable filters to access the location of the query file.
- Any known variable inside a pair of `{{` and `}}` strings is expanded to a value obtained from the query file's path.
- The available template strings are listed in [[Query Properties]].

## Checking template variables

The [[Explaining Queries|explain]] instruction shows how templates are interpreted. This can be used to understand how template variables are expanded.

For example, when the following query with [[Query Properties]] in [[Templating|template variables]] is placed in a tasks query block in the file `some/sample/file path.md`:  
  
<!-- snippet: DocsSamplesForExplain.test.explain_templating.approved.query.text -->  
```text  
explain  
path includes {{query.file.path}}  
root includes {{query.file.root}}  
folder includes {{query.file.folder}}  
filename includes {{query.file.filename}}  
```  
<!-- endSnippet -->  
  
the results begin with the following, which demonstrates how the template strings get expanded:  
  
<!-- snippet: DocsSamplesForExplain.test.explain_templating.approved.explanation.text -->  
```text  
Explanation of this Tasks code block query:  
  
path includes some/sample/file path.md  
  
root includes some/  
  
folder includes some/sample/  
  
filename includes file path.md  
```  
<!-- endSnippet -->

## Tasks

- [ ] #task Do something 1
- [ ] #task Do something 2
- [ ] #task Do something 3
- [ ] #task Do something 4

## Goals

- [x] #task Figure out where to insert the template expansion code ✅ 2023-05-02
- [ ] #task Explain to show the line with template, then the expanded line
- [ ] #task Must be able to test this stuff - can we use a TFile in tests?

## Symbols Supported

- `query.file.root`
- `query.file.path`
- `query.file.folder`
- `query.file.filename`

## Things to be aware of

## Known Limitations

- The symbols are case-sensitive:
  - `query.file.fileName` is not recognised
  - `path includes {{query.file.fileName}}` gives:
  - `Missing Mustache data property: query.file.fileName`
- Error handling
  - The reference to `Mustache` in error messages may be confusing??
  - Use of unrecognised symbols inside `{{ }}` is spotted, and the name is written out
  - But if you write `{{queryx.file.filename}}`, it doesn't get past `queryx`
  - So the error would be:
    - `Missing Mustache data property: queryx`
- If there is an error, the entire input string is written out, and it can be hard to spot the problem line
  - At the moment the whole query is checked as one string, so the error message contains the whole input, making any problem a little harder to space
- It complains about any unrecognised template values in comments, even though comments are then ignored
- explanations
  - `explain` instructions only show the expanded text
  - It would be nice to also show the original variable name, and then the expanded text
- use in regular expressions is allowed
  - but due to characters with special meanings in reg ex, it is not recommended to use them
- when you rename a file containing a tasks query block with variable names in, the query block is not updated

## Testing

- [ ] #task When user renames a file with a query block, confirm that the search is updated

## Example Search

```tasks
path includes Templating Experiments
path includes {{query.file.filename}}
limit 10
group by path
group by heading
description does not include {{query.file.filename}}
description does not include {{query.file.path}}

# Note cannot generally put arbitrary string in to regular expression,
# due to special meaning of some characters
# description regex does not match /^{{query.file.path}}$/
# explain
```

## Missing Features

- Searching by today's date or time
- Get date string from file names
