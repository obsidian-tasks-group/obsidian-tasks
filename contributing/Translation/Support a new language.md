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
4. Add the language code to `locales` in [i18next-parser.config.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/i18next-parser.config.js).
5. Create the json file that will contain translations:

    ```bash
    yarn extract-i18n
    ```

   For example, if adding `de`, this file would be created: `src/i18n/locales/de.json`

6. Add the language to `import` and `resources` in [src/i18n/i18n.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/i18n.ts).

## Add translations for the new language

1. Optionally, paste `en.json` in to <https://translate.i18next.com>, to get an initial translation.
2. Open `en.json` and the new file, for example `de.json`, side by side, and add the translations to the new file.
3. When you have finished, commit the changes. Use the prefix `i18n:` on the commit message.
4. Create a pull request.

## Getting help

Use this discussion on GitHub [Contribute to translating the Tasks plugin in to non-English languages](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/3321) to discuss this process and get help.
