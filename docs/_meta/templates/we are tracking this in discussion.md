<%-*
const discussion_number = await tp.system.prompt("GitHub Discussion Number");
-%>
We are tracking this in [issue #<%* tR += discussion_number %>](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/<%* tR += discussion_number %>).
