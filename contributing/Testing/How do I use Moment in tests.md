---
publish: true
---

# How do I use Moment in tests

<span class="related-pages">#libraries/moment</span>

See also the equivalent [[How do I use Moment in src]].

## Declare moment in tests/

This is how to declare `moment` and `Moment` in files that **test** code in the Tasks plugin.

### Use the "jsdom" test environment

Any test files that call any code in `src/` that uses `moment` or `Moment` need to start with this boilerplate code:

<!-- snippet: declare-moment-in-tests -->
```ts
/**
 * @jest-environment jsdom
 */

import moment from 'moment';
```
<!-- endSnippet -->

### Declare window.moment

Any tests that call code in `src/` that uses `window.moment()` also needs this near the top:

<!-- snippet: fix-window.moment-calls-in-tests -->
```ts
window.moment = moment;
```
<!-- endSnippet -->

This will fix errors such as:

```text
window.moment is not a function
TypeError: window.moment is not a function
```

## Use moment in tests/

<!-- snippet: use-moment-in-tests -->
```ts
const date = moment('2003-10-12');
const now = moment();
```
<!-- endSnippet -->

## Fixing common errors

These are common error messages you may see when testing moment-related code.

### Consider using the "jsdom" test environment

If you see this:

```text
The error below may be caused by using the wrong test environment, see https://jestjs.io/docs/configuration#testenvironment-string.
Consider using the "jsdom" test environment.
```

... you probably need to [[#Use the "jsdom" test environment]].

### window.moment is not a function

If you see this:

```text
window.moment is not a function
TypeError: window.moment is not a function
```

... you need to [[#Declare window.moment]].
