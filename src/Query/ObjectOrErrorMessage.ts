// @ts-ignore
import { Filter } from './Filter/Filter';

export class ObjectOrErrorMessage {
    readonly instruction: string;
    private _object: Filter | undefined;
    private _error: string | undefined;

    constructor(instruction: string) {
        this.instruction = instruction;
    }

    public get object(): Filter | undefined {
        return this._object;
    }

    private set object(value: Filter | undefined) {
        this._object = value;
    }

    public get error(): string | undefined {
        return this._error;
    }

    private set error(value: string | undefined) {
        this._error = value;
    }

    /**
     * Construct a FilterOrErrorMessage with the filter.
     *
     * This function allows a meaningful {@link Explanation} to be supplied.
     * @param instruction
     * @param object - a {@link Filter}
     */
    public static fromObject(instruction: string, object: Filter): ObjectOrErrorMessage {
        const result = new ObjectOrErrorMessage(instruction);
        result._object = object;
        return result;
    }

    /**
     * Construct a FilterOrErrorMessage with the given error message.
     * @param instruction
     * @param errorMessage
     */
    public static fromError(instruction: string, errorMessage: string): ObjectOrErrorMessage {
        const result = new ObjectOrErrorMessage(instruction);
        result._error = errorMessage;
        return result;
    }
}
