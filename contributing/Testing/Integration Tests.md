# Integration Tests

<span class="related-pages">#testing/automated-testing #testing/manual-testing</span>

## Summary

> [!Tip]
> Use this mechanism if you are changing how Tasks affects rendering in Reading mode.

We have a mechanism to test how Tasks impacts Obsidian's own rendering.

The tests in the new directory `integration_tests/` use the [Obsidian CLI](https://help.obsidian.md/cli).

The CLI doesn't work 'headless' - it requires a GUI environment and so doesn't run on GitHub Actions. So it is only run when developers invoke it manually.

## Requirements

1. [Obsidian 1.12.4](https://github.com/obsidianmd/obsidian-releases/releases/tag/v1.12.4) or newer, with installer version updated too.
2. The output of the Obsidian's **Show debug info** command should begin like this, or newer:

    ```text
    SYSTEM INFO:
     Obsidian version: 1.12.4
     Installer version: 1.12.4
    ```

3. The Obsidian CLI is [enabled](https://help.obsidian.md/cli#Install+Obsidian+CLI).
4. The `Tasks-Demo` vault, in `resources/sample_vaults/Tasks-Demo/` has an up-to-date build of the Tasks plugin: see [[Local development#Running the build|Running the build]].
5. The `Tasks-Demo` vault is open in Obsidian and is the active vault.

## How to run

Use any of the following to run these tests:

```bash
yarn test:integration
jest --config jest.integration.config.js
```

If you want to execute the `integration_tests/` tests in your IDE, you must add the command line arguments `--config jest.integration.config.js` to the IDE's runner configuration for that directory.

## How the tests work

The tests use the Obsidian CLI to load files from the mechanism described in [[Using Obsidian API in tests]].

The files are viewed in Reading mode, and parts of the DOM are then captured, normalised, formatted, and saved using [[Approval Tests]].

## Limitations

### Unreliable on files that scroll

This mechanism is only reliable when rendering small files that fit on the screen without scrolling.

This is because both Obsidian and Tasks only render content when it is in view, and so we found tests produced inconsistent output when rendering longer files, depending on the size of the open Obsidian window.
