import { App, Editor, MarkdownView, View } from 'obsidian';
import { TaskModal } from '../TaskModal';
import { Priority, Status, Task, TaskRegularExpressions } from '../Task';
import { DateFallback } from '../DateFallback';

export const createOrEdit = (checking: boolean, editor: Editor, view: View, app: App) => {
    if (checking) {
        return view instanceof MarkdownView;
    }

    if (!(view instanceof MarkdownView)) {
        // Should never happen due to check above.
        return;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);
    const task = taskFromLine({ line, path });

    // save the inferred scheduled to compare it later
    const inferredScheduledDate = task.scheduledDateIsInferred ? task.scheduledDate : null;

    const onSubmit = (updatedTasks: Task[]): void => {
        const serialized = updatedTasks
            .map((task: Task) => {
                if (inferredScheduledDate !== null && !inferredScheduledDate.isSame(task.scheduledDate, 'day')) {
                    // if a fallback date was used before modification, and the scheduled date was modified, we have to mark
                    // the scheduled date as not inferred anymore.
                    task = new Task({ ...task, scheduledDateIsInferred: false });
                }

                return task;
            })
            .map((task: Task) => task.toFileLineString())
            .join('\n');
        editor.setLine(lineNumber, serialized);
    };

    // Need to create a new instance every time, as cursor/task can change.
    const taskModal = new TaskModal({
        app,
        task,
        onSubmit,
    });
    taskModal.open();
};

const taskFromLine = ({ line, path }: { line: string; path: string }): Task => {
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
