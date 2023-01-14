/**
 * This is the object stored by the Obsidian configuration and used to create the status
 * objects for the session
 *
 * @export
 * @class StatusConfiguration
 */
export class StatusConfiguration {
    /**
     * The default Done status. Goes to Todo when toggled.
     */
    static makeDone(): StatusConfiguration {
        return new StatusConfiguration('x', 'Done', ' ', true);
    }

    /**
     * A default status of empty, used when things go wrong.
     */
    static makeEmpty(): StatusConfiguration {
        return new StatusConfiguration('', 'EMPTY', '', true);
    }

    /**
     * The default Todo status. Goes to Done when toggled.
     * User may later be able to override this to go to In Progress instead.
     */
    static makeTodo(): StatusConfiguration {
        return new StatusConfiguration(' ', 'Todo', 'x', true);
    }

    /**
     * The default Cancelled status. Goes to Todo when toggled.
     */
    static makeCancelled(): StatusConfiguration {
        return new StatusConfiguration('-', 'Cancelled', ' ', true);
    }

    /**
     * The default In Progress status. Goes to Done when toggled.
     */
    static makeInProgress(): StatusConfiguration {
        return new StatusConfiguration('/', 'In Progress', 'x', true);
    }

    /**
     * The indicator used between the two square brackets in the markdown task.
     *
     * @type {string}
     * @memberof Status
     */
    public readonly indicator: string;

    /**
     * Returns the name of the status for display purposes.
     *
     * @type {string}
     * @memberof Status
     */
    public readonly name: string;

    /**
     * Returns the next status for a task when toggled.
     *
     * @type {string}
     * @memberof Status
     */
    public readonly nextStatusIndicator: string;

    /**
     * If true then it is registered as a command that the user can map to.
     *
     * @type {boolean}
     * @memberof Status
     */
    public readonly availableAsCommand: boolean;

    /**
     * Creates an instance of Status. The registry will be added later in the case
     * of the default statuses.
     *
     * @param {string} indicator
     * @param {string} name
     * @param {Status} nextStatusIndicator
     * @param {boolean} availableAsCommand
     * @memberof Status
     */
    constructor(indicator: string, name: string, nextStatusIndicator: string, availableAsCommand: boolean) {
        this.indicator = indicator;
        this.name = name;
        this.nextStatusIndicator = nextStatusIndicator;
        this.availableAsCommand = availableAsCommand;
    }

    /**
     * Return a one-line summary of the status, for presentation to users.
     */
    public previewText() {
        let commandNotice = '';
        if (StatusConfiguration.tasksPluginCanCreateCommandsForStatuses() && this.availableAsCommand) {
            commandNotice = 'Available as a command.';
        }
        return `- [${this.indicator}] ${this.name}, next status is '${this.nextStatusIndicator}'. ${commandNotice}`;
    }

    /**
     * Whether Tasks can yet create 'Toggle Status' commands for statuses
     *
     * This is not yet possible, and so some UI features are temporarily hidden.
     * See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1486
     * Once that issue is addressed, this method can be removed.
     */
    public static tasksPluginCanCreateCommandsForStatuses(): boolean {
        return false;
    }
}
