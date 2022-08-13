---
layout: default
title: Regular Expressions
nav_order: 2
parent: Queries
has_toc: false
---

# Regular Expressions

{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Introduction

> Introduced in Tasks 1.12.0.

[Regular expression](https://en.wikipedia.org/wiki/Regular_expression)  ("regex") searches are a powerful alternative to the simple `includes` and  `does not include` searches.

### Take Care

<div class="code-example" markdown="1">

Warning
{: .label .label-yellow}

Regular expression (or 'regex') searching is a powerful but advanced feature that requires thorough knowledge in order to use successfully, and not miss intended search results.

It is easy to write a regular expression that looks like it is correct, but which uses a special character that completely changes the meaning of the search string.

For example, `\d` does **not** match the **two** characters  `\d`, it matches any **one** of the following characters: `0123456789`.

This documentation gives only a brief overview of the facility, with a few motivating examples, and then links to other resources, for thorough treatment.

Having said that, regex searches are a valuable tool, used in many other tools, and time invested in learning about them can pay off well in future, in many other tools and scenarios.
</div>

## Basics

The components of a regex search filter are:

1. The field name, for example `description` or `path`
2. Either  `regex matches` or `regex does not match`
3. The search pattern, inside a pair of forwards slashes, for example `/pc_abigail|pc_edwina|at_work/`
   - That pattern searches for `pc_abigail`, `pc_edwina` or `at_work`, without the need to create a boolean combination of three separate filters
4. Optionally, an extra [flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags) at the end, such as `i`, that can change the meaning of the expression
   - Note that many of the allowed flags are not relevant in the Tasks context, because there are no multi-line searches or global searches, for example.

Case-sensitive example, showing the components:

```text
description regex matches /pc_abigail|pc_edwina|at_work/
^1          ^2            ^3
```

Case-INsensitive example, showing the components:

```text
description regex matches /pc_abigail|pc_edwina|at_work/i
^1          ^2            ^3                            ^4
```

## Notes

- Regex searches are **case-sensitive**, unlike the simpler  `includes` and  `does not include`
- A regex search can be made **insensitive** by appending a `i` flag after the closing `/`, for example: `/I aM cAsE INsensitive because of the LiTle i after the closing slash/i`
- Tasks does not support multi-line regex searches, as each task is a single line.
- Note that `tags` searches do not yet support regex searches.
  - As a workaround, search `description` instead.

## Special characters

If using regex searches, it is important to be aware of the available special characters for several reasons:

1. They enable complex queries to written in simple ways
2. They can cause confusing results or broken searches, if not "escaped" in the search.

Here are a few examples of the [many special characters](https://www.rexegg.com/regex-quickstart.html):

- `.` matches any character
- `^` matches the start of the string (but when `[^inside brackets]`, it means "not")
- `$` matches the end of the string
- `\` adds special meaning to some characters. For example:
  - `\d` matches one digit, from 0 to 9
  - `\D` matches character that is not a digit

## Important links

- [Regex Tutorial](https://regexone.com/)
- [Regex Cheat Sheet](https://www.rexegg.com/regex-quickstart.html)
- [Regex Testing Tool: regex101](https://regex101.com/): Select the flavor 'ECMAScript (JavaScript)'
- Implemented using [JavaScript's RegExp implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- Supports [JavaScript RegExp Flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags), although not all of them are relevant in this context.

## Known limitations

Please be aware of the following limitations in Tasks' implementation of regular expression searching:

- The single error message `Tasks query: cannot parse regex (description); check your leading and trailing slashes for your query` may mean any of:
  - The opening or closing `/` is missing from the query.
  - The regular expression is not valid, for example `description regex matches /[123/`.
- No error when part of the pattern is lost, for example because unescaped slashes are used inside the pattern.
  - For example, `path regex matches /a/b/c/d/` actually searches for `path regex matches /a/`.
  - In this case, the query should be `path regex matches /a\/b\/c\/d/`.
- Illegal flags are ignored.
  - For example, the query `description regex matches /CASE/&` should give an error that `&` (and similar) are unrecognised flags.
- The `tag` or `tags` instruction does not yet support regular expression searches.
- [Lookahead and Lookbehind](https://www.regular-expressions.info/lookaround.html) searches are untested, and are presumed not to work on Apple mobile devices, or to cause serious performance problems with slow searches.

## Regular expression examples

Example searches:

```text
# Find tasks whose description begins with Log, exact capitalisation
description regex matches /^Log/

# Find tasks whose description begins with Log, ignoring capitalisation
description regex matches /^Log/i
```
