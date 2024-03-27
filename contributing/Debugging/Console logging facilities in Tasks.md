---
publish: true
---

# Console logging facilities in Tasks

<span class="related-pages">#debugging</span>

The source file [src/lib/logging.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/lib/logging.ts) provides a logging facility that writes to the developer console.

## Enabling debug logging

The `loggingOptions` section in the file `.obsidian/plugins/obsidian-tasks-plugin/data.json` vault determines the level of detail written out by Tasks.

For example, change all the `info` values to `debug`.

The available levels are:

- `error`: Only show errors.
- `warn`: Show warnings, and all above.
- `info`: Show informational messages, and all above.
- `debug`: Show debug messages and above.
- `trace`: A `trace` message shows the call-stack to the log message.

See a sample [data.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/.obsidian/plugins/obsidian-tasks-plugin/data.json) file.

## Adding logging to new locations

New logging locations need to be added to `loggingOptions` in [src/Config/Settings.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Config/Settings.ts), so that developers/users can easily adjust the logging levels.

For now, if you wish to add new logging, please search the source code for uses of `logging.getLogger()`.

## Related pages

- [[Console timing facilities in Tasks]]
