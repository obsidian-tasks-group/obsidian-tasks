import { Status, StatusConfiguration } from './Status';

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
     * Creates an instance of Status and registers it for use. It will also check to see
     * if the default todo and done are registered and if not handle it internally.
     *
     * @memberof StatusRegistry
     */
    private constructor() {
        this.addDefaultStatusTypes();
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
     * @param {StatusConfiguration | Status} status
     * @memberof StatusRegistry
     */
    public add(status: StatusConfiguration | Status): void {
        if (!this.hasIndicator(status.indicator)) {
            if (status instanceof Status) {
                this._registeredStatuses.push(status);
            } else {
                this._registeredStatuses.push(new Status(status));
            }
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
        return this._registeredStatuses.filter(({ indicator }) => indicator === indicatorToFind)[0];
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
            this._registeredStatuses.find((element) => {
                return element.indicator === indicatorToFind;
            }) !== undefined
        );
    }

    /**
     * Checks the registry and adds the default status types.
     *
     * @private
     * @memberof StatusRegistry
     */
    private addDefaultStatusTypes(): void {
        const defaultStatuses = [Status.TODO, Status.DONE, Status.EMPTY];

        defaultStatuses.forEach((status) => {
            this.add(status);
        });
    }
}
