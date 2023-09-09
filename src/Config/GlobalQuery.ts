import { Query } from '../Query/Query';

export class GlobalQuery {
    private static instance: GlobalQuery;

    static empty = '';
    private _value;

    public static getInstance(): GlobalQuery {
        if (!GlobalQuery.instance) {
            GlobalQuery.instance = new GlobalQuery();
        }

        return GlobalQuery.instance;
    }

    constructor(source: string = GlobalQuery.empty) {
        this._value = source;
    }

    public set(value: string) {
        this._value = value;
    }

    public get query(): Query {
        return new Query({ source: this._value });
    }

    public isEmpty() {
        return this._value.trim() === GlobalQuery.empty;
    }
}
