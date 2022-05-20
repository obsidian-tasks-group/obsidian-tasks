import { Status } from './Status';

/**
 * Tracks all the registered statuses a task can have.
 *
 * @export
 * @class StatusRegistry
 */
export class StatusRegistry {
    private static instance: StatusRegistry;

    private _registeredStatuses: Status[] = [];

    /**
     * Returns all the registered statuses minus the empty status.
     *
     * @readonly
     * @type {Status[]}
     * @memberof StatusRegistry
     */
    public get registeredStatuses(): Status[] {
        return this._registeredStatuses.filter(
            ({ indicator }) => indicator !== Status.EMPTY.indicator,
        );
    }

    /**
     * Creates an instance of Status and registers it for use. It will also check to see
     * if the default todo and done are registered and if not handle it internally.
     *
     * @memberof StatusRegistry
     */
    private constructor() {
        this.clearStatuses();
    }

    /**
     * The static method that controls the access to the StatusRegistry instance.
     *
     * @static
     * @return {*}  {StatusRegistry}
     * @memberof StatusRegistry
     */
    public static getInstance(): StatusRegistry {
        if (!StatusRegistry.instance) {
            StatusRegistry.instance = new StatusRegistry();
        }

        return StatusRegistry.instance;
    }

    /**
     * Adds a new Status to the registry if not already registered.
     *
     * @param {Status} status
     * @memberof StatusRegistry
     */
    public add(status: Status): void {
        if (!this.hasIndicator(status.indicator)) {
            status.statusRegistry = this;
            this._registeredStatuses.push(status);
        }
    }

    /**
     * Returns the registered status by the indicator between the
     * square braces in the markdown task.
     *
     * @param {string} indicator
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    public byIndicator(indicator: string): Status {
        if (this.hasIndicator(indicator)) {
            return this.getIndicator(indicator);
        }

        return Status.EMPTY;
    }

    /**
     * Returns the registered status by the name assigned by the user.
     *
     * @param {string} nameToFind
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    public byName(nameToFind: string): Status {
        if (
            this._registeredStatuses.filter(({ name }) => name === nameToFind)
                .length > 0
        ) {
            return this._registeredStatuses.filter(
                ({ name }) => name === nameToFind,
            )[0];
        }

        return Status.EMPTY;
    }

    /**
     * Resets the array os Status types to be empty.
     *
     * @memberof StatusRegistry
     */
    public clearStatuses(): void {
        this._registeredStatuses = [];
        this.addDefaultStatusTypes();
    }

    /**
     * To allow custom progression of task status each status knows
     * which status can come after it as a state transition.
     *
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    public getNextStatus(status: Status): Status {
        if (status.nextStatusIndicator !== '') {
            const nextStatus = this.byIndicator(status.nextStatusIndicator);
            if (nextStatus !== null) {
                return nextStatus;
            }
        }
        return Status.EMPTY;
    }

    /**
     * Filters the Status types by the indicator and returns the first one found.
     *
     * @private
     * @param {string} indicatorToFind
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    private getIndicator(indicatorToFind: string): Status {
        return this._registeredStatuses.filter(
            ({ indicator }) => indicator === indicatorToFind,
        )[0];
    }

    /**
     * Filters all the Status types by the indicator and returns true if found.
     *
     * @private
     * @param {string} indicatorToFind
     * @return {*}  {boolean}
     * @memberof StatusRegistry
     */
    private hasIndicator(indicatorToFind: string): boolean {
        return (
            this._registeredStatuses.filter(
                ({ indicator }) => indicator === indicatorToFind,
            ).length > 0
        );
    }

    /**
     * Checks the registry and adds the default status types.
     *
     * @private
     * @memberof StatusRegistry
     */
    private addDefaultStatusTypes(): void {
        const defaultStatuses = [
            Status.TODO,
            Status.IN_PROGRESS,
            Status.DONE,
            Status.CANCELLED,
            Status.EMPTY,
        ];

        defaultStatuses.forEach((status) => {
            this.add(status);
        });
    }
}
