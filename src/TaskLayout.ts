/**
 * Various rendering options for a query.
 * See applyOptions below when adding options here.
 */
export class LayoutOptions {
    hidePostponeButton: boolean = false;
    hideTaskCount: boolean = false;
    hideBacklinks: boolean = false;
    hidePriority: boolean = false;
    hideCreatedDate: boolean = false;
    hideStartDate: boolean = false;
    hideScheduledDate: boolean = false;
    hideDoneDate: boolean = false;
    hideDueDate: boolean = false;
    hideRecurrenceRule: boolean = false;
    hideEditButton: boolean = false;
    hideUrgency: boolean = true;
    hideTags: boolean = false;
    hideId: boolean = false;
    hideDependsOn: boolean = false;
    shortMode: boolean = false;
    explainQuery: boolean = false;
}

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
    | 'dependsOn'
    | 'id'
    | 'blockLink';

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying {@link LayoutOptions} objects.
 */
export class TaskLayout {
    public defaultLayout: TaskLayoutComponent[] = [
        // NEW_TASK_FIELD_EDIT_REQUIRED
        'description',
        'priority',
        'recurrenceRule',
        'createdDate',
        'startDate',
        'scheduledDate',
        'dueDate',
        'doneDate',
        'dependsOn',
        'id',
        'blockLink',
    ];
    public shownTaskLayoutComponents: TaskLayoutComponent[];
    public hiddenTaskLayoutComponents: TaskLayoutComponent[] = [];
    public options: LayoutOptions;
    public taskListHiddenClasses: string[] = [];

    constructor(options?: LayoutOptions) {
        if (options) {
            this.options = options;
        } else {
            this.options = new LayoutOptions();
        }
        this.shownTaskLayoutComponents = this.defaultLayout;
        this.applyOptions();
    }

    private applyOptions() {
        // Remove components from the layout according to the task options. These represent the existing task options,
        // so some components (e.g. the description) are not here because there are no layout options to remove them.
        const componentsToHideAndGenerateClasses: [boolean, TaskLayoutComponent][] = [
            // NEW_TASK_FIELD_EDIT_REQUIRED
            [this.options.hidePriority, 'priority'],
            [this.options.hideRecurrenceRule, 'recurrenceRule'],
            [this.options.hideCreatedDate, 'createdDate'],
            [this.options.hideStartDate, 'startDate'],
            [this.options.hideScheduledDate, 'scheduledDate'],
            [this.options.hideDueDate, 'dueDate'],
            [this.options.hideDoneDate, 'doneDate'],
            [this.options.hideDependsOn, 'dependsOn'],
            [this.options.hideId, 'id'],
        ];
        for (const [hide, component] of componentsToHideAndGenerateClasses) {
            this.hideComponent(hide, component);
            this.generateHiddenClassForTaskList(hide, component);
        }

        const componentsToGenerateClassesOnly: [boolean, string][] = [
            // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
            [this.options.hideTags, 'tags'],

            // The following components are handled in QueryRenderer.ts and thus are not part of the same flow that
            // hides TaskLayoutComponent items. However, we still want to have 'tasks-layout-hide' items for them
            // (see https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1866).
            // This can benefit from some refactoring, i.e. render these components in a similar flow rather than
            // separately.
            [this.options.hideUrgency, 'urgency'],
            [this.options.hideBacklinks, 'backlinks'],
            [this.options.hideEditButton, 'edit-button'],
            [this.options.hidePostponeButton, 'postpone-button'],
        ];
        for (const [hide, component] of componentsToGenerateClassesOnly) {
            this.generateHiddenClassForTaskList(hide, component);
        }

        if (this.options.shortMode) this.taskListHiddenClasses.push('tasks-layout-short-mode');
    }

    private generateHiddenClassForTaskList(hide: boolean, component: string) {
        if (hide) {
            this.taskListHiddenClasses.push(`tasks-layout-hide-${component}`);
        }
    }

    /**
     * Move a component from the shown to hidden if the given layoutOption criteria is met.
     */
    private hideComponent(hide: boolean, component: TaskLayoutComponent) {
        if (hide) {
            this.hiddenTaskLayoutComponents.push(component);
            this.shownTaskLayoutComponents = this.shownTaskLayoutComponents.filter((element) => element != component);
        }
    }
}
