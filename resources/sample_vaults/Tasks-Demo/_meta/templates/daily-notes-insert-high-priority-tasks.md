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
        // Write plain list items, not task lines, so that the note gets a snapshot of the tasks,
        // rather than duplicate tasks that would each need to be marked done twice.
        for (const task of urgentTasks) {
            tR += `- ${task.description} (due: ${task.due.formatAsDate()})\n`;
        }
    }
}
%>
