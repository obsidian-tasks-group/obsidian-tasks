# Smoke Test Auto Suggest
## Check Simultaneous Integration With Various Complements and Natural Language Dates

> [!Warning]
> Plugins must be loaded in a certain order. They are loaded in the order they are enabled.

1. Set task setting `minimum match length for auto-suggest` to 1.
2. Disable then enable tasks plugin
3. Install natural language dates plugin, disable then enable
4. Install various complements plugin, disable then enable
5. Ensure natural language dates setting `trigger phrase` doesn't conflict with tasks. The default "@" is okay.

> [!NOTE]
> .obsidian/community-plugins.json should end with the following:
>
> ```json
> [
> ...
> "obsidian-tasks-plugin",
> "nldates-obsidian",
> "various-complements"
> ]
> ```

## Smoke Tests

- [ ] #task typing `@` on task line shows natural language date suggestions (today, yesterday, tomorrow)
- [ ] #task typing `t` on task line shows tasks suggestions (due date, start date...)
- [ ] #task typing `ta` on task line shows tasks suggestions (start date)
- [ ] #task typing `tas` on task line shows various-compliments suggestions (Tasks.md)
