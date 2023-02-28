# Dependency Upgrades and Repository Maintenance

Dependencies for the plugin are set using the `package.json`  (human-editable) and [yarn.lock](yarn.lock) (machine-generated) files.
After any change to dependencies in `package.json`, run `yarn` to update the `yarn.lock` file and commit the changes in both files.
If you see a warning from `yarn` about a **missing peer dependency that mentions `obsidian` or `@codemirror`, you can safely ignore it**. Other yarn messages should likely be resolved before commit.

Code changes that also involve dependency changes may require additional testing and review.
Please only change [package.json](package.json) if necessary for your contribution.

Package management for the documentation site is handled separately; see the [documentation site README](./docs/README.md) for details on that.

The rest of this section is most useful for maintainers of the repository and not necessary for typical documentation, code, or test contributions.

## Summary of Dependency Upgrades and Dependabot

Keeping dependencies up to date ensures the best experience and security for Tasks plugin users.
This project uses Dependabot to help automate dependency updates, but some dependencies require manual testing
before they can be merged.
See [[FAQs#How do I smoke-test the Tasks plugin?]] for how to manually test.

Multiple depdendency upgrades can be smoke-tested together in a batch.
An easy way to do this is to make a local branch that merges _only the changes to the `package.json`_ from each of the different upgrade PRs (either manually by examining the change to `package.json` in each PR and then editing your local version to match, or via git).
Then run `yarn` to update the `yarn.lock` file, and this should avoid merge conflicts.
After linting, testing, and smoke-testing (using `yarn build:dev` and manually copying the `main.js` to the local test vault), you can merge the individual upgrade PRs (leaving time for dependabot to rebase them between each individual merge) and delete the local branch.

## Overview of dependencies and `package.json`

The [package.json](package.json) file is the human-editable interface for dependency management.
Acceptable dependency versions are specified using [semver](https://semver.org/) version ranges.
This project pins certain dependencies to exact version numbers, and others to major version ranges.

After any chance to the `package.json` file, either by manual edit or by a command such as `yarn add -D newDevDependency` and then saving the file, run `yarn` to update the `yarn.lock` file.
The `yarn.lock` file is machine-generated - based on the version constraints in `package.json` - and should not be edited manually.
It lists the specific versions of all installed dependencies (and their dependencies, recursively)
currently used by the project.

If there are ever git merge conflicts in `yarn.lock`, best practice is to rename the conflicted file, ensure `package.json` is correct, and then run `yarn` to regenerate the `yarn.lock` file.
The newly-generated file can then be committed to resolve the merge conflict.

`package.json` separates dependencies only used in the development, testing, and building process ("devDependencies") from those contained as part of the plugin's `main.js` file because they are used at runtime ("dependencies").
However, Obsidian's plugin architecture handles linking in the Obsidian API and its dependencies (such as `@codemirror/*` packages), so those are not part of the runtime "dependencies" in `package.json` and must also be marked as "external" in the build system configuration (`esbuild.config.mjs`).
Some subset of the packages marked "external" in [esbuild.config.mjs](esbuild.config.mjs) will be listed as "devDependencies" because their APIs are used in the plugin or its tests.
Therefore, "devDependency" vs. "dependency" separation is not a sufficient indicator of whether a package
needs manual "smoke testing" of runtime behavior.

## Thought-Process for Deciding Whether a Dependency Needs Manual Testing

Look at the `package.json` entry for a package and search for which files import the package.

- When in doubt, smoke-test. Smoke-testing of multiple dependency upgrades can be done in a batch, to reduce the time spent on this process.
- **Definitely smoke test**: Anything that is involved in producing the built output to users. For example:
  - everything in the "dependencies" (rather than "devDependencies") list in `package.json`
  - `esbuild` (the build system)
  - anything imported by the esbuild config file `esbuild.config.mjs` (for example, `builtin-modules`, `svelte-preprocess`)
  - `obsidian` (also see [Special Cases section below](#notes-and-special-cases))
  - all `@codemirror/*`
  - `moment`
- **Automated testing sufficient**: Our linting, formatting, and testing code does not affect the built output and is run automatically on each PR, so it does not need smoke tests. An automated test fail for an upgrade to one of these packages may be an indication of a newly found linter error in the code and should be investigated. However, if all the automatic checks pass, these packages can be merged right away:
  - `markdownlint`
  - anything with `eslint` in it (including `@typescript/eslint*`, which version bump weekly regardless of whether they have any changes)
  - `svelte-check` (but not other svelte things, which are used in the build system)
  - anything with `prettier`
  - `lefthook`
  - anything with `jest` in it (but see [the note below on Dependency Groups](#dependency-groups) for details).
- For anything else, where and how is it being used? If it's only in tests, or only used by developers, no need to smoke test.

## Dependency Groups

Several dependencies come in groups (for example, `@typescript/eslint*` or ones containing the word `jest`) that may need to be updated together.
For example, `ts-jest` relies on having a matching major version with `jest` and its types (`@types/jest`).
Every jest-related package that shares a major version number with `ts-jest`, `jest` etc must have an available upgrade to the new major version before any of them can be upgraded.
Otherwise, automated testing may fail due to version mismatch.

Dependabot does not know how to handle groups like this, so the maintainer must keep track of this.
`yarn outdated` is a useful command-line tool for seeing whether there are upgrades available.

## Notes and Special Cases

Dependabot will not offer PRs for every package.
For example, if a package is pinned to an exact version (for example,`obsidian`) that is far behind the current, dependabot may not give any notification of an upgrade.
Use `yarn outdated` every so often to see if there are any upgrades available.

Note that yarn's `upgrade` and `upgrade-interactive` commands will respect the project's `package.json` which pins either major versions or a specific number.
`yarn outdated` gives a better indication of what upgrades are available.
To upgrade major version numbers or a dependency where a fixed version is used, you must
manually edit the `package.json` file. **Note**: Remember `yarn` after any edits to `package.json` to ensure the `yarn.lock` file is updated.

Updates to the `obsidian` package may require additional changes to [manifest.json](manifest.json) and [versions.json](versions.json) and should be handled with care so that Tasks users who are not on the latest version of Obsidian have time to update.
