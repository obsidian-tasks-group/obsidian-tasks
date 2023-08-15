import { Query } from '../Query/Query';

export class GlobalQuery {
    private static instance: GlobalQuery;

    static empty = '';
    private _value = GlobalQuery.empty;

    public static getInstance(): GlobalQuery {
        if (!GlobalQuery.instance) {
            GlobalQuery.instance = new GlobalQuery();
        }

        return GlobalQuery.instance;
    }

    public new_set(value: string) {
        this._value = value;
    }

    public new_get() {
        return this._value;
    }

    public new_query(): Query {
        return new Query({ source: this._value });
    }

    public new_isEmpty() {
        return this._value === GlobalQuery.empty;
    }
}
