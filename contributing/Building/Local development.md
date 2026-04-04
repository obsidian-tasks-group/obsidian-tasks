# Local development

First follow [[Setting up build environment]].

## Quick start

Whenever you get the latest code or change `package.json`, sync dependencies first:

```bash
yarn
```

Then build and deploy to the Tasks Demo vault (`resources/sample_vaults/Tasks-Demo/`):

```bash
yarn build:dev && yarn deploy:local
```

On Windows, run the two commands separately:

```bash
yarn build:dev
yarn deploy:local
```

> [!Tip]
> `deploy:local` copies all three plugin files (`main.js`, `manifest.json`, `styles.css`).
>
> Because the Hot Reload plugin is installed and configured in that vault, the Tasks plugin will reload automatically after each deploy.
>
> If testing callbacks in Tasks rendering code, use the **Reload app without saving** command instead, for safety.

> [!Warning]
> Please do not commit local plugin builds. We only commit released plugin versions. Thank you.

## Deploying to a different vault

Pass your vault path as an argument:

```bash
yarn deploy:local /path/to/your/vault
```

Make sure [Hot Reload](https://github.com/pjeby/hot-reload) is set up for the Tasks plugin in that vault.

## Watching for changes

To rebuild automatically on every file save (useful for catching compile errors during development):

```bash
yarn dev
```

Note that `yarn dev` does not deploy to a vault — use `build:dev` + `deploy:local` when you want to test in Obsidian.

PowerShell users can use `yarn deploy:local:pwsh` instead, which creates symbolic links rather than copying.
