---
publish: true
---

# Support a new language

<span class="related-pages">#i18n</span>

These are the steps required to add a new translation language, including all files that must be changed in a pull request.

## Configure the new language

1. Decide on the language code to be used.
    - Use the same Language codes as Obsidian: see [Existing languages](https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages)
2. Add the language code to `locales` in [i18next-parser.config.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/i18next-parser.config.js).
3. Create the json file that will contain translations:

    ```bash
    yarn extract-i18n
    ```

   For example, if adding `de`, this file would be created: `src/i18n/locales/de.json`

4. Add the language to `import` and `resources` in [src/i18n/i18n.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/i18n.ts).
5. Commit these changes, along with the new translation file, and include them in your pull request.

## Add translations for the new language

1. Optionally, paste `en.json` in to <https://translate.i18next.com>, to get an initial translation.
2. Get a human to open `en.json` and the new file, for example `de.json`, side by side, and add the translations to the new file.
    - See [[Contribute translations]].
