# Dependency Upgrades and Repository Maintenance

Dependencies for the plugin are set using the two files:

- [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json)  (human-editable)
- [yarn.lock](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/yarn.lock) (machine-generated)

After any change to dependencies in `package.json`, run `yarn` to update the `yarn.lock` file and commit the changes in both files.

If you see a warning from `yarn` about a **unmet peer dependency that mentions `obsidian` or `@codemirror`, you can safely ignore it**. Other yarn messages should likely be resolved before commit.

Code changes that also involve dependency changes may require additional testing and review.
Please only change [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) if necessary for your contribution.

Package management for the old Jekyll-based documentation site is handled separately; see the [[Dependency Management and Updates for the Docs]] for details on that.

The rest of this section is most useful for maintainers of the repository and not necessary for typical documentation, code, or test contributions.

- [[Summary of Dependency Upgrades and Dependabot]]
- [[Overview of dependencies and `package.json`]]
- [[Thought-Process for Deciding Whether a Dependency Needs Manual Testing]]
- [[Dependency Groups]]
- [[Notes and Special Cases]]
