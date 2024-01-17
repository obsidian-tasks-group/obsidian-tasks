import { TaskLayoutOptions } from './Layout/TaskLayoutOptions';
import { QueryLayoutOptions } from './QueryLayoutOptions';

export type TaskLayoutComponent =
    // NEW_TASK_FIELD_EDIT_REQUIRED
    | 'description'
    | 'priority'
    | 'recurrenceRule'
    | 'createdDate'
    | 'startDate'
    | 'scheduledDate'
    | 'dueDate'
    | 'doneDate'
    | 'cancelledDate'
    | 'blockLink';

export const taskLayoutComponents: TaskLayoutComponent[] = [
    // NEW_TASK_FIELD_EDIT_REQUIRED
    'description',
    'priority',
    'recurrenceRule',
    'createdDate',
    'startDate',
    'scheduledDate',
    'dueDate',
    'cancelledDate',
    'doneDate',
    'blockLink',
];

export class QueryLayout {
    protected queryLayoutOptions: QueryLayoutOptions;

    constructor(queryLayoutOptions?: QueryLayoutOptions) {
        if (queryLayoutOptions) {
            this.queryLayoutOptions = queryLayoutOptions;
        } else {
            this.queryLayoutOptions = new QueryLayoutOptions();
        }
    }

    protected applyQueryLayoutOptions(taskListHiddenClasses: string[]) {
        const componentsToGenerateClassesOnly: [boolean, string][] = [
            // The following components are handled in QueryRenderer.ts and thus are not part of the same flow that
            // hides TaskLayoutComponent items. However, we still want to have 'tasks-layout-hide' items for them
            // (see https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1866).
            // This can benefit from some refactoring, i.e. render these components in a similar flow rather than
            // separately.
            [this.queryLayoutOptions.hideUrgency, 'urgency'],
            [this.queryLayoutOptions.hideBacklinks, 'backlinks'],
            [this.queryLayoutOptions.hideEditButton, 'edit-button'],
            [this.queryLayoutOptions.hidePostponeButton, 'postpone-button'],
        ];
        for (const [hide, component] of componentsToGenerateClassesOnly) {
            generateHiddenClassForTaskList(taskListHiddenClasses, hide, component);
        }

        if (this.queryLayoutOptions.shortMode) taskListHiddenClasses.push('tasks-layout-short-mode');
    }
}

function generateHiddenClassForTaskList(taskListHiddenClasses: string[], hide: boolean, component: string) {
    if (hide) {
        taskListHiddenClasses.push(hiddenComponentClassName(component));
    }
}

function hiddenComponentClassName(component: string) {
    return `tasks-layout-hide-${component}`;
}

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying {@link TaskLayoutOptions} objects.
 */
export class TaskLayout extends QueryLayout {
    public taskListHiddenClasses(): string[] {
        return this._taskListHiddenClasses;
    }
    private taskLayoutOptions: TaskLayoutOptions;
    private _taskListHiddenClasses: string[] = [];

    constructor(taskLayoutOptions?: TaskLayoutOptions, queryLayoutOptions?: QueryLayoutOptions) {
        super(queryLayoutOptions);

        if (taskLayoutOptions) {
            this.taskLayoutOptions = taskLayoutOptions;
        } else {
            this.taskLayoutOptions = new TaskLayoutOptions();
        }
        this.applyTaskLayoutOptions();
        this.applyQueryLayoutOptions(this._taskListHiddenClasses);
    }
    private applyTaskLayoutOptions() {
        this.taskLayoutOptions.toggleableComponents.forEach((component) => {
            generateHiddenClassForTaskList(
                this._taskListHiddenClasses,
                !this.taskLayoutOptions.isShown(component),
                component,
            );
        });

        // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
        generateHiddenClassForTaskList(this._taskListHiddenClasses, !this.taskLayoutOptions.areTagsShown(), 'tags');
    }
}
