export class JsInTasksQueriesDisabledError extends Error {
    public static readonly helpMessage = 'JavaScript is disabled in Tasks queries';

    constructor() {
        super(JsInTasksQueriesDisabledError.helpMessage);
        this.name = 'JsInTasksQueriesDisabledError';
    }

    public static message(): string {
        return JsInTasksQueriesDisabledError.helpMessage;
    }
}
