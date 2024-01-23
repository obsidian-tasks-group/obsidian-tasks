import { generateHiddenClassForTaskList } from './LayoutHelpers';
import { TaskLayoutOptions } from './TaskLayoutOptions';

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
    | 'blockedBy'
    | 'id'
    | 'blockLink';

// The order here determines the order that task fields are rendered and written to markdown.
export const taskLayoutComponents: TaskLayoutComponent[] = [
    // NEW_TASK_FIELD_EDIT_REQUIRED
    'description',
    'id',
    'blockedBy',
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

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying {@link TaskLayoutOptions} objects.
 */
export class TaskLayout {
    private taskLayoutOptions: TaskLayoutOptions;

    constructor(taskLayoutOptions?: TaskLayoutOptions) {
        if (taskLayoutOptions) {
            this.taskLayoutOptions = taskLayoutOptions;
        } else {
            this.taskLayoutOptions = new TaskLayoutOptions();
        }
    }
    public applyTaskLayoutOptions() {
        const taskListHiddenClasses: string[] = [];
        this.taskLayoutOptions.toggleableComponents.forEach((component) => {
            generateHiddenClassForTaskList(
                taskListHiddenClasses,
                !this.taskLayoutOptions.isShown(component),
                component,
            );
        });

        // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
        generateHiddenClassForTaskList(taskListHiddenClasses, !this.taskLayoutOptions.areTagsShown(), 'tags');

        return taskListHiddenClasses;
    }
}
