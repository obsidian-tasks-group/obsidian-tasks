import { Query } from '../Query/Query';

export class GlobalQuery {
    private static instance: GlobalQuery;

    static empty = '';
    private _source;

    public static getInstance(): GlobalQuery {
        if (!GlobalQuery.instance) {
            GlobalQuery.instance = new GlobalQuery();
        }

        return GlobalQuery.instance;
    }

    constructor(source: string = GlobalQuery.empty) {
        this._source = source;
    }

    public set(source: string) {
        this._source = source;
    }

    public get query(): Query {
        return new Query({ source: this._source });
    }

    public isEmpty() {
        return this._source.trim() === GlobalQuery.empty;
    }
}
