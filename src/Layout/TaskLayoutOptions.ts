/**
 * {@link Task} fields used for rendering. Use references to this enum ({@link TaskLayoutComponent.Id})
 * instead of plain string values (`id`).
 *
 * The order here determines the order that task fields are rendered and written to markdown.
 */
export enum TaskLayoutComponent {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    Description = 'description',
    Id = 'id',
    DependsOn = 'dependsOn',
    Priority = 'priority',
    RecurrenceRule = 'recurrenceRule',
    OnCompletion = 'onCompletion',
    CreatedDate = 'createdDate',
    StartDate = 'startDate',
    ScheduledDate = 'scheduledDate',
    DueDate = 'dueDate',
    CancelledDate = 'cancelledDate',
    DoneDate = 'doneDate',
    BlockLink = 'blockLink',
}

export const taskLayoutComponents = Object.values(TaskLayoutComponent);

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
            return component !== TaskLayoutComponent.Description && component !== TaskLayoutComponent.BlockLink;
        });
    }

    public toggleVisibilityExceptDescriptionAndBlockLink() {
        this.toggleableComponents.forEach((component) => {
            this.visible[component] = !this.visible[component];
        });

        this.setTagsVisibility(!this.areTagsShown());
    }
}

/**
 * Parse show/hide options for Task layout options
 * @param taskLayoutOptions
 * @param option - must already have been lower-cased
 * @param visible - whether the option should be shown
 * @return True if the option was recognised, and false otherwise
 * @see parseQueryShowHideOptions
 */
export function parseTaskShowHideOptions(taskLayoutOptions: TaskLayoutOptions, option: string, visible: boolean) {
    if (option.startsWith('priority')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.Priority, visible);
        return true;
    }
    if (option.startsWith('cancelled date')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.CancelledDate, visible);
        return true;
    }
    if (option.startsWith('created date')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.CreatedDate, visible);
        return true;
    }
    if (option.startsWith('start date')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.StartDate, visible);
        return true;
    }
    if (option.startsWith('scheduled date')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.ScheduledDate, visible);
        return true;
    }
    if (option.startsWith('due date')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.DueDate, visible);
        return true;
    }
    if (option.startsWith('done date')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.DoneDate, visible);
        return true;
    }
    if (option.startsWith('recurrence rule')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.RecurrenceRule, visible);
        return true;
    }
    if (option.startsWith('tags')) {
        taskLayoutOptions.setTagsVisibility(visible);
        return true;
    }
    if (option.startsWith('id')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.Id, visible);
        return true;
    }
    if (option.startsWith('depends on')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.DependsOn, visible);
        return true;
    }
    if (option.startsWith('on completion')) {
        taskLayoutOptions.setVisibility(TaskLayoutComponent.OnCompletion, visible);
        return true;
    }
    return false;
}
