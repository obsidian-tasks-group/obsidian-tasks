---
publish: true
---

# How do I use Moment in src

<span class="related-pages">#libraries/moment</span>

See also the equivalent [[How do I use Moment in tests]].

## Introduction

[Moment.js](https://momentjs.com) is a date and time library, and Tasks uses it in preference to the built-in Date class.

- [Moment.js Documentation](https://momentjs.com/docs/)
- [Format Moment objects](https://momentjs.com/docs/#/displaying/)

## Using Moment as a type in src/

The file [src/global.d.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/global.d.ts) declares the `Moment` type automatically, so it is no longer necessary to import `Moment` in files in `src/`.

Other Moment types can be used like this, with no imports:

- `moment.DurationInputArg2`
- `moment.unitOfTime`

## Calling moment() in src/

Obsidian provides access to the `moment()` function as `window.moment()`, and this is what to use in any files in `src/`:

<!-- snippet: use-moment-in-src -->
```ts
const today = window.moment();
```
<!-- endSnippet -->

No declaration is needed for `window.moment()`: it is automatically available to all code in `src/`.
