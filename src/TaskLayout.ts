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
    explainQuery: boolean = false;
}

// I was confused as to why this does not include all the values in LayoutOptions.
// From reading the code, I think the answer is that that it only contains
// the options that reflect the contents of a rendered Task.
// If that is correct, I think things would be clearer if this was named something
// like TaskLayoutComponent
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
 * modified by applying {@link LayoutOptions} objects.
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
        // Please use {} so the pattern in the code is clear.
        // Or convert to ternary operator
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
    applyOptions(layoutOptions: LayoutOptions): LayoutComponent[] {
        const arrayRemove = (array: any[], value: any) => {
            return array.filter((element) => element != value);
        };
        // The pattern in names here is hard to see, for example to glance and check that
        // the names are consistent on each line.
        let newComponents = this.layoutComponents;
        if (layoutOptions.hidePriority) {
            newComponents = arrayRemove(newComponents, 'priority');
        }
        if (layoutOptions.hideRecurrenceRule) {
            newComponents = arrayRemove(newComponents, 'recurrenceRule');
        }
        if (layoutOptions.hideStartDate) {
            newComponents = arrayRemove(newComponents, 'startDate');
        }
        if (layoutOptions.hideScheduledDate) {
            newComponents = arrayRemove(newComponents, 'scheduledDate');
        }
        if (layoutOptions.hideDueDate) {
            newComponents = arrayRemove(newComponents, 'dueDate');
        }
        if (layoutOptions.hideDoneDate) {
            newComponents = arrayRemove(newComponents, 'doneDate');
        }
        // Suggest adding a comment saying why description and blocklink are not in this list
        return newComponents;
    }
}
