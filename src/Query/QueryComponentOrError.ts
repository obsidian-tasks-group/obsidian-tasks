/**
 * Generic class for storing:
 * - a text instruction.
 * - an object of type QueryComponent constructed from the instruction, if the instruction is valid.
 * - otherwise, an error message explaining in what wat the instruction is invalid.
 */
export class QueryComponentOrError<QueryComponent> {
    readonly instruction: string;
    private _object: QueryComponent | undefined;
    private _error: string | undefined;

    private constructor(instruction: string) {
        this.instruction = instruction;
    }

    public get object(): QueryComponent | undefined {
        return this._object;
    }

    private set object(value: QueryComponent | undefined) {
        this._object = value;
    }

    public get error(): string | undefined {
        return this._error;
    }

    private set error(value: string | undefined) {
        this._error = value;
    }

    /**
     * Construct an ObjectOrErrorMessage with the given QueryComponent.
     *
     * @param instruction
     * @param object - a {@link Filter}
     */
    public static fromObject<QueryComponent>(
        instruction: string,
        object: QueryComponent,
    ): QueryComponentOrError<QueryComponent> {
        const result = new QueryComponentOrError<QueryComponent>(instruction);
        result._object = object;
        return result;
    }

    /**
     * Construct a ObjectOrErrorMessage with the given error message.
     * @param instruction
     * @param errorMessage
     */
    public static fromError<QueryComponent>(
        instruction: string,
        errorMessage: string,
    ): QueryComponentOrError<QueryComponent> {
        const result = new QueryComponentOrError<QueryComponent>(instruction);
        result._error = errorMessage;
        return result;
    }
}
