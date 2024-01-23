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
 * Various rendering options of tasks in a query.
 *
 * See {@link TaskLayoutComponent} for the available options.
 *
 * Note that there is an additional special case, for whether tags are shown.
 *
 * @see QueryLayoutOptions
 */
export class TaskLayoutOptions {
    private visible: { [component: string]: boolean } = {};
    private tagsVisible: boolean = true;

    constructor() {
        taskLayoutComponents.forEach((component) => {
            this.visible[component] = true;
        });
    }

    public isShown(component: TaskLayoutComponent) {
        return this.visible[component];
    }

    public areTagsShown() {
        return this.tagsVisible;
    }

    public hide(component: TaskLayoutComponent) {
        this.visible[component] = false;
    }

    public setVisibility(component: TaskLayoutComponent, visible: boolean) {
        this.visible[component] = visible;
    }

    public setTagsVisibility(visibility: boolean) {
        this.tagsVisible = visibility;
    }

    public get shownComponents() {
        return taskLayoutComponents.filter((component) => {
            return this.visible[component];
        });
    }

    public get hiddenComponents() {
        return taskLayoutComponents.filter((component) => {
            return !this.visible[component];
        });
    }

    /**
     * These represent the existing task options, so some components (description & block link for now) are not
     * here because there are no layout options to remove them.
     */
    public get toggleableComponents() {
        return taskLayoutComponents.filter((component) => {
            // Description and blockLink are always shown
            return component !== 'description' && component !== 'blockLink';
        });
    }

    public toggleVisibilityExceptDescriptionAndBlockLink() {
        this.toggleableComponents.forEach((component) => {
            this.visible[component] = !this.visible[component];
        });

        this.setTagsVisibility(!this.areTagsShown());
    }
}
