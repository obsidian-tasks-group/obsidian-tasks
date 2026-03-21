# Local development

First follow [[Setting up build environment]].

## Building Tasks

- When developing locally, you can use the `yarn dev` command to start a development build.
- This will cause a rebuild of the code base every time you make a change so you can see if there are any code errors.

Not all the functionality of Tasks can be tested via the automated tests.

If you want to test your changes in a local obsidian vault use `yarn run build:dev`.

This will generate the `main.js` in the root of the repository with a sourcemap in it to facilitate
debugging using the development console (`Ctrl+Shift+i` on Windows or `Cmd+Shift+i` on Mac) in Obsidian.

## Running the build

Then:

- **Either** manually copy the `main.js` file to local test vault's `.obsidian/plugins/obsidian-tasks` folder,
  - With this approach, you must remember to repeat the copy step after every build.
- **Or** use `yarn deploy:local` to copy all 3 plugin files (`main.js`, `manifest.json`, `styles.css`) into the Tasks-Demo sample vault.
  - This runs a cross-platform Node.js script that works on Windows, macOS and Linux.
  - By default it copies to `resources/sample_vaults/Tasks-Demo/.obsidian/plugins/obsidian-tasks-plugin`.
  - To copy to a different vault, pass the destination as an argument: `yarn deploy:local /path/to/vault/.obsidian/plugins/obsidian-tasks-plugin`.
  - You must remember to repeat the copy step after every build.
  - PowerShell users can alternatively use `yarn deploy:local:pwsh` which runs the original PowerShell script that creates symbolic links instead of copying.

It is recommended you use the [Hot-Reload](https://github.com/pjeby/hot-reload) plugin in that vault also;
it will automatically reload the plugin when files change.
