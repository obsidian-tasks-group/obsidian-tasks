---
publish: true
---

# Overview of the translation setup

<span class="related-pages">#i18n</span>

## Tools used

- [i18next](https://www.i18next.com)
  - i18next is an **internationalization-framework** written in and for JavaScript.
- [i18next-parser](https://github.com/i18next/i18next-parser)
  - When translating an application, maintaining the translation catalog by hand is painful. This package parses your code and automates this process, making sure that every locale file contains all the translation strings in the application.
- WebStorm
  - [Easy I18n](https://plugins.jetbrains.com/plugin/16316-easy-i18n) plugin.

## Files used in translation code

- [src/i18n/i18n.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/i18n.ts)
- [src/i18n/locales/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/i18n/locales) `*.json`
- [i18next-parser.config.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/i18next-parser.config.js)

## Translation key names

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

## Translation scripts

The following `yarn` script runs [i18next-parser](https://github.com/i18next/i18next-parser) to ensure that every locale `.json` file contains placeholders for all translatable strings.

```bash
yarn extract-i18n
```
