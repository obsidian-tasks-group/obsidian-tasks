---
publish: true
---

# Testing in different Locales

<span class="related-pages">#testing/automated-testing #testing/automated-testing/dates-and-times #libraries/moment</span>

See also [[Testing and Time Zones]].

## The default locale in Vitest

Moment has a single, global locale. It affects things such as the order of day and month in the short date format, month and weekday names, and the first day of the week.

Our Vitest tests run in Moment's default locale, `en`. Code in `src/` that reads the locale, such as `window.moment.localeData()`, therefore sees `en` unless a test changes it.

## Running individual tests in another locale

Individual tests can temporarily run in a different locale, using `withLocale()` from [tests/TestingTools/DateTestHelpers.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/DateTestHelpers.ts).

The locale is a [Moment locale name](https://github.com/moment/moment/tree/develop/locale), in lower case, such as `en-gb` or `de`.

<!-- snippet: withLocale-example -->
```ts
it('should use day-before-month order in English (GB)', () => {
    withLocale('en-gb', () => {
        // 'L' is Moment's numeric short date format. For English (GB) it is day-month-year:
        expect(window.moment.localeData().longDateFormat('L')).toBe('DD/MM/YYYY');
    });
});
```
<!-- endSnippet -->

Things to know:

- It sets Moment's global locale for the duration of the callback, and restores the previous locale afterwards, even if the callback throws.
- It throws an error if Moment does not recognise the locale. Without this check, Moment would silently keep the previous locale, and the test would pass or fail for the wrong reason.
- The callback must be synchronous: the locale is restored as soon as the callback returns. TypeScript will reject passing an `async` function.
- Use `window.moment` in these tests, and declare it as described in [[How do I use Moment in tests#Declare window.moment]].
- It can be combined with `withTimezone()`: nest one call inside the other.
- To test that behaviour is the same in every locale, use `describe.each()` or `it.each()` over a list of locale names, and call `withLocale()` inside the test. For an example, see the `parsing typed dates` tests in [tests/DateTime/DateTools.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/DateTime/DateTools.test.ts).
- For more examples, see the tests in [tests/TestingTools/DateTestHelpers.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/DateTestHelpers.test.ts).
