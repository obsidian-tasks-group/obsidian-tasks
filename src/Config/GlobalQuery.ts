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

    public set(value: string) {
        this._value = value;
    }

    public get() {
        return this._value;
    }

    public query(): Query {
        return new Query({ source: this._value });
    }

    public isEmpty() {
        return this._value === GlobalQuery.empty;
    }
}
