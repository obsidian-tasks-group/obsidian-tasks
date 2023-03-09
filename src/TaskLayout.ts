/**
 * Various rendering options for a query.
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
    public layoutComponents: TaskLayoutComponent[];
    public options: LayoutOptions;

    constructor(options?: LayoutOptions, components?: TaskLayoutComponent[]) {
        if (options) {
            this.options = options;
        } else {
            this.options = new LayoutOptions();
        }
        if (components) {
            this.layoutComponents = components;
        } else {
            this.layoutComponents = this.defaultLayout;
        }

        this.layoutComponents = this.applyOptions(this.options);
    }

    /**
     * Return a new list of components with the given options applied.
     */
    applyOptions(layoutOptions: LayoutOptions): TaskLayoutComponent[] {
        // Remove a component from the taskComponents array if the given layoutOption criteria is met
        const removeIf = (
            taskComponents: TaskLayoutComponent[],
            shouldRemove: boolean,
            componentToRemove: TaskLayoutComponent,
        ) => {
            if (shouldRemove) {
                return taskComponents.filter((element) => element != componentToRemove);
            } else {
                return taskComponents;
            }
        };
        // Remove components from the layout according to the task options. These represent the existing task options,
        // so some components (e.g. the description) are not here because there are no layout options to remove them.
        let newComponents = this.layoutComponents;
        newComponents = removeIf(newComponents, layoutOptions.hidePriority, 'priority');
        newComponents = removeIf(newComponents, layoutOptions.hideRecurrenceRule, 'recurrenceRule');
        newComponents = removeIf(newComponents, layoutOptions.hideCreatedDate, 'createdDate');
        newComponents = removeIf(newComponents, layoutOptions.hideStartDate, 'startDate');
        newComponents = removeIf(newComponents, layoutOptions.hideScheduledDate, 'scheduledDate');
        newComponents = removeIf(newComponents, layoutOptions.hideDueDate, 'dueDate');
        newComponents = removeIf(newComponents, layoutOptions.hideDoneDate, 'doneDate');
        return newComponents;
    }
}
