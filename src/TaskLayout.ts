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
        const newComponents = this.layoutComponents;
        if (layoutOptions.hidePriority) newComponents.remove('priority');
        if (layoutOptions.hideRecurrenceRule) newComponents.remove('recurrenceRule');
        if (layoutOptions.hideStartDate) newComponents.remove('startDate');
        if (layoutOptions.hideScheduledDate) newComponents.remove('scheduledDate');
        if (layoutOptions.hideDueDate) newComponents.remove('dueDate');
        if (layoutOptions.hideDoneDate) newComponents.remove('doneDate');
        return newComponents;
    }
}
