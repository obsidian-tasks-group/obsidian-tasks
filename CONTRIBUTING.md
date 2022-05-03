# Contribution Guidelines Obsidian Tasks

Thank you for wanting to contribute to Obsidian Tasks!
Every contribution is much appreciated!

## Updating documentation

The documentation resides under the `./docs` directory.
It consists of markdown files, which [Jekyll](https://jekyllrb.com/) will transform into web pages that you can view at <https://schemar.github.io/obsidian-tasks/> .
In the simplest case, you can update the existing markdown file and create a pull request (PR) with your changes.

We use [GitHub pages](https://pages.github.com/) for our documentation.
You can read more about it at their [official documentation](https://docs.github.com/en/pages).

For documentation changes to show up at <https://schemar.github.io/obsidian-tasks/> , they must be in the `gh-pages` branch.
If you want to see your changes available immediately and not only after the next release, you should make your changes on the `gh-pages` branch.
When you create a PR, it should merge into the `gh-pages` branch as well.
If you document an unreleased feature, you should update the documentation on `main` instead. Ideally together with the related code changes.
If this is confusing, don't worry.
We will help you make this right once you opened the PR.

## Updating code

Ideally, an [issue](https://github.com/schemar/obsidian-tasks/issues) already exists and we discussed your implementation in that issue before you open the pull request (PR).
This is _not_ mandatory, but it helps improve the process and reduce unnecessary back-and-forth.

Once you want to propose your changes, create a PR and we'll have a look when we have time.
Discussion will take place inside the PR.

If you can, please add/update tests and documentation where appropriate.

## Setting up build environment

This project uses Node 14.x, if you need to use a different version, look at using `nvm` to manage your Node versions. If you are using `nvm`, you can install the 14.x version of Node with `nvm install 14.19.1; nvm use 14.19.1`.

To setup the local environment after cloning the repository, run the following commands:

``` shell
yarn
yarn build
yarn test
yarn lint
```

Make sure you build, test and lint before pushing to the repository.

## FAQs

### How does Tasks handle status changes?

You can toggle a task‘s status by:

1. using the command (may be bound to a hotkey),
2. clicking on a checkbox of an inline task in Reading mode,
3. clicking on a checkbox of an inline task in Live Preview, or
4. clicking on a checkbox in query results (same for Reading mode and Live Preview).

The code is located as follows:

- For 1.: ``./src/Commands/ToggleDone.ts`
- 2. and 4. use a checkbox created by `Task.toLi()`. There, the checkbox gets a click event handler.
- For 3.: `./src/LivePreviewExtension.ts`

Toggle behavior:

- 1. toggles the line directly where the cursor is. In the file inside Obsidian‘s vault.
- The click event listener of 2. and 4. uses File::replaceTaskWithTasks(). That, in turn, updates the file in Obsidian‘s Vault (like 1, but it needs to find the correct line).
- 3. toggles the line directly where the checkbox is. On the „document“ of CodeMirror (the library that Obsidian uses to show text on screen). That, in turn, updates the file in Obsidian‘s Vault, somehow.

Obsidian writes the changes to disk at its own pace.

### How do I make a release?

1. Check out the `main` branch
2. Check for the current version in `package.json` (e.g. `1.4.1`) and decide on a next version
    - Backwards incompatible change: increase major version
    - New functionality: increase minor version
    - Only bug fixes: increase patch version
3. Check the current version of the obsidian dependency in `package.json` (e.g. `0.13.21`)
4. Run `./release.sh <new tasks version> <obsidian version>`
    - Make sure there are no uncommitted changes. Stash them if necessary.
5. Wait for [GitHub Actions](https://github.com/schemar/obsidian-tasks/actions/workflows/release.yml) to create the new release
6. Update the release description with the changes of the release
    - On the release page, GitHub provides a button to auto-generate release notes which works nicely.
    - Also update the attached zip file by adding the version number to the end of the name after the dash (e.g. `obsidian-tasks-1.4.1.zip`)
7. Optional: Post to
    - Obsidian Discord
    - r/ObsidianMD on Reddit
    - etc.
