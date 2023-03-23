# Notes and Special Cases

Dependabot will not offer PRs for every package.

For example, if a package is pinned to an exact version (for example,`obsidian`) that is far behind the current, dependabot may not give any notification of an upgrade.

Use `yarn outdated` every so often to see if there are any upgrades available.

Note that yarn's `upgrade` and `upgrade-interactive` commands will respect the project's `package.json` which pins either major versions or a specific number.

`yarn outdated` gives a better indication of what upgrades are available.

To upgrade major version numbers or a dependency where a fixed version is used, you must
manually edit the `package.json` file.

**Note**: Remember `yarn` after any edits to `package.json` to ensure the `yarn.lock` file is updated.

Updates to the `obsidian` package may require additional changes to [manifest.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/manifest.json) and [versions.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/versions.json) and should be handled with care so that Tasks users who are not on the latest version of Obsidian have time to update.
