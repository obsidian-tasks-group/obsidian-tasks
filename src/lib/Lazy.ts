/**
 * Lazy loaded variable : fetching the value is postponed until the first obtain()
 */
export class Lazy<T> {
    private _value: T | undefined = undefined;

    /**
     * Construct a lazy object
     * @param obtain a function that produces a value
     */
    constructor(private readonly obtain: () => T) {}

    /**
     * Retrieve the lazy value, calling the obtain function the first time.
     */
    get value(): T {
        if (this._value === undefined) {
            this._value = this.obtain();
        }

        return this._value;
    }
}
