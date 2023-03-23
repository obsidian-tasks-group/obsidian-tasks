# Thought-Process for Deciding Whether a Dependency Needs Manual Testing

Look at the `package.json` entry for a package and search for which files import the package.

- When in doubt, [[How do I smoke-test the Tasks plugin|smoke-test]].
- Smoke-testing of multiple dependency upgrades can be done in a batch, to reduce the time spent on this process.

## Definitely smoke test

Anything that is involved in producing the built output to users. For example:

- everything in the "dependencies" (rather than "devDependencies") list in `package.json`
- `esbuild` (the build system)
- anything imported by the esbuild config file `esbuild.config.mjs` (for example, `builtin-modules`, `svelte-preprocess`)
- `obsidian` (also see [[Notes and Special Cases]] below)
- all `@codemirror/*`
- `moment`

## Automated testing sufficient

Our linting, formatting, and testing code does not affect the built output and is run automatically on each PR, so it does not need smoke tests.

An automated test fail for an upgrade to one of these packages may be an indication of a newly found linter error in the code and should be investigated.

However, if all the automatic checks pass, these packages can be merged right away:

- `markdownlint`
- anything with `eslint` in it (including `@typescript/eslint*`, which version bump weekly regardless of whether they have any changes)
- `svelte-check` (but not other svelte things, which are used in the build system)
- anything with `prettier`
- `lefthook`
- anything with `jest` in it (but see the note on [[Dependency Groups]] for details).
- For anything else, where and how is it being used?
  - If it's only in tests, or only used by developers, no need to smoke test.
