# Summary of Dependency Upgrades and Dependabot

Keeping dependencies up to date ensures the best experience and security for Tasks plugin users.

This project uses Dependabot to help automate dependency updates, but some dependencies require manual testing
before they can be merged.

See [[How do I smoke-test the Tasks plugin]] for how to manually test.

Multiple dependency upgrades can be smoke-tested together in a batch.

An easy way to do this is to make a local branch that merges _only the changes to the `package.json`_ from each of the different upgrade PRs (either manually by examining the change to `package.json` in each PR and then editing your local version to match, or via git).

Then run `yarn` to update the `yarn.lock` file, and this should avoid merge conflicts.

After linting, testing, and smoke-testing (using `yarn build:dev` and manually copying the `main.js` to the local test vault), you can merge the individual upgrade PRs (leaving time for dependabot to rebase them between each individual merge) and delete the local branch.
