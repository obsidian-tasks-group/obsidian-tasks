# Setting up build environment

See [package.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/package.json) for which version of Node to use.

Consider using `nvm` which allows you to manage multiple versions of node.

For example, to install node 18.x:\
 `nvm install 18; nvm use <full version number you installed such as 18.2.0>`.

To setup the local environment after cloning the repository, run the following commands:

```shell
yarn
yarn build
yarn test
yarn lint
yarn lint:markdown
```

Make sure you build, test and lint before pushing to the repository. Lefthook is used to cover these checks before commit and push.

Then see [[Local development]] for how to build and run Tasks.
