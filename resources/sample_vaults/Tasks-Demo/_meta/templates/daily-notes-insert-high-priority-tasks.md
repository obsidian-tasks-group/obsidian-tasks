<%*
const tasksApi = app.plugins.plugins['obsidian-tasks-plugin']?.apiV1;
if (tasksApi) {
    const urgentTasks = tasksApi.queryTasks(`
        not done
        priority is high
        due before tomorrow
    `);

    tR += "### Today's Top Tasks\n\n";
    if (urgentTasks.length === 0) {
        tR += "_No high priority tasks for today._\n";
    } else {
        for (const task of urgentTasks) {
            tR += `${task.originalMarkdown}\n`;
        }
    }
}
%>
