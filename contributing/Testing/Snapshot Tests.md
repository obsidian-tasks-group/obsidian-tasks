# Snapshot Tests

<span class="related-pages">#testing/automated-testing</span>

For testing more complex objects, some of the tests here use Vitest's
[Snapshot Testing](https://vitest.dev/guide/snapshot) facility, which is similar to
[Approval Tests](https://approvaltests.com) but easier to use in JavaScript.

For readability of snapshots, we favour [Inline Snapshots](https://vitest.dev/guide/snapshot#inline-snapshots),
which are saved in the source code. See that documentation for how to easily update the inline
snapshot, if the output is intended to be changed.

See [[Vitest and the WebStorm IDE]] for easy viewing of snapshots with that IDE.
