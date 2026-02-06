---
publish: true
---

# Reviewing Pull Requests

<span class="related-pages">#pull-requests</span>

## Testing Plugin Changes

### All changes

- The incoming code is on a branch, and not on `main`.
- There is at least a first attempt at Jest tests for the changes in behaviour.
- There is at least a first version of edits to the user documentation.

### Any changes in `src/`

- Always build and test the Plugin
  - Think [Exploratory Testing](https://en.wikipedia.org/wiki/Exploratory_testing)
  - Look at the plugin from a user's perspective
  - Does it basically work as described?
  - Are there any easy ways to break it?
  - Do any new settings make sense - and are they clearly worded?
- Code patterns to avoid
  - Don't use `import moment from 'moment';`
  - Use `import { moment, Plugin } from 'obsidian';` and `window.moment()` instead

### Any changes in `docs/` or `contributing/`

- Always open the vault in Obsidian
  - Use the (installed) Broken Links plugin to check for broken links and embeds.
