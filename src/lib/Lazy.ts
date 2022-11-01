/**
 * Lazy loaded variable : fetching the value is postponed until the first get()
 */
export class Lazy<T> {
    private _value: T | undefined = undefined;

    /**
     * Construct a lazy object
     * @param fetch a function that produces a value
     */
    constructor(private fetch: () => T) {}

    /**
     * Retrieve the lazy value, calling the fetch function the first time.
     */
    get value(): T {
        if (this._value === undefined) {
            this._value = this.fetch();
        }

        return this._value;
    }
}
