import type { StatusRegistry } from 'StatusRegistry';

/**
 * Tracks the possible states that a task can be in.
 *
 * @export
 * @class Status
 */
export class Status {
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
     * Returns the next status for a task when toggled.
     *
     * @type {StatusRegistry}
     * @memberof Status
     */
    public statusRegistry: StatusRegistry | undefined;

    /**
     * The default Done status. Goes to Todo when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static DONE: Status = new Status('x', 'Done', ' ');

    /**
     * A default status of empty, used when things go wrong.
     *
     * @static
     * @memberof Status
     */
    public static EMPTY: Status = new Status('', 'EMPTY', '');

    /**
     * The default Todo status. Goes to In Progress when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static TODO: Status = new Status(' ', 'Todo', '/');

    /**
     * The default Cancelled status. Goes to Todo when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static CANCELLED: Status = new Status('-', 'Cancelled', ' ');

    /**
     * The default In Progress status. Goes to Done when toggled.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static IN_PROGRESS: Status = new Status('/', 'In Progress', 'x');

    /**
     * Creates an instance of Status. The registry will be added later in the case
     * of the default statuses.
     *
     * @param {string} indicator
     * @param {string} name
     * @param {Status} nextStatusIndicator
     * @memberof Status
     */
    constructor(
        indicator: string,
        name: string,
        nextStatusIndicator: string,
        statusRegistry: StatusRegistry | undefined = undefined,
    ) {
        this.indicator = indicator;
        this.name = name;
        this.nextStatusIndicator = nextStatusIndicator;
        this.statusRegistry = statusRegistry;
    }

    /**
     * Returns the completion status for a task, this is only supported
     * when the task is done/x.
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    public isCompleted(): boolean {
        return this.indicator === 'x';
    }
}
