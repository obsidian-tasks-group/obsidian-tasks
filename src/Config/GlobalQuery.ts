import { Query } from '../Query/Query';

/**
 * Global Query set in the {@link SettingsTab} and associated services.
 *
 * There are two ways of using this class.
 * - In 'production' code, that is in the actual plugin code that is released,
 *   call {@link GlobalQuery.getInstance()} to obtain the single global instance.
 * - Tests of Global Query capabilities do not need to modify the global instance:
 *   They should use `new GlobalQuery()`, which makes simpler, more readable
 *   tests that can be run in parallel.
 *
 * @export
 * @class GlobalQuery
 */
export class GlobalQuery {
    private static instance: GlobalQuery;

    static empty = '';
    private _source;

    /**
     * Creates an instance of Global Query object.
     *
     * Code in the plugin should use {@link getInstance} to access the Global Query services.
     */
    constructor(source: string = GlobalQuery.empty) {
        this._source = source;
    }

    /**
     * Provides access to the single global instance of the Global Query.
     * This should be used in the plugin code.
     */
    public static getInstance(): GlobalQuery {
        if (!GlobalQuery.instance) {
            GlobalQuery.instance = new GlobalQuery();
        }

        return GlobalQuery.instance;
    }

    public set(source: string) {
        this._source = source;
    }

    /**
     * Returns {@link Query} object with the Global Query
     * @param path
     */
    public query(path: string | undefined = undefined): Query {
        return new Query(this._source, path);
    }

    /**
     * Returns true if the Global Query contains characters except line breaks and spaces.
     *
     */
    public hasInstructions() {
        return this._source.trim() !== GlobalQuery.empty;
    }
}
