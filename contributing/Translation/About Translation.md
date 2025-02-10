---
publish: true
---

# About Translation

<span class="related-pages">#i18n</span>

> [!Danger] This page is under development
> For now, it is a list of things to remember to record.

Since Tasks X.Y.Z, we are gradually migration most user-visible text in to a translation framework - also know as internationalisation or i18n.

- [[Overview of the translation setup]]
- [[Make strings translatable]]
- [[Set up WebStorm for translation work]]
- [[Set up Visual Studio Code for translation work]]

## Translate a new string

<span class="related-pages">#i18n</span>

TODO...

## Support a new language

<span class="related-pages">#i18n</span>

These are the steps required to add support for a new language.

### Configure the new language

1. Decide on the language code to be used.
    - See [How should the language codes be formatted?](https://www.i18next.com/how-to/faq#how-should-the-language-codes-be-formatted)
2. Add the language code to `locales` in [i18next-parser.config.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/i18next-parser.config.js).
3. Create the json file that will contain translations:

    ```bash
    yarn extract-i18n
    ```

    For example, if adding `de`, this file would be created: `src/i18n/locales/de.json`

4. Add the language to `import` and `resources` in  [src/i18n/i18n.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/i18n.ts)

### Add translations for the new language

1. Optionally, paste `en.json` in to  <https://translate.i18next.com>, to get an initial translation.
2. Get a human to open `en.json` and the new file, for example `de.json` , side by side, and add the translations to the new file.

## Contribute translations

<span class="related-pages">#i18n</span>

TODO...

We will find a website to make it easy to add new translations.
