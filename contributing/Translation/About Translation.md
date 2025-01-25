---
publish: true
---

# About Translation

> [!Danger] This page is under development
> For now, it is a list of things to remember to record.

Since Tasks X.Y.Z, we are gradually migration most user-visible text in to a translation framework - also know as internationalisation or i18n.

Topics - likely to be broken out in to separate pages:

- Setting up WebStorm
- Overview of the translation setup
- How to add a new string
- How to enable translations in a new language
- How to add new translations

## Tools Used

- i18next
- i18next-browser-languagedetector
- i18next-parser
- WebStorm
  - [Easy I18n](https://plugins.jetbrains.com/plugin/16316-easy-i18n) plugin.

## Files

- `src/i18n/i18n.ts`
- `src/i18n/locales/*.json`

### Key names

You can see the currently-used key names in:

`src/i18n/locales/en.json`

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

## For Developers

> [!Warning] Do not extract strings by hand
> It is just too time-consuming and too error-prone.
> Find a tool in your IDE that will allow you to select text, give it a label and extract it to all languages.

The flow for adding a new translation value - in WebStorm...

Scenarios/topics:

- Simple string
- Simple string with interpolation
- Beware of extra backticks
- `yarn extract-i18n`

## WebStorm Easy I18n

- Action for extracting strings
- Table and tree view
  - Meaning of red text
  - Meaning of orange text

## For Translators

We will find a website to make it easy to add new translations.
