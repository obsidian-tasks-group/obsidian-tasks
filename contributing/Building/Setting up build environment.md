# Setting up build environment

This project uses Node 16.x, if you also use a different version, look at using `nvm` to manage your Node versions.
If you are using `nvm`, you can install the 16.x version of Node with `nvm install 16; nvm use <full version number you installed such as 16.10.0>`.

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
