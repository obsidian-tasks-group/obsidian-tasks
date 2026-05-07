export class JsInTasksQueriesDisabledError extends Error {
    public static readonly helpMessage =
        'JavaScript is now disabled in Tasks queries.\n' +
        '    This query uses JavaScript, for example via "filter by function", "sort by function", or "group by function".\n' +
        '    JavaScript can run inside Obsidian and access or modify vault contents, local files, or other system resources.\n' +
        '    Read the Tasks documentation page "JavaScript in Tasks Queries" before deciding whether to enable it:\n' +
        '    https://publish.obsidian.md/tasks/Scripting/JavaScript+in+Tasks+Queries';
    constructor() {
        super(JsInTasksQueriesDisabledError.helpMessage);
        this.name = 'JsInTasksQueriesDisabledError';
    }

    public static message(): string {
        return JsInTasksQueriesDisabledError.helpMessage;
    }
}
