import { Status } from '../Status';
import { Priority, Task, TaskRegularExpressions } from '../Task';
import { DateFallback } from '../DateFallback';

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
        path,
        sectionStart: 0, // We don't need this to toggle it here in the editor.
        sectionIndex: 0, // We don't need this to toggle it here in the editor.
        precedingHeader: null, // We don't need this to toggle it here in the editor.
        fallbackDate, // set the scheduled date from the filename, so it can be displayed in the dialog
    });

    if (task !== null) {
        return task;
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
            path,
            indentation: '',
            listMarker: '-',
            originalStatusCharacter: ' ',
            priority: Priority.None,
            startDate: null,
            scheduledDate: null,
            dueDate: null,
            doneDate: null,
            recurrence: null,
            // We don't need the following fields to edit here in the editor.
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: null,
            blockLink: '',
            tags: [],
            originalMarkdown: '',
            scheduledDateIsInferred: false,
        });
    }

    const indentation: string = nonTaskMatch[1];
    const listMarker = nonTaskMatch[2] ?? '-';
    const statusString: string = nonTaskMatch[4] ?? ' ';
    const status = statusString === ' ' ? Status.TODO : Status.DONE;
    let description: string = nonTaskMatch[5];

    const blockLinkMatch = line.match(TaskRegularExpressions.blockLinkRegex);
    const blockLink = blockLinkMatch !== null ? blockLinkMatch[0] : '';

    if (blockLink !== '') {
        description = description.replace(TaskRegularExpressions.blockLinkRegex, '');
    }

    return new Task({
        status,
        description,
        path,
        indentation,
        listMarker,
        originalStatusCharacter: statusString,
        blockLink,
        priority: Priority.None,
        startDate: null,
        scheduledDate: null,
        dueDate: null,
        doneDate: null,
        recurrence: null,
        // We don't need the following fields to edit here in the editor.
        sectionStart: 0,
        sectionIndex: 0,
        precedingHeader: null,
        tags: [],
        originalMarkdown: '',
        // Not needed since the inferred status is always re-computed after submitting.
        scheduledDateIsInferred: false,
    });
};
