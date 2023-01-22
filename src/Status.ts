import { StatusConfiguration, StatusType } from './StatusConfiguration';
import type { StatusCollectionEntry } from './StatusCollection';

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
    public static DONE: Status = Status.makeDone();

    /**
     * A default status of empty, used when things go wrong.
     *
     * @static
     * @memberof Status
     */
    public static EMPTY: Status = Status.makeEmpty();

    /**
     * The default Todo status. Goes to Done when toggled.
     * User may later be able to override this to go to In Progress instead.
     *
     * @static
     * @type {Status}
     * @memberof Status
     */
    public static TODO: Status = Status.makeTodo();

    /**
     * The configuration stored in the data.json file.
     *
     * @type {StatusConfiguration}
     * @memberof Status
     */
    public readonly configuration: StatusConfiguration;

    /**
     * The symbol used between the two square brackets in the markdown task.
     *
     * @type {string}
     * @memberof Status
     */
    public get symbol(): string {
        return this.configuration.symbol;
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
    public get nextStatusSymbol(): string {
        return this.configuration.nextStatusSymbol;
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
     * Returns the status type. See {@link StatusType} for details.
     */
    public get type(): StatusType {
        return this.configuration.type;
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
     * The default Done status. Goes to Todo when toggled.
     */
    static makeDone(): Status {
        return new Status(new StatusConfiguration('x', 'Done', ' ', true, StatusType.DONE));
    }

    /**
     * A default status of empty, used when things go wrong.
     */
    static makeEmpty(): Status {
        return new Status(new StatusConfiguration('', 'EMPTY', '', true, StatusType.EMPTY));
    }

    /**
     * The default Todo status. Goes to Done when toggled.
     * User may later be able to override this to go to In Progress instead.
     */
    static makeTodo(): Status {
        return new Status(new StatusConfiguration(' ', 'Todo', 'x', true, StatusType.TODO));
    }

    /**
     * The default Cancelled status. Goes to Todo when toggled.
     */
    static makeCancelled(): Status {
        return new Status(new StatusConfiguration('-', 'Cancelled', ' ', true, StatusType.CANCELLED));
    }

    /**
     * The default In Progress status. Goes to Done when toggled.
     */
    static makeInProgress(): Status {
        return new Status(new StatusConfiguration('/', 'In Progress', 'x', true, StatusType.IN_PROGRESS));
    }

    /**
     * Return the StatusType to use for a symbol, if it is not in the StatusRegistry.
     * The core symbols are recognised.
     * Other symbols are treated as StatusType.TODO
     * @param symbol
     */
    static getTypeForUnknownSymbol(symbol: string): StatusType {
        switch (symbol) {
            case 'x':
            case 'X':
                return StatusType.DONE;
            case '/':
                return StatusType.IN_PROGRESS;
            case '-':
                return StatusType.CANCELLED;
            case '':
                return StatusType.EMPTY;
            case ' ':
            default:
                return StatusType.TODO;
        }
    }

    /**
     * Convert text that was saved from a StatusType value back to a StatusType.
     * Returns StatusType.TODO if the string is not valid.
     * @param statusTypeAsString
     */
    static getTypeFromStatusTypeString(statusTypeAsString: string): StatusType {
        return StatusType[statusTypeAsString as keyof typeof StatusType] || StatusType.TODO;
    }

    /**
     * Create a Status representing the given, unknown symbol.
     *
     * This can be useful when StatusRegistry does not recognise a symbol,
     * and we do not want to expose the user's data to the Status.EMPTY status.
     *
     * The type is set to TODO.
     * @param unknownSymbol
     */
    static createUnknownStatus(unknownSymbol: string) {
        return new Status(new StatusConfiguration(unknownSymbol, 'Unknown', 'x', false, StatusType.TODO));
    }

    /**
     * Helper function for bulk-importing settings from arrays of strings.
     *
     * @param imported An array of symbol, name, next symbol, status type
     */
    static createFromImportedValue(imported: StatusCollectionEntry) {
        const symbol = imported[0];
        const type = Status.getTypeFromStatusTypeString(imported[3]);
        return new Status(new StatusConfiguration(symbol, imported[1], imported[2], false, type));
    }

    /**
     * Returns the completion status for a task, this is only supported
     * when the task is done/x.
     *
     * @return {*}  {boolean}
     * @memberof Status
     */
    public isCompleted(): boolean {
        return this.type === StatusType.DONE;
    }

    /**
     * Return a one-line summary of the status, for presentation to users.
     */
    public previewText() {
        let commandNotice = '';
        if (Status.tasksPluginCanCreateCommandsForStatuses() && this.availableAsCommand) {
            commandNotice = ' Available as a command.';
        }
        return (
            `- [${this.symbol}]` + // comment to break line
            ` => [${this.nextStatusSymbol}],` +
            ` name: '${this.name}',` +
            ` type: '${this.configuration.type}'.` +
            `${commandNotice}`
        );
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
