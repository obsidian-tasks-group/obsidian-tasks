# Contribution Guidelines Obsidian Tasks

<!-- toc -->
## Contents

- [Thank you](#thank-you)
- [Updating documentation](#updating-documentation)
  - [Documentation and branches](#documentation-and-branches)
  - [Adding Tables of Contents to rendered docs](#adding-tables-of-contents-to-rendered-docs)
  - [Linking to other pages in the docs](#linking-to-other-pages-in-the-docs)
  - [Screenshots in documentation](#screenshots-in-documentation)
    - [Creating screenshots](#creating-screenshots)
    - [Saving screenshots](#saving-screenshots)
    - [Adding screenshots to the documentation](#adding-screenshots-to-the-documentation)
  - [Version numbers in documentation](#version-numbers-in-documentation)
  - [How the documentation is generated](#how-the-documentation-is-generated)
- [Updating code](#updating-code)
- [Local setup and workflow for changes to code and tests](#local-setup-and-workflow-for-changes-to-code-and-tests)
  - [Setting up build environment](#setting-up-build-environment)
  - [Local development](#local-development)
- [Maintaining the tests](#maintaining-the-tests)
  - [Writing Tests for New or Refactored Code](#writing-tests-for-new-or-refactored-code)
    - [Think of it as testing user-visible features](#think-of-it-as-testing-user-visible-features)
    - [Location of code](#location-of-code)
    - [Then start writing tests](#then-start-writing-tests)
  - [Snapshot Tests](#snapshot-tests)
  - [Approval Tests](#approval-tests)
    - [Example Approval tests](#example-approval-tests)
  - [Jest and the WebStorm IDE](#jest-and-the-webstorm-ide)
  - [Test Coverage](#test-coverage)
- [Dependency Upgrades and Repository Maintenance](#dependency-upgrades-and-repository-maintenance)
  - [Overview of dependencies and `package.json`](#overview-of-dependencies-and-packagejson)
  - [Thought-Process for Deciding Whether a Dependency Needs Manual Testing](#thought-process-for-deciding-whether-a-dependency-needs-manual-testing)
  - [Dependency Groups](#dependency-groups)
  - [Notes and Special Cases](#notes-and-special-cases)
- [FAQs](#faqs)
  - [How does Tasks handle status changes?](#how-does-tasks-handle-status-changes)
  - [How do I add a new field to the Task class?](#how-do-i-add-a-new-field-to-the-task-class)
  - [How do I add a new task filter?](#how-do-i-add-a-new-task-filter)
    - [Update src/](#update-src)
    - [Update tests/](#update-tests)
    - [Update doc/](#update-doc)
    - [Examples Pull Requests](#examples-pull-requests)
  - [How do I test a GitHub build of the Tasks plugin?](#how-do-i-test-a-github-build-of-the-tasks-plugin)
    - [Option 1: Download Tasks-Demo test vault with the build's Tasks plugin installed](#option-1-download-tasks-demo-test-vault-with-the-builds-tasks-plugin-installed)
    - [Option 2: Download the built plugin to add to your vault](#option-2-download-the-built-plugin-to-add-to-your-vault)
  - [How do I smoke-test the Tasks plugin?](#how-do-i-smoke-test-the-tasks-plugin)
  - [How do I make a release?](#how-do-i-make-a-release)
  - [How do I update the Tables of Contents in CONTRIBUTING and similar?](#how-do-i-update-the-tables-of-contents-in-contributing-and-similar)<!-- endToc -->

## Thank you

Thank you for wanting to contribute to Obsidian Tasks!
Every contribution is much appreciated!

## Updating documentation

The documentation resides under the `./docs` directory.
It consists of markdown files, which [Jekyll](https://jekyllrb.com/) will transform into web pages that you can view at <https://obsidian-tasks-group.github.io/obsidian-tasks/> .
In the simplest case, you can update the existing markdown file and create a pull request (PR) with your changes.

### Documentation and branches

For documentation changes to show up at <https://obsidian-tasks-group.github.io/obsidian-tasks/> , they must be in the `gh-pages` branch.
If you want to see your changes available immediately and not only after the next release, you should make your changes on the `gh-pages` branch.
When you create a PR, it should merge into the `gh-pages` branch as well.
If you document an unreleased feature, you should update the documentation on `main` instead. Ideally together with the related code changes.
If this is confusing, don't worry.
We will help you make this right once you opened the PR.

### Adding Tables of Contents to rendered docs

Add the following between the H1 and the first H2, to show a table of contents in a page on the published documentation.

```text
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---
```

### Linking to other pages in the docs

Linking to other pages in the documentation is non-obvious and a bit tedious.

Here are some examples to copy-and-paste:

To pages:

```text
[‘Create or edit Task’ Modal]({{ site.baseurl }}{% link getting-started/create-or-edit-task.md %})
[Dates]({{ site.baseurl }}{% link getting-started/dates.md %})
[Filters]({{ site.baseurl }}{% link queries/filters.md %})
[Global Filter]({{ site.baseurl }}{% link getting-started/global-filter.md %})
[Priorities]({{ site.baseurl }}{% link getting-started/priority.md %})
[Recurring Tasks]({{ site.baseurl }}{% link getting-started/recurring-tasks.md %})
```

To sections:

```text
[due]({{ site.baseurl }}{% link getting-started/dates.md %}#-due)
[scheduled]({{ site.baseurl }}{% link getting-started/dates.md %}#-scheduled)
[start]({{ site.baseurl }}{% link getting-started/dates.md %}#-start)
```

### Screenshots in documentation

#### Creating screenshots

For readability and accessibility, images should be created:

- Set the Obsidian window size to be around 1500 pixels wide about between 700 and 1100 pixels high.
- Using the Default Obsidian theme.
- In the Light colour scheme.
- With a large font size.
- With as little blank or dead space as possible around the area of focus.

#### Saving screenshots

Saving images:

- Save them in .PNG format.
- Save them in [docs/images/](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/images/).

#### Adding screenshots to the documentation

When embedding an image inside a documentation page, please link to the local file and include a brief summary underneath.

For example, to embed the `acme.png` file in the documentation:

```text
![ACME Tasks](images/acme.png)
The `ACME` note has some tasks - as linked to from `docs/index.md`.
```

or

```text
![ACME Tasks](../images/acme.png)
The `ACME` note has some tasks - as linked to from any file in a sub-directory of `docs/`.
```

With this mechanism, you can preview the embedded images in any decent Markdown editor, including by opening the `obsidian-tasks` directory in Obsidian.

### Version numbers in documentation

We have introduced version markers to the documentation, to show users in which Tasks version a specific feature was introduced.
This means that newly written documentation should be tagged with a placeholder, which will be replaced with the actual
version upon release.

There are 2 styles of placeholders used through the documentation, Please pick the one that
fits your text better. (If in doubt, take a look at the existing version tags for other features.)

- `> Introduced in Tasks X.Y.Z`
  - This placeholder is usually used after a section heading.
- `> X (Y and Z) was introduced in Tasks X.Y.Z`
  - This placeholder is used when you need to tag a sub-part of something, for example a list.

### How the documentation is generated

We use [GitHub pages](https://pages.github.com/) for our documentation.
You can read more about it at their [official documentation](https://docs.github.com/en/pages).

To generate the documentation site on your machine,
see [docs/README.md](docs/README.md).

## Updating code

Ideally, an [issue](https://github.com/obsidian-tasks-group/obsidian-tasks/issues) or
[Discussion](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions) already exists
and we discussed your implementation in that issue before you open the pull request (PR).
This is _not_ mandatory, but it helps improve the process and reduce unnecessary back-and-forth.

Once you want to propose your changes, create a PR and we'll have a look when we have time.
Discussion will take place inside the PR.

If you can, please add/update [tests](#maintaining-the-tests) and [documentation](#updating-documentation) where appropriate.

## Local setup and workflow for changes to code and tests

This project uses the Yarn package manager for Javascript, and several formatting and linting tools.
Below are specific setup instructions for changing code and tests, as well as tips for local development workflow.

### Setting up build environment

This project uses Node 14.x, if you also use a different version, look at using `nvm` to manage your Node versions.
If you are using `nvm`, you can install the 14.x version of Node with `nvm install 14; nvm use <full version number you installed such as 14.19.3>`.

To setup the local environment after cloning the repository, run the following commands:

```shell
yarn
yarn build
yarn test
yarn lint
yarn lint:markdown
```

Make sure you build, test and lint before pushing to the repository. Lefthook is used to cover these checks before commit and push.

### Local development

When developing locally, you can use the `yarn dev` command to start a development build.
This will cause a rebuild of the code base every time you make a change so you can see if there are any code errors.

Not all the functionality of Tasks can be tested via the automated tests.
If you want to test your changes in a local obsidian vault use `yarn run build:dev`.
This will generate the `main.js` in the root of the repository with a sourcemap in it to facilitate
debugging using the development console (`Ctrl+Shift+i` on Windows or `Cmd+Shift+i` on Mac) in Obsidian.
Then either manually copy the `main.js` file to local test vault's `.obsidian/plugins/obsidian-tasks` folder, or use the Powershell script that is run via the `yarn deploy:local` command to
create a symbolic link to the plugins folder for this plugin (`obsidian-tasks-plugin`).
If you manually copy, you must remember to copy the new version over after every build.
With the symbolic link, whenever a build occurs using `yarn run dev` or `yarn run build:dev`
the plugin will be updated
in the obsidian vault you are targeting using the `OBSIDIAN_PLUGIN_ROOT` environment variable.
It is recommended you use the [Hot-Reload](https://github.com/pjeby/hot-reload) plugin in that vault also;
it will automatically reload the plugin when files change.
The script run by `deploy:local` will create a `.hotreload` file in the root of the repository to assist.

## Maintaining the tests

The tests use the [ts-jest](https://www.npmjs.com/package/ts-jest) wrapper around the
[jest](https://jestjs.io) test framework.

The [Expect](https://jestjs.io/docs/expect) page is a good reference for the many jest testing features.

### Writing Tests for New or Refactored Code

#### Think of it as testing user-visible features

- Tests that test low-level implementation details are hard to maintain over time. Instead, test user-visible features.
- Try to think of the purpose of the code that has missing tests.
  - For example, in `taskFromLine()` in `src/Commands/CreateOrEdit.ts` the comments are quite useful in terms of showing the different scenarios being considered. Something like:
        _already a task line with a global filter, already a task line missing the global filter, already a task line and there is no global filter, already a bullet item, not in a bullet item_
  - These then would be good tests to write: specifically, tests to check that each of those scenarios does actually behave as expected.
  - And if the implementation changed in future, those tests would be extremely useful to the maintainer at the time.
  - And if a new behaviour was added in future, it would be obvious how to add a new test for it.

#### Location of code

Often, untested code is in locations that you can't call in tests (for example, because it uses some Obsidian code).
All that needs to be done then is to refactor - via 'move method' or 'extract method') the code out to a different source file.
For more about refactoring safely and easily, see the talk [Refactoring Superpowers: Make Your IDE Do Your Work, Faster and More Safely](https://www.youtube.com/watch?v=BX6gh2xNiuU).

#### Then start writing tests

If you struggle to name a Jest `it` test, think in terms of _should_: for example, _should convert a line with no bullet to ..._

### Snapshot Tests

For testing more complex objects, some of the tests here use Jest's
[Snapshot Testing](https://jestjs.io/docs/snapshot-testing) facility, which is similar to
[Approval Tests](https://approvaltests.com) but easier to use in JavaScript.

For readability of snapshots, we favour [Inline Snapshots](https://jestjs.io/docs/snapshot-testing#inline-snapshots),
which are saved in the source code. See that documentation for how to easily update the inline
snapshot, if the output is intended to be changed.

### Approval Tests

There is a brief overview of Approval tests at [approvaltests.com](https://approvaltests.com).

For including complex text in the documentation, some tests here will
soon start using the [Approval Tests implementation in NodeJS](https://github.com/approvals/Approvals.NodeJS).

If these tests fail, they will currently try and launch [diffmerge](https://sourcegear.com/diffmerge/) to show
the differences between received and approved files.

<details><summary>Expand Details on Approval Tests</summary>

Approval tests typically call a function beginning `verify`, and pass
in some text or an object to be tested.

#### Example Approval tests

Example test in `ApprovalTestsDemo.test`, that saves its input in a text file:

<!-- snippet: approval-test-as-text -->
```ts
test('SimpleVerify', () => {
    verify('Hello From Approvals');
});
```
<!-- endSnippet -->

The corresponding `approved` file, named `ApprovalTestsDemo.test.ApprovalTests_SimpleVerify.approved.txt`:

<!-- snippet: ApprovalTestsDemo.test.ApprovalTests_SimpleVerify.approved.txt -->
```txt
Hello From Approvals
```
<!-- endSnippet -->

<!-- snippet: approval-test-as-json -->
```ts
test('JsonVerify', () => {
    const data = { name: 'fred', age: 30 };
    verifyAsJson(data);
});
```
<!-- endSnippet -->

The corresponding `approved` file, named `ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json`:

<!-- snippet: ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json -->
```json
{
  "name": "fred",
  "age": 30
}
```
<!-- endSnippet -->

</details>

### Jest and the WebStorm IDE

The WebStorm IDE has a [helpful page](https://www.jetbrains.com/help/webstorm/running-unit-tests-on-jest.html)
on how it makes testing with jest easy.

Note in particular the
[Snapshot testing section](https://www.jetbrains.com/help/webstorm/running-unit-tests-on-jest.html#ws_jest_snapshot_testing)
for how to view the diffs in the event of snapshot test failures, and also how to update the saved snapshot
of one or all snapshot failures.

### Test Coverage

`yarn run jest --coverage` will generate a coverage report in the `coverage` directory, which is ignored by this project's `.gitignore`.
Your IDE may also be able to show you the test coverage of a source file.
Adding tests where possible - see [Location of code](#location-of-code) for constraints to code not currently covered by the automated tests is a great way to contribute!

## Dependency Upgrades and Repository Maintenance

Dependencies for the plugin are set using the `package.json` (human-editable) and `yarn.lock` (machine-generated) files.
After any change to dependencies in `package.json`, run `yarn` to update the `yarn.lock` file and commit the changes in both files.
If you see a warning from `yarn` about a **missing peer dependency that mentions `obsidian` or `@codemirror`, you can safely ignore it**. Other yarn messages should likely be resolved before commit.

Code changes that also involve dependency changes may require additional testing and review.
Please only change `package.json` if necessary for your contribution.

Package management for the documentation site is handled separately; see the [documentation site README](./docs/README.md) for details on that.

The rest of this section is most useful for maintainers of the repository and not necessary for typical documentation, code, or test contributions.

<details><summary>Expand Details on Dependency Upgrades and Dependabot</summary>

Keeping dependencies up to date ensures the best experience and security for Tasks plugin users.
This project uses Dependabot to help automate dependency updates, but some dependencies require manual testing
before they can be merged.
See the [FAQ entry on smoke-testing](#how-do-i-smoke-test-the-tasks-plugin) for how to manually test.

Multiple depdendency upgrades can be smoke-tested together in a batch.
An easy way to do this is to make a local branch that merges _only the changes to the `package.json`_ from each of the different upgrade PRs (either manually by examining the change to `package.json` in each PR and then editing your local version to match, or via git).
Then run `yarn` to update the `yarn.lock` file, and this should avoid merge conflicts.
After linting, testing, and smoke-testing (using `yarn build:dev` and manually copying the `main.js` to the local test vault), you can merge the individual upgrade PRs (leaving time for dependabot to rebase them between each individual merge) and delete the local branch.

### Overview of dependencies and `package.json`

The `package.json` file is the human-editable interface for dependency management.
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
Some subset of the packages marked "external" in `esbuild.config.mjs` will be listed as "devDependencies" because their APIs are used in the plugin or its tests.
Therefore, "devDependency" vs. "dependency" separation is not a sufficient indicator of whether a package
needs manual "smoke testing" of runtime behavior.

### Thought-Process for Deciding Whether a Dependency Needs Manual Testing

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

### Dependency Groups

Several dependencies come in groups (for example, `@typescript/eslint*` or ones containing the word `jest`) that may need to be updated together.
For example, `ts-jest` relies on having a matching major version with `jest` and its types (`@types/jest`).
Every jest-related package that shares a major version number with `ts-jest`, `jest` etc must have an available upgrade to the new major version before any of them can be upgraded.
Otherwise, automated testing may fail due to version mismatch.

Dependabot does not know how to handle groups like this, so the maintainer must keep track of this.
`yarn outdated` is a useful command-line tool for seeing whether there are upgrades available.

### Notes and Special Cases

Dependabot will not offer PRs for every package.
For example, if a package is pinned to an exact version (for example,`obsidian`) that is far behind the current, dependabot may not give any notification of an upgrade.
Use `yarn outdated` every so often to see if there are any upgrades available.

Note that yarn's `upgrade` and `upgrade-interactive` commands will respect the project's `package.json` which pins either major versions or a specific number.
`yarn outdated` gives a better indication of what upgrades are available.
To upgrade major version numbers or a dependency where a fixed version is used, you must
manually edit the `package.json` file. **Note**: Remember `yarn` after any edits to `package.json` to ensure the `yarn.lock` file is updated.

Updates to the `obsidian` package may require additional changes to `manifest.json` and `versions.json` and should be handled with care so that Tasks users who are not on the latest version of Obsidian have time to update.

</details>

Click the "Expand Details" line above to expand or close the section.

## FAQs

### How does Tasks handle status changes?

You can toggle a task‘s status by:

1. using the command (may be bound to a hotkey),
2. clicking on a checkbox of an inline task in Reading mode,
3. clicking on a checkbox of an inline task in Live Preview, or
4. clicking on a checkbox in query results (same for Reading mode and Live Preview).

The code is located as follows:

- For 1.: `./src/Commands/ToggleDone.ts`
- Numbers 2. and 4. use a checkbox created by `Task.toLi()`. There, the checkbox gets a click event handler.
- For 3.: `./src/LivePreviewExtension.ts`

Toggle behavior:

- Number 1. toggles the line directly where the cursor is in the file inside Obsidian's vault.
- The click event listener of 2. and 4. uses `File::replaceTaskWithTasks()`. That, in turn, updates the file in Obsidian‘s Vault (like 1, but it needs to find the correct line).
- Number 3. toggles the line directly where the checkbox is on the "document" of CodeMirror (the library that Obsidian uses to show text on screen). That, in turn, updates the file in Obsidian's Vault.

Obsidian writes the changes to disk at its own pace.

### How do I add a new field to the Task class?

- In [tests/Task.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Task.test.ts):
  - Add a new failing block to the `'identicalTo'` section.
  - Here is an existing example: ['should check path'](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/5b0831c36a80c4cde2d64a6cd281bb4b51e9a142/tests/Task.test.ts#L834-L840).
- In [src/Task.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task.ts), update `Task.identicalTo()`:
  - Once you have a failing test in `Task.test.ts`, implement the check for changed value of your new field in `Task.identicalTo()`.
  - This important method is used to detect whether any edits of any kind have been made to a task, to detect whether task block results need to be updated.
  - Here is the code for the method as of 2022-11-12:
    - [Task.identicalTo() in 5b0831c36a80c4cde2d64a6cd281bb4b51e9a142](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/5b0831c36a80c4cde2d64a6cd281bb4b51e9a142/src/Task.ts#L732-L802)
- In [tests/TestingTools/TaskBuilder.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.ts):
  - Add the new field and a corresponding method.
  - Keep the same field order as in the `Task` class.
  - Update the `build()` method.
- In [tests/TestingTools/TaskBuilder.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/TaskBuilder.test.ts):
  - If the code in TaskBuild will be non-trivial, first add a failing test for it.

### How do I add a new task filter?

All the following steps would be done in the same branch, for inclusion in the same pull request.

#### Update src/

- Implement the search filter:
  - Add to  [src/Query/Filter](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Filter) a  new class that inherits [Field](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/DateField.ts)
  - Typically, this can be done by inheriting one of the partial implementations:
    - [DateField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/DateField.ts)
    - [TextField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/TextField.ts)
    - [MultiTextField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/MultiTextField.ts)
    - [FilterInstructionsBasedField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/FilterInstructionsBasedField.ts)
- Add the new class to [src/Query/FilterParser.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/FilterParser.ts)

#### Update tests/

Write tests as you go.

Ideally, write a failing test first, and then implement the minimum code for the failing test to pass.

For help on writing and running the tests, see [Maintaining the tests](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/CONTRIBUTING.md#maintaining-the-tests)

- Add to [tests/Query/Filter](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Query/Filter) a new test file.
  - This should focus on testing whether or not individual Task objects, with carefully selected sample date, match the filter.
  - Think about edge cases.
- Add the new instruction(s) to  'Query parsing' test in  [tests/Query.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query.test.ts)
  - This verifies that the new filter instruction has been correctly wired in to the Query class.

#### Update doc/

It can be worth writing the documentation first, to ensure that you can explain the new feature clearly before implementing it.

For help on editing the documentation, see [Updating documentation](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/CONTRIBUTING.md#updating-documentation)

- Document the new instruction(s) in [docs/queries/filters.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/queries/filters.md)
  - Add the placeholder to indicate which version the feature will be released in: see [Version numbers in documentation](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/CONTRIBUTING.md#version-numbers-in-documentation)
- Add the new instruction(s) to [docs/quick-reference/index.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/quick-reference/index.md)

#### Examples Pull Requests

- [#1098](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1098) feat: Add filename filter
  - This shows adding a brand new Field class, so shows all the steps above.
- [#1228](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1228) feat: Add 4 instructions: '(done|due|date|start) date is invalid'
  - This adds several new instructions via the DateField class, which implements most of the date-based filters.
  - It was sufficient to add tests of the new feature in just one of the instructions implemented via DateField.
  - It also shows adding a file to the sample vault, to demonstrate and test the new feature.

### How do I test a GitHub build of the Tasks plugin?

First...

1. Go to the [Verify Commit actions page](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/verify.yml).
2. Click on the build of the code version you want to test. For example, you might click on the build for a particular pull request, or the most recent build on `main`.

Then do one of the following options...

#### Option 1: Download Tasks-Demo test vault with the build's Tasks plugin installed

1. In the Artifacts section at the bottom, click on the link whose name starts with **Tasks-Demo-...**, for example  **Tasks-Demo-VerifyCommit-Build1367-Run1**.
    - This will download a zip file containing a copy of the Tasks-Demo sample vault, including the build of the plugin.
    - The numbers in the file name will vary.
2. Optionally, rename the zip file to give it a meaningful name.
    - For example, you could append 'testing PR 1234 - nicer styling'.
3. Expand the zip file.
    - It will create a folder of the same name.
4. Open the expanded folder in Obsidian:
    - Open Obsidian
    - Click 'Open another vault' button
    - Click 'Open folder as vault' button
    - Navigate to the downloaded folder
    - Click 'Open'

#### Option 2: Download the built plugin to add to your vault

You can use these steps to install the built plugin either in to the Tasks-Demo vault inside a clone of the [obsidian-tasks repo](https://github.com/obsidian-tasks-group/obsidian-tasks) or in to one of your own vaults.

1. In the Artifacts section at the bottom, click on **dist-verified** to download a build of the plugin.
2. Optionally, rename the zip file to give it a meaningful name.
    - For example, you could append 'testing PR 1234 - nicer styling'.
3. Expand the downloaded zip file
4. Copy the files in the expanded folder to the `.obsidian/plugins/obsidian-tasks-plugin/` folder in your vault, over-writing the previous files.
5. Restart Obsidian.

### How do I smoke-test the Tasks plugin?

Follow the steps in `resources/sample_vaults/Tasks-Demo/Manual Testing/Smoke Testing the Tasks Plugin.md`.

### How do I make a release?

1. Check out the `main` branch
2. Check for the current version in `package.json` (for example, `1.4.1`) and decide on a next version
    - Backwards incompatible change: increase major version
    - New functionality: increase minor version
    - Only bug fixes: increase patch version
3. Having decided on the new version, replace all `X.Y.Z` in the documentation with the new version number.
4. Check the current version of the obsidian dependency in `package.json` (for example, `0.13.21`)
5. Run `./release.sh <new tasks version> <obsidian version>`
    - Make sure there are no uncommitted changes. Stash them if necessary.
6. Wait for [GitHub Actions](https://github.com/obsidian-tasks-group/obsidian-tasks/actions/workflows/release.yml) to create the new release
7. Update the release description with the changes of the release, which will be a Draft.
    - On the release page, GitHub provides a button to auto-generate release notes which works nicely as a good starting point.
8. When you are happy with the release notes, hit the Publish button.
    - At this point, GitHub will send an email automatically to everyone who is subscribed to Tasks releases.
9. Optional: Post to
    - Obsidian Discord
        - Add a post in the `#updates` channel, with detail about the release
        - Add a one-liner in the `#task-management` channel, linking to the first post
    - r/ObsidianMD on Reddit
    - Obsidian Forum Share & Showcase section
    - etc.

### How do I update the Tables of Contents in CONTRIBUTING and similar?

These are markdown files written for contributors, and intended to be viewed on GitHub.
To make it easy to see their structure, they have a machine-generated Table of Contents ("ToC").

The ToCs will eventually be automated automatically via GitHub Actions, but for now, the following needs to be done in order to update them:

1. Install [MarkdownSnippets](https://github.com/SimonCropp/MarkdownSnippets), also known as `mdsnippets`
2. Run:

```bash
mdsnippets && yarn run lint:markdown && git add --renormalize .
```

The background to this is in [PR #1248](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1248).
