# Dependency Groups

Several dependencies come in groups (for example, `@typescript/eslint*` or ones containing the word `vitest`) that may need to be updated together.

For example, `vitest` uses matching versions of its own sub-packages, such as `@vitest/expect`. Optional packages such as `@vitest/coverage-v8` must also match the installed Vitest version.

Update `vitest` and any directly installed `@vitest/*` packages together, keeping their versions aligned.

Otherwise, automated testing may fail due to version mismatch.

Dependabot does not know how to handle groups like this, so the maintainer must keep track of this.

`yarn outdated` is a useful command-line tool for seeing whether there are upgrades available.
