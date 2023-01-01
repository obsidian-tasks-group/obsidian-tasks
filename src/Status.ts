/**
 * This is the object stored by the Obsidian configuration and used to create the status
 * objects for the session
 *
 * @export
 * @class StatusConfiguration
 */
export class StatusConfiguration {
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
     * @param {bool} availableAsCommand
     * @memberof Status
     */
    constructor(indicator: string, name: string, nextStatusIndicator: string, availableAsCommand: boolean) {
        this.indicator = indicator;
        this.name = name;
        this.nextStatusIndicator = nextStatusIndicator;
        this.availableAsCommand = availableAsCommand;
    }
}

/**
 * Tracks the possible states that a task can be in.
 *
 * @export
 * @class Status
 */
export class Status {
    /**
     * The default Done status. Goes to Todo when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static DONE: Status = new Status(new StatusConfiguration('x', 'Done', ' ', true));

    /**
     * A default status of empty, used when things go wrong.
     *
     * @static
     * @memberof Status
     */
    public static EMPTY: Status = new Status(new StatusConfiguration('', 'EMPTY', '', true));

    /**
     * The default Todo status. Goes to Done when toggled.
     * User may later be able to override this to go to In Progress instead.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static TODO: Status = new Status(new StatusConfiguration(' ', 'Todo', 'x', true));

    /**
     * The configuration stored in the data.json file.
     *
     * @type {StatusConfiguration}
     * @memberof Status
     */
    private readonly configuration: StatusConfiguration;

    /**
     * The indicator used between the two square brackets in the markdown task.
     *
     * @type {string}
     * @memberof Status
     */
    public get indicator(): string {
        return this.configuration.indicator;
    }

    /**
     * Returns the name of the status for display purposes.
     *
     * @type {string}
     * @memberof Status
     */
    public get name(): string {
        return this.configuration.name;
    }

    /**
     * Returns the next status for a task when toggled.
     *
     * @type {string}
     * @memberof Status
     */
    public get nextStatusIndicator(): string {
        return this.configuration.nextStatusIndicator;
    }

    /**
     * If true then it is registered as a command that the user can map to.
     *
     * @type {boolean}
     * @memberof Status
     */
    public get availableAsCommand(): boolean {
        return this.configuration.availableAsCommand;
    }

    /**
     * Creates an instance of Status. The registry will be added later in the case
     * of the default statuses.
     *
     * @param {StatusConfiguration} configuration
     * @memberof Status
     */
    constructor(configuration: StatusConfiguration) {
        this.configuration = configuration;
    }

    /**
     * Returns the completion status for a task, this is only supported
     * when the task is done/x.
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    public isCompleted(): boolean {
        return this.indicator === 'x' || this.indicator === 'X';
    }
}
