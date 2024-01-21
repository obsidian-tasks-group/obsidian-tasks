import { htmlEncodeCharacter, htmlEncodeString } from '../lib/HTMLCharacterEntities';
import { Status } from './Status';
import { StatusConfiguration, StatusType } from './StatusConfiguration';

/**
 * Tracks all the registered statuses a task can have.
 *
 * There are two ways of using this class.
 * - In 'production' code, that is in the actual plugin code that is released,
 *   call `StatusRegistry.getInstance()` - {@link getInstance} - to obtain the single global instance.
 *   Any changes to the statuses in that instance are reflected everywhere throughout
 *   the plugin.
 *   For example, the code to toggle task statuses use the global instance.
 * - Tests of StatusRegistry capabilities do not need to modify the global instance:
 *   They should use `new StatusRegistry()`, which makes for simpler, more readable
 *   tests that can be run in parallel.
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
     * Code in the plugin should use {@link getInstance} to use and modify the global
     * StatusRegistry.
     *
     * @memberof StatusRegistry
     */
    public constructor() {
        this.addDefaultStatusTypes();
    }

    /**
     * Reset this instance to contain only the given status list, in the supplied order.
     *
     * Duplicate status symbols are ignored.
     * @param statuses
     */
    public set(statuses: StatusConfiguration[] | Status[]) {
        this.clearStatuses();
        statuses.forEach((status) => {
            this.add(status);
        });
    }

    /**
     * Returns all the registered statuses minus the empty status.
     *
     * @readonly
     * @type {Status[]}
     * @memberof StatusRegistry
     */
    public get registeredStatuses(): Status[] {
        return this._registeredStatuses.filter(({ symbol }) => symbol !== Status.EMPTY.symbol);
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
        if (!this.hasSymbol(status.symbol)) {
            if (status instanceof Status) {
                this._registeredStatuses.push(status);
            } else {
                this._registeredStatuses.push(new Status(status));
            }
        }
    }

    /**
     * Returns the registered status by the symbol between the
     * square braces in the markdown task.
     * Returns an EMPTY status if symbol is unknown.
     *
     * @see bySymbolOrCreate
     *
     * @param {string} symbol
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    public bySymbol(symbol: string): Status {
        if (this.hasSymbol(symbol)) {
            return this.getSymbol(symbol);
        }

        return Status.EMPTY;
    }

    /**
     * Returns the registered status by the symbol between the
     * square braces in the markdown task.
     *
     * Creates a usable new Status with this given symbol if symbol is unknown.
     * Note: An unknown symbol is not added to the registry.
     *
     * @see hasSymbol
     *
     * @param {string} symbol
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    public bySymbolOrCreate(symbol: string): Status {
        if (this.hasSymbol(symbol)) {
            return this.getSymbol(symbol);
        }

        return Status.createUnknownStatus(symbol);
    }

    /**
     * Returns the registered status by the name assigned by the user.
     *
     * @param {string} nameToFind
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    public byName(nameToFind: string): Status {
        if (this._registeredStatuses.filter(({ name }) => name === nameToFind).length > 0) {
            return this._registeredStatuses.filter(({ name }) => name === nameToFind)[0];
        }

        return Status.EMPTY;
    }

    /**
     * Resets the array of Status types to the default statuses.
     *
     * @memberof StatusRegistry
     */
    public resetToDefaultStatuses(): void {
        this.clearStatuses();
        this.addDefaultStatusTypes();
    }

    /**
     * Clears the array of Status types to be empty.
     */
    public clearStatuses(): void {
        this._registeredStatuses = [];
    }

    /**
     * To allow custom progression of task status each status knows
     * which status can come after it as a state transition.
     *
     * @return {*}  {Status}
     * @memberof StatusRegistry
     * @see getNextStatusOrCreate
     */
    public getNextStatus(status: Status): Status {
        if (status.nextStatusSymbol !== '') {
            const nextStatus = this.bySymbol(status.nextStatusSymbol);
            if (nextStatus !== null) {
                return nextStatus;
            }
        }
        return Status.EMPTY;
    }

    /**
     * Return the next status if it exists, and if not, create a new
     * TODO status using the requested next symbol.
     *
     * @return {*}  {Status}
     * @memberof StatusRegistry
     * @see getNextStatus
     */
    public getNextStatusOrCreate(status: Status): Status {
        const nextStatus = this.getNextStatus(status);
        if (nextStatus.type !== StatusType.EMPTY) {
            return nextStatus;
        }
        // status is configured to advance to a symbol that is not registered.
        // So we go ahead and create it anyway - we just cannot give it a meaningful name.
        return Status.createUnknownStatus(status.nextStatusSymbol);
    }

    /**
     * Return the status to use for a recurring task that has just been completed.
     *
     * If the next status is not TODO:
     *   - it first advances through the next statuses until it finds a {@link StatusType.TODO} status - which it returns
     *   - or it then advances through the next statuses until it finds an {@link StatusType.IN_PROGRESS} status - which it returns
     *   - otherwise, it uses the status with symbol 'space', which is the default 'TODO' status.
     *
     * @param newStatus - the new status of the task that has just been toggled, which
     *                    is expected to be of type {@link StatusType.DONE}, but this is not checked.
     */
    public getNextRecurrenceStatusOrCreate(newStatus: Status) {
        const nextStatus = this.getNextStatusOrCreate(newStatus);

        const result1 = this.getNextRecurrenceStatusOfType(nextStatus, StatusType.TODO);
        if (result1) {
            return result1;
        }

        const result2 = this.getNextRecurrenceStatusOfType(nextStatus, StatusType.IN_PROGRESS);
        if (result2) {
            return result2;
        }

        // There is no TODO or IN_PROGRESS status in the chain, so we will use a space.
        // This ensures that the new recurrence is always found by 'not done' searches,
        // for safety in vaults where users did not fully set up all statuses.
        // This makes the simplifying assumption that no user is likely to change the
        // status type of space to anything other than TODO - but if they do, it's not
        // our problem.
        return this.bySymbolOrCreate(' ');
    }

    private getNextRecurrenceStatusOfType(nextStatus: Status, wanted: StatusType) {
        if (nextStatus.type === wanted) {
            return nextStatus;
        }
        let searchStatus = nextStatus;
        // The goal here is to avoid an infinite loop. By limiting the search to the number of
        // configured statuses, we ensure it doesn't continue indefinitely.
        for (let i = 0; i < this.registeredStatuses.length - 1; i++) {
            searchStatus = this.getNextStatusOrCreate(searchStatus);
            if (searchStatus.type === wanted) {
                return searchStatus;
            }
        }
        return undefined;
    }

    /**
     * Find any statuses in the given list that are not known to this registry.
     * This can be used to add all unknown status types to the settings,
     * to save users from having to do that manually.
     *
     * Statuses are returned in the order that they are first found in the
     * supplied list.
     * @param allStatuses
     */
    public findUnknownStatuses(allStatuses: Status[]): Status[] {
        const unknownStatuses = allStatuses.filter((s) => {
            return !this.hasSymbol(s.symbol);
        });

        // Use a separate StatusRegistry to keep track of duplicates,
        // because Set is no use to us:
        // https://stackoverflow.com/questions/29759480/how-to-customize-object-equality-for-javascript-set
        const newStatusRegistry = new StatusRegistry();

        const namedUniqueStatuses: Status[] = [];
        unknownStatuses.forEach((s) => {
            // Check if we have seen this symbol already:
            if (newStatusRegistry.hasSymbol(s.symbol)) {
                return;
            }

            // Go ahead and create a suitably-named copy,
            // including the symbol in the name.
            const newStatus = StatusRegistry.copyStatusWithNewName(s, `Unknown (${s.symbol})`);
            namedUniqueStatuses.push(newStatus);
            // And add it to our local registry, to prevent duplicates.
            newStatusRegistry.add(newStatus);
        });

        return namedUniqueStatuses.sort((status1, status2) => {
            return status1.symbol.localeCompare(status2.symbol, undefined, { numeric: true });
        });
    }

    private static copyStatusWithNewName(s: Status, newName: string) {
        const statusConfiguration = new StatusConfiguration(
            s.symbol,
            newName,
            s.nextStatusSymbol,
            s.availableAsCommand,
            s.type,
        );
        return new Status(statusConfiguration);
    }

    /**
     * Filters the Status types by the symbol and returns the first one found.
     *
     * @private
     * @param {string} symbolToFind
     * @return {*}  {Status}
     * @memberof StatusRegistry
     */
    private getSymbol(symbolToFind: string): Status {
        return this._registeredStatuses.filter(({ symbol }) => symbol === symbolToFind)[0];
    }

    /**
     * Filters all the Status types by the symbol and returns true if found.
     *
     * @private
     * @param {string} symbolToFind
     * @return {*}  {boolean}
     * @memberof StatusRegistry
     */
    private hasSymbol(symbolToFind: string): boolean {
        return (
            this._registeredStatuses.find((element) => {
                return element.symbol === symbolToFind;
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
        const defaultStatuses = [Status.makeTodo(), Status.makeInProgress(), Status.makeDone(), Status.makeCancelled()];

        defaultStatuses.forEach((status) => {
            this.add(status);
        });
    }

    /**
     * Create a Mermaid diagram from the statuses in this registry.
     *
     * The text can be pasted in to an Obsidian note to visualise the transitions between
     * statuses.
     *
     * Note: Any of the 'next status symbols' that are not in the registry are ignored, and invisible.
     *
     * @param {boolean} includeDetails - whether to include the status symbols and types in the diagram. Defaults to false.
     */
    public mermaidDiagram(includeDetails = false) {
        const uniqueStatuses = this.registeredStatuses;

        const language = 'mermaid';

        const nodes: string[] = [];
        const edges: string[] = [];
        uniqueStatuses.forEach((status, index) => {
            const label = this.getMermaidNodeLabel(status, includeDetails);
            nodes.push(`${index + 1}${label}`);

            // Check the next status:
            const nextStatus = this.getNextStatus(status);
            this.addEdgeIfNotToInternal(uniqueStatuses, nextStatus, edges, index, false);

            // For recurring tasks, if Tasks would override the next status after a DONE task,
            // to force it to be TODO or IN_PROGRESS, then we want to show this visually.
            if (status.type === StatusType.DONE) {
                const nextRecurringStatus = this.getNextRecurrenceStatusOrCreate(status);
                const nextRecurringTypeDiffers = nextRecurringStatus.symbol !== nextStatus.symbol;
                if (nextRecurringTypeDiffers) {
                    this.addEdgeIfNotToInternal(uniqueStatuses, nextRecurringStatus, edges, index, true);
                }
            }
        });

        return `
\`\`\`${language}
flowchart LR

classDef TODO        stroke:#f33,stroke-width:3px;
classDef DONE        stroke:#0c0,stroke-width:3px;
classDef IN_PROGRESS stroke:#fa0,stroke-width:3px;
classDef CANCELLED   stroke:#ddd,stroke-width:3px;
classDef NON_TASK    stroke:#99e,stroke-width:3px;

${nodes.join('\n')}
${edges.join('\n')}

linkStyle default stroke:gray
\`\`\`
`;
    }

    private addEdgeIfNotToInternal(
        uniqueStatuses: Status[],
        nextStatus: Status,
        edges: string[],
        index: number,
        isForReccurenceOverride: boolean,
    ) {
        const nextStatusIndex = uniqueStatuses.findIndex((status) => status.symbol === nextStatus.symbol);
        const nextStatusIsKnown = nextStatusIndex !== -1;
        const nextStatusIsNotInternal = nextStatus.type !== StatusType.EMPTY;

        if (nextStatusIsKnown && nextStatusIsNotInternal) {
            let joiner;
            if (isForReccurenceOverride) {
                joiner = '-. "🔁" .-> ';
            } else {
                joiner = ' --> ';
            }
            const line = `${index + 1}${joiner}${nextStatusIndex + 1}`;
            edges.push(line);
        }
    }

    private getMermaidNodeLabel(status: Status, includeDetails: boolean) {
        const statusName = htmlEncodeString(status.name);
        const statusType = status.type;
        if (includeDetails) {
            const statusSymbol = htmlEncodeCharacter(status.symbol);
            const statusNextStatusSymbol = htmlEncodeCharacter(status.nextStatusSymbol);

            const transitionText = `[${statusSymbol}] -> [${statusNextStatusSymbol}]`;
            const statusNameText = `'${statusName}'`;
            const statusTypeText = `(${statusType})`;

            return `["${statusNameText}<br>${transitionText}<br>${statusTypeText}"]:::${statusType}`;
        } else {
            return `["${statusName}"]:::${statusType}`;
        }
    }
}
