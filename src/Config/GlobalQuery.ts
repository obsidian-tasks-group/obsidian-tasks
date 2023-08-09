import { Query } from './../Query/Query';
import { getSettings, updateSettings } from './Settings';

export class GlobalQuery {
    static empty = '';

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

    static string() {
        return getSettings().globalQuery;
    }

    static set(value: string) {
        updateSettings({ globalQuery: value });
    }

    static isEmpty() {
        return GlobalQuery.string().trim() == GlobalQuery.empty;
    }

    static explain() {
        return GlobalQuery.get().explainQuery();
    }

    static reset() {
        updateSettings({ globalQuery: GlobalQuery.empty });
    }
}
