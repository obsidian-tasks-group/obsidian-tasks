# Snapshot Tests

For testing more complex objects, some of the tests here use Jest's
[Snapshot Testing](https://jestjs.io/docs/snapshot-testing) facility, which is similar to
[Approval Tests](https://approvaltests.com) but easier to use in JavaScript.

For readability of snapshots, we favour [Inline Snapshots](https://jestjs.io/docs/snapshot-testing#inline-snapshots),
which are saved in the source code. See that documentation for how to easily update the inline
snapshot, if the output is intended to be changed.
