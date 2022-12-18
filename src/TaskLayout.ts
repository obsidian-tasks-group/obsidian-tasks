/**
 * Various rendering options for a query.
 */
export class LayoutOptions {
    hideTaskCount: boolean = false;
    hideBacklinks: boolean = false;
    hidePriority: boolean = false;
    hideStartDate: boolean = false;
    hideScheduledDate: boolean = false;
    hideDoneDate: boolean = false;
    hideDueDate: boolean = false;
    hideRecurrenceRule: boolean = false;
    hideEditButton: boolean = false;
    hideUrgency: boolean = true;
    shortMode: boolean = false;
}

export type LayoutComponent =
    | 'description'
    | 'priority'
    | 'recurrenceRule'
    | 'startDate'
    | 'scheduledDate'
    | 'dueDate'
    | 'doneDate'
    | 'blockLink';

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying LayoutOptions objects.
 */
export class TaskLayout {
    public defaultLayout: LayoutComponent[] = [
        'description',
        'priority',
        'recurrenceRule',
        'startDate',
        'scheduledDate',
        'dueDate',
        'doneDate',
        'blockLink',
    ];
    public layoutComponents: LayoutComponent[];
    public options: LayoutOptions;

    constructor(options?: LayoutOptions, components?: LayoutComponent[]) {
        if (options) this.options = options;
        else this.options = new LayoutOptions();
        if (components) this.layoutComponents = components;
        else this.layoutComponents = this.defaultLayout;

        this.layoutComponents = this.applyOptions(this.options);
    }

    /**
     * Return a new list of components with the given options applied.
     */
    applyOptions(layoutOptions: LayoutOptions): LayoutComponent[] {
        const arrayRemove = (array: any[], value: any) => {
            return array.filter((element) => element != value);
        };
        let newComponents = this.layoutComponents;
        if (layoutOptions.hidePriority) newComponents = arrayRemove(newComponents, 'priority');
        if (layoutOptions.hideRecurrenceRule) newComponents = arrayRemove(newComponents, 'recurrenceRule');
        if (layoutOptions.hideStartDate) newComponents = arrayRemove(newComponents, 'startDate');
        if (layoutOptions.hideScheduledDate) newComponents = arrayRemove(newComponents, 'scheduledDate');
        if (layoutOptions.hideDueDate) newComponents = arrayRemove(newComponents, 'dueDate');
        if (layoutOptions.hideDoneDate) newComponents = arrayRemove(newComponents, 'doneDate');
        return newComponents;
    }
}
