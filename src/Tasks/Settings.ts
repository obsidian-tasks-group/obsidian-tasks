export class Settings {
    public static readonly DEFAULT_TAG = '#task';
    private static taskTag: string = Settings.DEFAULT_TAG;
    private static regexTask: RegExp = Settings.createTaskRegex(
        Settings.DEFAULT_TAG,
    );

    public static readonly DEFAULT_SETTINGS = {
        taskTag: Settings.DEFAULT_TAG,
    };

    public static readonly IDENTIFIER_DUE_DATE = '📅';
    public static readonly IDENTIFIER_DONE_DATE = '✅';
    public static readonly DATE_FORMAT = 'YYYY-MM-DD';

    public static readonly CLASS_ITEM = 'tasks-item';

    public static readonly DATA_PAGE_INDEX = 'data-tasks-page-index';
    public static readonly DATA_PATH = 'data-tasks-path';

    public static readonly REGEX_LI_TASK = /^ ([^📅✅]*)(.*)/u;
    public static readonly REGEX_DUE_DATE = /📅 (\d{4}-\d{2}-\d{2})/u;
    public static readonly REGEX_DONE_DATE = /✅ (\d{4}-\d{2}-\d{2})/u;

    constructor({ taskTag }: { taskTag: string }) {
        Settings.taskTag = taskTag;
        Settings.regexTask = Settings.createTaskRegex(taskTag);
    }

    public static get TASK_TAG(): string {
        return Settings.taskTag;
    }

    public static get REGEX_TASK(): RegExp {
        return Settings.regexTask;
    }

    private static createTaskRegex(taskTag: string): RegExp {
        return new RegExp(
            `^([\\s\\t]*)- \\[( |x)\\] ${taskTag} ([^📅✅]*)(.*)`,
            'u',
        );
    }
}
