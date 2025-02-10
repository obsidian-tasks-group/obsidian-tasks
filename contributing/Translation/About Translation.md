---
publish: true
---

# About Translation

<span class="related-pages">#i18n</span>

> [!Danger] This page is under development
> For now, it is a list of things to remember to record.

Since Tasks X.Y.Z, we are gradually migration most user-visible text in to a translation framework - also know as internationalisation or i18n.

## Overview of the translation setup

<span class="related-pages">#i18n</span>

### Tools used

- [i18next](https://www.i18next.com)
  - i18next is an **internationalization-framework** written in and for JavaScript.
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)
  - This is an i18next language detection plugin used to detect the user's language automatically.
- [i18next-parser](https://github.com/i18next/i18next-parser)
  - When translating an application, maintaining the translation catalog by hand is painful. This package parses your code and automates this process, making sure that every locale file contains all the translation strings in the application.
- WebStorm
  - [Easy I18n](https://plugins.jetbrains.com/plugin/16316-easy-i18n) plugin.

### Files used in translation code

- [src/i18n/i18n.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/i18n.ts)
- [src/i18n/locales/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/i18n/locales) `*.json`
- [i18next-parser.config.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/i18next-parser.config.js)

### Translation key names

You can see the currently-used key names in:

[src/i18n/locales/en.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/locales/en.json)

Here, they are nested, for example:

```json
{
  "modals": {
    "customStatusModal": {
      "editAvailableAsCommand": {
        "name": "Available as command"
      },
    },
  },
}
```

The value of that string is obtained in code with:

```ts
i18n.t('modals.customStatusModal.editAvailableAsCommand.name')
```

In WebStorm with the Easy I18n plugin configured, hovering over that `i18n.t()` will show you the expanded text.

### Translation scripts

The following `yarn` script runs [i18next-parser](https://github.com/i18next/i18next-parser) to ensure that every locale `.json` file contains placeholders for all translatable strings.

```bash
yarn extract-i18n
```

## Make strings translatable

<span class="related-pages">#i18n</span>

> [!Warning] Do not extract strings by hand
> It is just too time-consuming and too error-prone.
> Find a tool in your IDE that will allow you to select text, give it a label and extract it to all languages.

The flow for adding a new translation value - in WebStorm...

Scenarios/topics:

- Simple string
- Simple string with interpolation
- Beware of extra backticks
- `yarn extract-i18n`

## Set up WebStorm for translation work

<span class="related-pages">#i18n</span>

Install and configure the [Easy I18n](https://plugins.jetbrains.com/plugin/16316-easy-i18n) plugin.

- Action for extracting strings
- Table and tree view
  - Meaning of red text
  - Meaning of orange text

![Screenshot showing WebStorm Easy I18n plugin settings](WebStorm%20Easy%20I18n%20plugin%20settings.png)
<span class="caption">Screenshot showing WebStorm Easy I18n plugin settings</span>

## Set up Visual Studio Code for translation work

<span class="related-pages">#i18n</span>

TODO...

Contributions welcomed, to populate this page.

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
