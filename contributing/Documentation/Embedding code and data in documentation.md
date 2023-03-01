# Embedding code and data in documentation

## MarkdownSnippets/mdsnippets

The [MarkdownSnippets](https://github.com/SimonCropp/MarkdownSnippets) tool, also known as `mdsnippets`, is a [dotnet tool](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools) that extract snippets from code files and merges them into Markdown documents.

Examples of things it can embed:

- Code samples
- Whole files, such as CSS files
- Machine-generated `.md` and `.txt` files written by unit tests for the purpose of embedding in documentation.

### Running mdsnippets

This process will eventually be automated automatically via GitHub Actions, but for now, the following needs to be done in order to run mdsnippets:

1. Install [MarkdownSnippets](https://github.com/SimonCropp/MarkdownSnippets), also known as `mdsnippets`
2. Run:

```bash
mdsnippets && yarn run lint:markdown && git add --renormalize .
```

The above hard-won command line is to make sure that the output:

- conforms to our `markdownlint` configuration
- has the correct line endings on macOS

The background to this is in [PR #1248](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1248).

### Configuring mdsnippets

The configuration file for mdsnippets is:

- [mdsnippets.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/mdsnippets.json)

## Adding new mdsnippets-maintained docs content

### Embedding a whole file as a code block, with 'snippet:'

1 **Add 'snippet:' instruction to embed the file**

For example:

- `snippet: ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json`

2 **Run mdsnippets to expand the 'snippet:' line**

Run `mdsnippets` - see [[#Running mdsnippets]]

Your `include: ...` line will be converted to this:

<!-- snippet: ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json -->
```json
{
  "name": "fred",
  "age": 30
}
```
<!-- endSnippet -->

Notice how the above has syntax highlighting, as the `.json` file extension on the included file was used as the language in the generated code block.

### Embedding a whole file as a code block, with 'include:'

1 **Add 'include:' instruction to embed the file**

For example:

- `include: ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json`

2 **Run mdsnippets to expand the 'include:' line**

Run `mdsnippets` - see [[#Running mdsnippets]]

Your `include: ...` line will be converted to this:

{ <!-- include: ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json -->
  "name": "fred",
  "age": 30
} <!-- endInclude -->

### Embedding files in .obsidian folders by path

mdsnippets normally only needs a filename, and not a full path, for any included files.

However, for files in hidden directories, the full path is required.

So this:

- `snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-backlinks-small-grey.css`

Generates this:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-backlinks-small-grey.css -->
```css
/* By David Phillips (autonia) https://github.com/autonia
   From https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/622#discussioncomment-2649299
*/
.tasks-backlink {
    font-size: 0.7em;
    opacity: 0.6;
    filter: grayscale(60%);
}
```
<!-- endSnippet -->

> [!Warning] Browser issue?
> You should see 3 lines of comments at the top of the above sample, starting `/* By David Phillips...`
> If you see 3 empty grey lines, your browser is for some reason hiding the comments, and for this page to be any use, you will unfortunately need to find a different browser.

### Embedding parts of files

This section describes how to embed a section/snippet of source file in to Markdown, for easy writing of documentation, and keeping the docs up-to-date.

1 **Label the snippet with 'begin-snippet:' and 'end-snippet'**

Think of a descriptive name for your snippet (file segment), and then surround it with two comments:

- `begin-snippet: unique-name-of-snippet-across-your-repo`
- `end-snippet`

  For example:

 ```ts
     // begin-snippet: approval-test-as-text
     test('SimpleVerify', () => {
         verify('Hello From Approvals');
     });
     // end-snippet
 ```

2 **Put a 'snippet:' line in the documentation**

In a Markdown documentation file, add a line `snippet: unique-name-of-snippet-across-your-repo`

- For example:

 ```text
 snippet: approval-test-as-text
 ```

3 **Run mdsnippets to expand the 'snippet:' line**

Run `mdsnippets` - see [[#Running mdsnippets]]

Your `snippet: ...` line will be converted to this:

````markdown

<!-- snippet: approval-test-as-text -->
```ts
test('SimpleVerify', () => {
    verify('Hello From Approvals');
});
```
<!-- endSnippet -->

````

The HTML comments contain enough information for mdsnippets to be able to find the snippet file on each run, and update the Markdown if the included file changes.

## Example

This page in the Tasks docs is almost entirely generated from content embedded with mdsnippets:

- [ITS Theme](https://obsidian-tasks-group.github.io/obsidian-tasks/reference/status-collections/its-theme/).

Maintaining that amount of information, for multiple themes, would be an error-prone nightmare.

### The Inputs

The following test source file exists purely to write out files for embedding in the documentation.

- [DocsSamplesForStatuses.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocsSamplesForStatuses.test.ts)

For the ITS theme, the above tests generate these `*.approved.*` files, using [[Approval Tests]]:

- [tests/DocsSamplesForStatuses.test.Theme_ITS Table.approved.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocsSamplesForStatuses.test.Theme_ITS%20Table.approved.md)
- [tests/DocsSamplesForStatuses.test.Theme_ITS Tasks.approved.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocsSamplesForStatuses.test.Theme_ITS%20Tasks.approved.md)
- [tests/DocsSamplesForStatuses.test.Theme_ITS Text.approved.txt](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DocsSamplesForStatuses.test.Theme_ITS%20Text.approved.txt)

And mdsnippets then embeds the above `*.approved.*` in to the source file.

### The documentation file

The source file for the [ITS Theme](https://obsidian-tasks-group.github.io/obsidian-tasks/reference/status-collections/its-theme/) page is:

- [slrvb-alternate-checkboxes-snippet.md](https://raw.githubusercontent.com/obsidian-tasks-group/obsidian-tasks/main/docs/reference/status-collections/slrvb-alternate-checkboxes-snippet.md)

Notice the `<!-- snippet:` and `<!-- include:` sections.
