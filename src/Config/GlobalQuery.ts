import { Query } from './../Query/Query';
import { getSettings } from './Settings';

export class GlobalQuery {
    static get(): Query {
        const globalQuerySource = GlobalQuery.source();
        return new Query(globalQuerySource);
    }

    /**
     * Retrieves the source of the global {@link Query}
     */
    static source(): { source: string } {
        return { source: getSettings().globalQuery };
    }
}
