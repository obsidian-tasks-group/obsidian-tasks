import { Query } from './../Query/Query';
import { getSettings, updateSettings } from './Settings';

export class GlobalQuery {
    static empty = '';

    static get(): Query {
        return new Query({ source: getSettings().globalQuery });
    }

    static string(): string {
        return getSettings().globalQuery;
    }

    static set(value: string) {
        updateSettings({ globalQuery: value });
    }

    static isEmpty(): boolean {
        return GlobalQuery.string().trim() == GlobalQuery.empty;
    }

    static explain(): string {
        return GlobalQuery.get().explainQuery();
    }

    static reset() {
        updateSettings({ globalQuery: GlobalQuery.empty });
    }
}
