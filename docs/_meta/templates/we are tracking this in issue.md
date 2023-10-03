<%-*
const issue_number = await tp.system.prompt("GitHub Issue Number");
-%>
We are tracking this in [issue #<%* tR += issue_number %>](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/<%* tR += issue_number %>).
