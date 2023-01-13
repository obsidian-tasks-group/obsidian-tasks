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
     * Determine whether the date in this object is valid, and return error message(s) for display if not.
     */
    public validate(): string[] {
        const errors: string[] = [];

        // Messages are added in the order fields are shown when editing statuses.
        errors.push(...this.validateIndicator());
        errors.push(...this.validateName());
        errors.push(...this.validateNextIndicator());

        return errors;
    }

    public validateIndicator(): string[] {
        return StatusConfiguration.validateOneIndicator(this.indicator, 'Symbol');
    }

    public validateNextIndicator(): string[] {
        return StatusConfiguration.validateOneIndicator(this.nextStatusIndicator, 'Next symbol');
    }

    public validateName() {
        const errors: string[] = [];
        if (this.name.length === 0) {
            errors.push('Name cannot be empty.');
        }
        return errors;
    }

    private static validateOneIndicator(indicator: string, indicatorName: string): string[] {
        const errors: string[] = [];
        if (indicator.length === 0) {
            errors.push(`${indicatorName} cannot be empty.`);
        }

        if (indicator.length > 1) {
            errors.push(`${indicatorName} ("${indicator}") must be a single character.`);
        }
        return errors;
    }
}

/**
 * Tracks the possible states that a task can be in.
 *
 * Related classes:
 * @see StatusConfiguration
 * @see StatusRegistry
 * @see StatusSettings
 * @see StatusSettingsHelpers.ts
 * @see CustomStatusModal
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
     * The default Cancelled status. Goes to Todo when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static CANCELLED: Status = new Status(new StatusConfiguration('-', 'Cancelled', ' ', true));

    /**
     * The default In Progress status. Goes to Done when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static IN_PROGRESS: Status = new Status(new StatusConfiguration('/', 'In Progress', 'x', true));

    /**
     * The configuration stored in the data.json file.
     *
     * @type {StatusConfiguration}
     * @memberof Status
     */
    public readonly configuration: StatusConfiguration;

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
     * Create a Status representing the given, unknown indicator.
     *
     * This can be useful when StatusRegistry does not recognise an indicator,
     * and we do not want to expose the user's data to the Status.EMPTY status.
     * @param unknownIndicator
     */
    static createUnknownStatus(unknownIndicator: string) {
        return new Status(new StatusConfiguration(unknownIndicator, 'Unknown', 'x', false));
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
