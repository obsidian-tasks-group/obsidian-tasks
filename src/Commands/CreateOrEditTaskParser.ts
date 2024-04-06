import { TasksFile } from '../Scripting/TasksFile';
import { Status } from '../Statuses/Status';
import { Task } from '../Task/Task';
import { DateFallback } from '../Task/DateFallback';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import { TaskLocation } from '../Task/TaskLocation';
import { getSettings } from '../Config/Settings';
import { GlobalFilter } from '../Config/GlobalFilter';
import { Priority } from '../Task/Priority';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';

function getDefaultCreatedDate() {
    const { setCreatedDate } = getSettings();
    return setCreatedDate ? window.moment() : null;
}

function shouldUpdateCreatedDateForTask(task: Task) {
    const { setCreatedDate } = getSettings();

    if (!setCreatedDate) {
        // Auto-adding of Created Date is disabled in settings.
        return false;
    }

    if (task.createdDate !== null) {
        // The task already had a created date, so don't change it.
        return false;
    }

    // If the description was empty, treat it as new and add a creation date.
    const descriptionIsEmpty = task.description === '';

    // If the global filter will be added when the task is saved, treat it as new and add a creation date.
    // See issue #2112.
    const globalFilterEnabled = !GlobalFilter.getInstance().isEmpty();
    const taskDoesNotContainGlobalFilter = !GlobalFilter.getInstance().includedIn(task.description);
    const needsGlobalFilterToBeAdded = globalFilterEnabled && taskDoesNotContainGlobalFilter;

    return descriptionIsEmpty || needsGlobalFilterToBeAdded;
}

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
    // We get all signifiers from the line, even if the Global Filter is missing.
    // This helps users who, for some reason, have data in a task line without the Global Filter.
    const task = Task.parseTaskSignifiers(
        line,
        TaskLocation.fromUnknownPosition(new TasksFile(path)), // We don't need precise location to toggle it here in the editor.
        DateFallback.fromPath(path), // set the scheduled date from the filename, so it can be displayed in the dialog
    );

    const createdDate = getDefaultCreatedDate();

    if (task !== null) {
        if (shouldUpdateCreatedDateForTask(task)) {
            return new Task({ ...task, createdDate });
        }
        return task;
    }

    // If we are not on a line of a task, we take what we have.
    const nonTaskMatch = line.match(TaskRegularExpressions.nonTaskRegex);
    if (nonTaskMatch === null) {
        // Should never happen; everything in the regex is optional.
        console.error('Tasks: Cannot create task on line:', line);

        return new Task({
            // NEW_TASK_FIELD_EDIT_REQUIRED
            status: Status.TODO,
            description: '',
            // We don't need the location fields except file to edit here in the editor.
            taskLocation: TaskLocation.fromUnknownPosition(new TasksFile(path)),
            indentation: '',
            listMarker: '-',
            priority: Priority.None,
            createdDate,
            startDate: null,
            scheduledDate: null,
            dueDate: null,
            doneDate: null,
            cancelledDate: null,
            recurrence: null,
            dependsOn: [],
            id: '',
            blockLink: '',
            tags: [],
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
        // NEW_TASK_FIELD_EDIT_REQUIRED
        status,
        description,
        // We don't need the location fields except file to edit here in the editor.
        taskLocation: TaskLocation.fromUnknownPosition(new TasksFile(path)),
        indentation,
        listMarker,
        blockLink,
        priority: Priority.None,
        createdDate,
        startDate: null,
        scheduledDate: null,
        dueDate: null,
        doneDate: null,
        cancelledDate: null,
        recurrence: null,
        tags: [],
        originalMarkdown: '',
        // Not needed since the inferred status is always re-computed after submitting.
        scheduledDateIsInferred: false,
        id: '',
        dependsOn: [],
    });
};
