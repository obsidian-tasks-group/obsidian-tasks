import { Status } from '../Status';
import { Priority, Task, TaskRegularExpressions } from '../Task';
import { DateFallback } from '../DateFallback';
import { StatusRegistry } from '../StatusRegistry';
import { TaskLocation } from '../TaskLocation';
import { getSettings } from '../Config/Settings';

/**
 * Read any markdown line and treat it as a task, for the purposes of
 * the 'Create or edit task' modal.
 *
 * Unlike {@link Task.fromLine}, which only processes tasks
 * already recognised by the Tasks plugin, this function processes any line.
 *
 * This is an implementation detail of that command, which has been separated
 * out to a different source file in order to allow its logic to be tested.
 *
 * @param line - The line the user had clicked on when running 'Create or edit task' command
 * @param path - The path of the file containing the line
 */
export const taskFromLine = ({ line, path }: { line: string; path: string }): Task => {
    const fallbackDate = DateFallback.fromPath(path);

    const task = Task.fromLine({
        line,
        taskLocation: TaskLocation.fromUnknownPosition(path), // We don't need precise location to toggle it here in the editor.
        fallbackDate, // set the scheduled date from the filename, so it can be displayed in the dialog
    });

    if (task !== null) {
        return task;
    }

    const { setCreatedDate } = getSettings();
    let createdDate: moment.Moment | null = null;
    if (setCreatedDate) {
        createdDate = window.moment();
    }

    // If we are not on a line of a task, we take what we have.
    // The non-task line can still be a checklist, for example if it is lacking the global filter.
    const nonTaskMatch = line.match(TaskRegularExpressions.nonTaskRegex);
    if (nonTaskMatch === null) {
        // Should never happen; everything in the regex is optional.
        console.error('Tasks: Cannot create task on line:', line);

        return new Task({
            status: Status.TODO,
            description: '',
            // We don't need the location fields except file to edit here in the editor.
            taskLocation: TaskLocation.fromUnknownPosition(path),
            indentation: '',
            listMarker: '-',
            priority: Priority.None,
            createdDate,
            startDate: null,
            scheduledDate: null,
            dueDate: null,
            doneDate: null,
            recurrence: null,
            blockLink: '',
            tags: [],
            reminder: null,
            originalMarkdown: '',
            scheduledDateIsInferred: false,
        });
    }

    const indentation: string = nonTaskMatch[1];
    const listMarker = nonTaskMatch[2] ?? '-';
    const statusString: string = nonTaskMatch[4] ?? ' ';
    const status = StatusRegistry.getInstance().bySymbolOrCreate(statusString);

    let description: string = nonTaskMatch[5];

    const blockLinkMatch = line.match(TaskRegularExpressions.blockLinkRegex);
    const blockLink = blockLinkMatch !== null ? blockLinkMatch[0] : '';

    if (blockLink !== '') {
        description = description.replace(TaskRegularExpressions.blockLinkRegex, '');
    }

    return new Task({
        status,
        description,
        // We don't need the location fields except file to edit here in the editor.
        taskLocation: TaskLocation.fromUnknownPosition(path),
        indentation,
        listMarker,
        blockLink,
        priority: Priority.None,
        createdDate,
        startDate: null,
        scheduledDate: null,
        dueDate: null,
        doneDate: null,
        recurrence: null,
        tags: [],
        reminder: null,
        originalMarkdown: '',
        // Not needed since the inferred status is always re-computed after submitting.
        scheduledDateIsInferred: false,
    });
};
