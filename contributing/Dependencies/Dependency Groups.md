# Dependency Groups

Several dependencies come in groups (for example, `@typescript/eslint*` or ones containing the word `jest`) that may need to be updated together.

For example, `ts-jest` relies on having a matching major version with `jest` and its types (`@types/jest`).

Every jest-related package that shares a major version number with `ts-jest`, `jest` etc must have an available upgrade to the new major version before any of them can be upgraded.

Otherwise, automated testing may fail due to version mismatch.

Dependabot does not know how to handle groups like this, so the maintainer must keep track of this.

`yarn outdated` is a useful command-line tool for seeing whether there are upgrades available.
