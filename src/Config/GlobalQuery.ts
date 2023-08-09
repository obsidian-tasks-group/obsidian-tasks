import { Query } from './../Query/Query';
import { getSettings, updateSettings } from './Settings';

export class GlobalQuery {
    static empty = '';

    static query(): Query {
        return new Query({ source: getSettings().globalQuery });
    }

    static get(): string {
        return getSettings().globalQuery;
    }

    static set(value: string) {
        updateSettings({ globalQuery: value });
    }

    static isEmpty(): boolean {
        return GlobalQuery.get().trim() == GlobalQuery.empty;
    }

    static explainQuery(): string {
        return GlobalQuery.query().explainQuery();
    }

    static reset() {
        updateSettings({ globalQuery: GlobalQuery.empty });
    }
}
