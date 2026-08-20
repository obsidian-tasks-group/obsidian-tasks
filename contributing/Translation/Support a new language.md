---
publish: true
---

# Support a new language

<span class="related-pages">#i18n</span>

These are the steps required to add support for a new language and submit it in a pull request.

## Add the new language

1. Fork the Tasks repo, or synchronise your fork.
2. Create a branch.
3. Decide on the language code to be used.
    - Use the same Language codes as Obsidian: see [Existing languages](https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages)
4. Copy [src/i18n/locales/en.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/locales/en.json) to a new file in [src/i18n/locales/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/i18n/locales).
    - For example, if adding `de`, create `src/i18n/locales/de.json`.
5. Translate the strings in the new file.
6. Add the language code to [i18next-parser.config.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/i18next-parser.config.js).
7. Add the language to `import` and `resources` in [src/i18n/i18n.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/i18n.ts).
8. When you have finished, commit the changes. Use the prefix `i18n:` on the commit message.
9. Create a pull request.

## Getting help

Use this discussion on GitHub [Contribute to translating the Tasks plugin in to non-English languages](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/3321) to discuss this process and get help.
