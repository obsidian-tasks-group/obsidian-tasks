# Overview of dependencies and `package.json`

## package.json

The [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) file is the human-editable interface for dependency management.

Acceptable dependency versions are specified using [semver](https://semver.org/) version ranges.
This project pins certain dependencies to exact version numbers, and others to major version ranges.

After any chance to the `package.json` file, either by manual edit or by a command such as `yarn add -D newDevDependency` and then saving the file, run `yarn` to update the `yarn.lock` file.

## yarn.lock

The `yarn.lock` file is machine-generated - based on the version constraints in `package.json` - and should not be edited manually.

It lists the specific versions of all installed dependencies (and their dependencies, recursively)
currently used by the project.

If there are ever git merge conflicts in `yarn.lock`, best practice is to rename the conflicted file, ensure `package.json` is correct, and then run `yarn` to regenerate the `yarn.lock` file.

The newly-generated file can then be committed to resolve the merge conflict.

## dependencies and devDependencies

`package.json` separates dependencies only used in the development, testing, and building process ("devDependencies") from those contained as part of the plugin's `main.js` file because they are used at runtime ("dependencies").

### Obsidian and codemirror dependencies

However, Obsidian's plugin architecture handles linking in the Obsidian API and its dependencies (such as `@codemirror/*` packages), so those are not part of the runtime "dependencies" in `package.json` and must also be marked as "external" in the build system configuration (`esbuild.config.mjs`).

Some subset of the packages marked "external" in [esbuild.config.mjs](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/esbuild.config.mjs) will be listed as "devDependencies" because their APIs are used in the plugin or its tests.

Therefore, "devDependency" vs. "dependency" separation is not a sufficient indicator of whether a package
needs manual "[[How do I smoke-test the Tasks plugin|smoke testing]]" of runtime behavior.

See also [[Thought-Process for Deciding Whether a Dependency Needs Manual Testing]].
