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
- For example,:
  - `{{query.file.path}}` might get expanded to
  - `some/sample/actions on my hobby.md` - for any Tasks queries inside that file.
- The available values for use in template strings are listed in [[Query Properties]].

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
  
the results begin with the following, which demonstrates how each value inside `{{...}}` was expanded:  
  
<!-- snippet: DocsSamplesForExplain.test.explain_templating.approved.explanation.text -->  
```text  
Explanation of this Tasks code block query:  
  
path includes some/sample/file path.md  
  
root includes some/  
  
folder includes some/sample/  
  
filename includes file path.md  
```  
<!-- endSnippet -->

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
  - the workaround is to close and re-open the file containing the query.

## Missing Features

- Searching by today's date or time
- Get date string from file names

## Technical Details

The templating library used is [mustache.js](https://www.npmjs.com/package/mustache).
