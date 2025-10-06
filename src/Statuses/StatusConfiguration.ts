/**
 * Collection of status types supported by the plugin.
 */
export enum StatusType {
    TODO = 'TODO',
    DONE = 'DONE',
    IN_PROGRESS = 'IN_PROGRESS',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED',
    NON_TASK = 'NON_TASK',
    EMPTY = 'EMPTY',
}

/**
 * This is the object stored by the Obsidian configuration and used to create the status
 * objects for the session
 *
 * @class StatusConfiguration
 */
export class StatusConfiguration {
    /**
     * The character used between the two square brackets in the markdown task.
     *
     * @type {string}
     */
    public readonly symbol: string;

    /**
     * Returns the name of the status for display purposes.
     *
     * @type {string}
     */
    public readonly name: string;

    /**
     * Returns the next status for a task when toggled.
     *
     * @type {string}
     */
    public readonly nextStatusSymbol: string;

    /**
     * If true then it is registered as a command that the user can map to.
     *
     * @type {boolean}
     */
    public readonly availableAsCommand: boolean;

    /**
     * Returns the status type. See {@link StatusType} for details.
     */
    public readonly type: StatusType;

    /**
     * Creates an instance of Status. The registry will be added later in the case
     * of the default statuses.
     *
     * @param {string} symbol
     * @param {string} name
     * @param {Status} nextStatusSymbol
     * @param {boolean} availableAsCommand
     * @param {StatusType} type
     */
    constructor(
        symbol: string,
        name: string,
        nextStatusSymbol: string,
        availableAsCommand: boolean,
        type: StatusType = StatusType.TODO, // TODO Remove default value
    ) {
        this.symbol = symbol;
        this.name = name;
        this.nextStatusSymbol = nextStatusSymbol;
        this.availableAsCommand = availableAsCommand;
        this.type = type;
    }
}
