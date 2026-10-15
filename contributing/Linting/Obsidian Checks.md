---
publish: true
---

# Obsidian Checks

<span class="related-pages">#linting</span>

## Motivation

The Obsidian team runs checks on plugin releases. If serious problems are found, the plugin is withdrawn from the community list.

We want to discover such (rare) problems as early as possible.

## Introduction

The [obsidian-checks.yml](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/.github/workflows/obsidian-checks.yml) workflow attempts to reproduce the [Tasks Scorecard](https://community.obsidian.md/plugins/obsidian-tasks-plugin) results on all Pull Requests on this project.

You can see its [recent results](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/obsidian-checks.yml).

## Results

### Interpreting the results

Click on the "Summary" link for the action run.

You will see a section called "validate summary", beginning "Obsidian workflow results".

- **Fix required**:
  - Any rows with **Severity** = **error**.
- **Ignore**:
  - the **Status** column, and any of its 'failed' values.
  - the entire **scanner-stylelint** section.

### Saving the results

In the "validate summary" section, click on the "..." and select "View raw markdown".

You can then copy the raw Markdown, for example, to annotate it or track progress on it.

## Implementation

See <https://github.com/obsidianmd/obsidian-workflows>.
