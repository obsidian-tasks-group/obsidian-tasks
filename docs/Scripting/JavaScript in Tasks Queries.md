# JavaScript in Tasks Queries

> [!released]
> Since Tasks 8.0.0, JavaScript in Tasks queries is disabled by default.
> This was a breaking change for users of `filter by function`, `sort by function`, and `group by function`.

Some advanced Tasks query instructions can execute JavaScript:

- `filter by function`
- `sort by function`
- `group by function`

These instructions are powerful, but JavaScript in Tasks queries runs inside Obsidian. Malicious JavaScript in a Tasks query or Markdown file could access or modify your vault contents, local files, or other system resources.

For this reason, JavaScript in Tasks queries is disabled by default.

## What changed?

Tasks no longer runs JavaScript in queries by default.

If a query uses `filter by function`, `sort by function`, or `group by function`, it will not run until JavaScript in Tasks queries is enabled.

Existing queries do not need to be rewritten. To restore the previous behaviour, enable the setting described below.

## Who is affected?

You are affected if you use any of these instructions in Tasks query blocks:

- `filter by function`
- `sort by function`
- `group by function`

Some users may also be affected if they rely on undocumented JavaScript expressions inside `{{...}}` placeholders. Documented placeholders continue to work without enabling JavaScript.

Most Tasks users are not affected. Regular filters, sorting, grouping, presets, and documented non-JavaScript placeholders continue to work without this setting.

## How to enable JavaScript in Tasks queries

To enable JavaScript in Tasks queries:

1. Open Obsidian **Settings**.
2. Go to **Tasks**.
3. Find **Searches**.
4. Enable **Enable custom searches**.

Only enable this if you trust the current and future contents of this vault, including files you may later download, copy, or sync from other people.

This setting is stored on this device only. If you sync this vault to other devices, you must enable the setting separately on each device.

## Why this setting exists

JavaScript in Tasks queries is intentionally powerful. It allows custom searches, sorts, and groups that are not possible with the built-in query language alone.

However, that power also carries risk. JavaScript in a Tasks query can run inside Obsidian. If malicious query text is present in your vault, including inside downloaded or synced Markdown files, it could access or modify vault contents, local files, or other system resources.

Disabling JavaScript by default means users must make an explicit choice before allowing this behaviour.

## What still works when JavaScript is disabled?

Most Tasks query features continue to work when JavaScript is disabled.

For example, these do not require JavaScript:

- regular filters such as `not done`, `due before tomorrow`, and `path includes ...`
- regular sorting and grouping instructions
- presets that only use instructions that do not require JavaScript
- documented non-JavaScript placeholders such as `{{query.file.path}}`
- documented file-property placeholders such as `{{query.file.property("name")}}`

## Troubleshooting

### I see an error saying JavaScript is disabled

This means the query uses JavaScript, usually through one of these instructions:

- `filter by function`
- `sort by function`
- `group by function`

To allow the query to run, enable **Settings** → **Tasks** → **Searches** → **Enable custom searches**.

Only do this if you trust the contents of the vault.

### It works on one device but not another

The setting is stored separately on each device.

If you sync your vault between devices, enable **Enable custom searches** on each device where you want JavaScript in Tasks queries to run.

### Do I need to rewrite my existing queries?

No. Existing `filter by function`, `sort by function`, and `group by function` queries can continue to work unchanged once you enable **Enable custom searches**, if you feel it is safe to do so.

## See also

- [[Breaking Changes]]
- [Obsidian plugin security](https://obsidian.md/help/plugin-security)
