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
        return StatusConfiguration.validateOneIndicator(this.indicator, 'Task Status Symbol');
    }

    public validateNextIndicator(): string[] {
        return StatusConfiguration.validateOneIndicator(this.nextStatusIndicator, 'Task Next Status Symbol');
    }

    public validateName() {
        const errors: string[] = [];
        if (this.name.length === 0) {
            errors.push('Task Status Name cannot be empty.');
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
