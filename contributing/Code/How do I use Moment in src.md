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

To declare the type `Moment`, for use as the type of a variable, field or function return type in files that will be **released** in the Tasks plugin:

<!-- snippet: declare-Moment-type-in-src -->
```ts
import type { Moment } from 'moment';
```
<!-- endSnippet -->

> [!Warning]
> Do not import all of `moment` in any file in src/:
>
> ```ts
> // Please do not use this line in any code in `src/`
> import moment from 'moment';
> ```
>
> It adds about 60 kb to the released `main.js` needlessly.

## Calling moment() in src/

Obsidian provides access to the `moment()` function as `window.moment()`, and this is what to use in any files in `src/`:

<!-- snippet: use-moment-in-src -->
```ts
const today = window.moment();
```
<!-- endSnippet -->

No declaration is needed for `window.moment()`: it is automatically available to all code in `src/`.
