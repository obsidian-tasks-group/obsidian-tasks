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
