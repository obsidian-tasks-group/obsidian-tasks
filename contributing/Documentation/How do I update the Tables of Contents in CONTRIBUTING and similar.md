# How do I update the Tables of Contents in CONTRIBUTING and similar?

These are markdown files written for contributors, and intended to be viewed on GitHub.
To make it easy to see their structure, they have a machine-generated Table of Contents ("ToC").

The ToCs will eventually be automated automatically via GitHub Actions, but for now, the following needs to be done in order to update them:

1. Install [MarkdownSnippets](https://github.com/SimonCropp/MarkdownSnippets), also known as `mdsnippets`
2. Run:

```bash
mdsnippets && yarn run lint:markdown && git add --renormalize .
```

The background to this is in [PR #1248](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1248).

<!-- markdownlint-enable MD024 -->
<!--                     MD024/no-duplicate-heading/no-duplicate-header Multiple headings with the same content -->
