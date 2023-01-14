import { StatusConfiguration } from './StatusConfiguration';

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
    public static DONE: Status = new Status(StatusConfiguration.makeDone());

    /**
     * A default status of empty, used when things go wrong.
     *
     * @static
     * @memberof Status
     */
    public static EMPTY: Status = new Status(StatusConfiguration.makeEmpty());

    /**
     * The default Todo status. Goes to Done when toggled.
     * User may later be able to override this to go to In Progress instead.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static TODO: Status = new Status(StatusConfiguration.makeTodo());

    /**
     * The configuration stored in the data.json file.
     *
     * @type {StatusConfiguration}
     * @memberof Status
     */
    public readonly configuration: StatusConfiguration;

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
