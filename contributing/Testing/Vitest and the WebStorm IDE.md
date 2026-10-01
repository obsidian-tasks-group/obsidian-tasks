---
publish: true
aliases:
  - Testing/Jest and the WebStorm IDE
---

# Vitest and the WebStorm IDE

<span class="related-pages">#testing/automated-testing #tools/webstorm</span>

The WebStorm IDE has a [helpful page](https://www.jetbrains.com/help/webstorm/vitest.html)
on how it makes testing with Vitest easy.

Note in particular the
[Snapshot testing section](https://www.jetbrains.com/help/webstorm/vitest.html#snapshot-testing)
for how to view [[Snapshot Tests|snapshot test]] output from the gutter icon next to a
`toMatchSnapshot()` call. To update snapshots, run the tests with Vitest's `-u` / `--update`
flag - see [[Snapshot Tests]].
