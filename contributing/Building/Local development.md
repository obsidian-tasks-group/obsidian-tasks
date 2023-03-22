# Local development

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
