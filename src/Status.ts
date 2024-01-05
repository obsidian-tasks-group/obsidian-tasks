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
     * @see nextSymbol
     */
    public get nextStatusSymbol(): string {
        return this.configuration.nextStatusSymbol;
    }

    /**
     * Returns the next status for a task when toggled.
     * This is an alias for {@link nextStatusSymbol} which is provided for brevity in user scripts.
     *
     * @type {string}
     * @memberof Status
     * @see nextStatusSymbol
     */
    public get nextSymbol(): string {
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
     * Returns the text to be used to represent the {@link StatusType} in group headings.
     *
     * The status types are in the same order as given by 'group by status.type'.
     * This is provided as a convenience for use in custom grouping.
     */
    public get typeGroupText(): string {
        const type = this.type;
        let prefix: string;
        // Add a numeric prefix to sort in to a meaningful order for users
        switch (type) {
            case StatusType.IN_PROGRESS:
                prefix = '1';
                break;
            case StatusType.TODO:
                prefix = '2';
                break;
            case StatusType.DONE:
                prefix = '3';
                break;
            case StatusType.CANCELLED:
                prefix = '4';
                break;
            case StatusType.NON_TASK:
                prefix = '5';
                break;
            case StatusType.EMPTY:
                prefix = '6';
                break;
        }
        // Text inside the %%..%% comments is used to control the sorting in both sorting of tasks and naming of groups.
        // The comments are hidden by Obsidian when the headings are rendered.
        return `%%${prefix}%%${type}`;
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
     * A sample Non-Task status. Goes to NON_TASK when toggled.
     */
    static makeNonTask(): Status {
        return new Status(new StatusConfiguration('Q', 'Non-Task', 'A', true, StatusType.NON_TASK));
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
     * Whether the task status type is {@link CANCELLED}.
     */
    public isCancelled(): boolean {
        return this.type === StatusType.CANCELLED;
    }

    /**
     * Compare all the fields in another Status, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * @param other
     */
    public identicalTo(other: Status): boolean {
        const args: Array<keyof StatusConfiguration> = [
            'symbol',
            'name',
            'nextStatusSymbol',
            'availableAsCommand',
            'type',
        ];
        for (const el of args) {
            if (this[el] !== other[el]) return false;
        }
        return true;
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
