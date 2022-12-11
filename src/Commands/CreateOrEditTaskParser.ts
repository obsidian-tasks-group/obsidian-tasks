import { Priority, Status, Task, TaskRegularExpressions } from '../Task';
import { DateFallback } from '../DateFallback';

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
    const listMarker = '-';
    const statusString: string = nonTaskMatch[3] ?? ' ';
    const status = statusString === ' ' ? Status.TODO : Status.DONE;
    let description: string = nonTaskMatch[4];

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
