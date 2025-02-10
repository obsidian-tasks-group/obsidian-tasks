---
publish: true
---

# Contribute translations

<span class="related-pages">#i18n</span>

## Mechanics of translations

> [!info] Assumptions
>
> - We plan adopt a website to make it easy to add new translations.
> - Until then, these notes assume some familiarity with the GitHub '**create branch, edit, then create pull request'** process.

## Getting help

Use this discussion on GitHub [Contribute to translating the Tasks plugin in to non-English languages](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/3321) to discuss this process, and get help.

## Adding a new language

If there is not already a file for your language in [src/i18n/locales/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/i18n/locales), please add a new comment on [GitHub](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/3321), requesting a developer to [[Support a new language|add files for your language]].

## Doing the translation

You will be editing a file in [src/i18n/locales/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/i18n/locales), for your language.

1. Fork the Tasks repo, or synchronise your fork.
2. Create a branch.
3. Open a file-comparison tool and compare [en.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/i18n/locales/en.json) with the file for your language.
4. Copy the English string to the other file, and then translate it.
5. When you have finished, commit your language file: use the prefix `i18n:` on the commit message
6. Then create a pull request.
