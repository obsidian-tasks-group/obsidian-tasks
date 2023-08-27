/**
 * Various rendering options for a query.
 * See applyOptions below when adding options here.
 */
export class LayoutOptions {
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
    shortMode: boolean = false;
    explainQuery: boolean = false;
}

export type TaskLayoutComponent =
    | 'description'
    | 'priority'
    | 'recurrenceRule'
    | 'createdDate'
    | 'startDate'
    | 'scheduledDate'
    | 'dueDate'
    | 'doneDate'
    | 'blockLink';

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying {@link LayoutOptions} objects.
 */
export class TaskLayout {
    public defaultLayout: TaskLayoutComponent[] = [
        'description',
        'priority',
        'recurrenceRule',
        'createdDate',
        'startDate',
        'scheduledDate',
        'dueDate',
        'doneDate',
        'blockLink',
    ];
    public shownTaskLayoutComponents: TaskLayoutComponent[];
    public hiddenTaskLayoutComponents: TaskLayoutComponent[] = [];
    public options: LayoutOptions;
    public taskListClasses: string[] = [];

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
        this.hideComponent(this.options.hidePriority, 'priority');
        this.hideComponent(this.options.hideRecurrenceRule, 'recurrenceRule');
        this.hideComponent(this.options.hideCreatedDate, 'createdDate');
        this.hideComponent(this.options.hideStartDate, 'startDate');
        this.hideComponent(this.options.hideScheduledDate, 'scheduledDate');
        this.hideComponent(this.options.hideDueDate, 'dueDate');
        this.hideComponent(this.options.hideDoneDate, 'doneDate');

        this.generateHiddenClassForTaskList(this.options.hidePriority, 'priority');
        this.generateHiddenClassForTaskList(this.options.hideRecurrenceRule, 'recurrenceRule');
        this.generateHiddenClassForTaskList(this.options.hideCreatedDate, 'createdDate');
        this.generateHiddenClassForTaskList(this.options.hideStartDate, 'startDate');
        this.generateHiddenClassForTaskList(this.options.hideScheduledDate, 'scheduledDate');
        this.generateHiddenClassForTaskList(this.options.hideDueDate, 'dueDate');
        this.generateHiddenClassForTaskList(this.options.hideDoneDate, 'doneDate');

        // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
        this.generateHiddenClassForTaskList(this.options.hideTags, 'tags');

        // The following components are handled in QueryRenderer.ts and thus are not part of the same flow that
        // hides TaskLayoutComponent items. However, we still want to have 'tasks-layout-hide' items for them
        // (see https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1866).
        // This can benefit from some refactoring, i.e. render these components in a similar flow rather than
        // separately.
        this.generateHiddenClassForTaskList(this.options.hideUrgency, 'urgency');
        this.generateHiddenClassForTaskList(this.options.hideBacklinks, 'backlinks');
        this.generateHiddenClassForTaskList(this.options.hideEditButton, 'edit-button');
        if (this.options.shortMode) this.taskListClasses.push('tasks-layout-short-mode');
    }

    private generateHiddenClassForTaskList(hide: boolean, component: string) {
        if (hide) {
            this.taskListClasses.push(`tasks-layout-hide-${component}`);
        }
    }
    // Remove a component from the taskComponents array if the given layoutOption criteria is met,
    // and add to the layout's specific classes list the class that denotes that this component
    // isn't in the layout
    private hideComponent(hide: boolean, component: TaskLayoutComponent) {
        if (hide) {
            this.hiddenTaskLayoutComponents.push(component);
            this.shownTaskLayoutComponents = this.shownTaskLayoutComponents.filter((element) => element != component);
        }
    }
}
