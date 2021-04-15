import moment from 'moment';
import { Settings } from './Settings';
import { Status } from './Status';

export class Task {
    public readonly status: Status;
    public readonly description: string;
    public readonly path: string;
    public readonly indentation: string | undefined;
    /**
     * The index of the nth task in its file.
     *
     * The page index is only known from parsing a file. It is not set on a
     * task that was generated from an LI element, as the LI element does not
     * have the full context of the entire file.
     */
    public readonly pageIndex: number | undefined;
    public readonly lineNumber: number | undefined;
    public readonly precedingHeader: string | undefined;
    public readonly dueDate: moment.Moment | undefined;
    public readonly doneDate: moment.Moment | undefined;

    constructor({
        status,
        description,
        path,
        indentation,
        pageIndex,
        lineNumber,
        precedingHeader,
        dueDate,
        doneDate,
    }: {
        status: Status;
        description: string;
        path: string;
        indentation: string | undefined;
        pageIndex: number | undefined;
        lineNumber: number | undefined;
        precedingHeader: string | undefined;
        dueDate: moment.Moment | undefined;
        doneDate: moment.Moment | undefined;
    }) {
        this.status = status;
        this.description = description;
        this.path = path;
        this.indentation = indentation;
        this.pageIndex = pageIndex;
        this.lineNumber = lineNumber;
        this.precedingHeader = precedingHeader;
        this.dueDate = dueDate;
        this.doneDate = doneDate;
    }

    public static fromLine({
        line,
        path,
        pageIndex,
        lineNumber,
        precedingHeader,
    }: {
        line: string;
        path: string;
        pageIndex: number | undefined;
        lineNumber: number | undefined;
        precedingHeader: string | undefined;
    }): Task | undefined {
        const taskMatch = line.match(Settings.REGEX_TASK);

        if (taskMatch !== null) {
            const indentation = taskMatch[1];
            const status = taskMatch[2];
            const description = taskMatch[3].trim();

            let dueDate: moment.Moment | undefined;
            const dueDateMatch = line.match(Settings.REGEX_DUE_DATE);
            if (dueDateMatch !== null) {
                dueDate = moment(dueDateMatch[1], Settings.DATE_FORMAT);
            }

            switch (status) {
                case 'x':
                    return Task.doneFromLine({
                        line,
                        description,
                        indentation,
                        path,
                        pageIndex,
                        lineNumber,
                        precedingHeader,
                        dueDate,
                    });
                default:
                    return new Task({
                        status: Status.TODO,
                        description,
                        indentation,
                        path,
                        pageIndex,
                        lineNumber,
                        precedingHeader,
                        dueDate,
                        doneDate: undefined,
                    });
            }
        }

        return undefined;
    }

    public static fromLi({
        element,
        path,
    }: {
        element: HTMLLIElement;
        path: string;
    }): Task | undefined {
        if (element.textContent === null) {
            return undefined;
        }

        // A Task starts with a checkbox followed by a tasks tag
        let originalChekbox;
        const inputs = element.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.type === 'checkbox' && input.parentElement === element) {
                originalChekbox = input;
                break;
            }
        }
        if (!originalChekbox) {
            return undefined;
        }

        let originalTag;
        const as = element.querySelectorAll('a');
        for (let i = 0; i < as.length; i++) {
            const a = as[i];
            if (a.innerHTML === '#task' && a.parentElement === element) {
                originalTag = a;
                break;
            }
        }
        if (!originalTag) {
            return undefined;
        }

        // The list item is a task if it has a checkbox and the required tag.
        const status = originalChekbox.checked ? Status.DONE : Status.TODO;

        // The task will handle its own checkbox.
        element.removeChild(originalChekbox);
        // The task should not render with the tag.
        element.removeChild(originalTag);

        let description: string;
        const taskMatch = element.textContent.match(Settings.REGEX_LI_TASK);
        if (taskMatch === null) {
            // It's the closest we can get here.
            description = element.textContent;
        } else {
            description = taskMatch[1].trim();
        }

        let dueDate: moment.Moment | undefined;
        const dueDateMatch = element.textContent.match(Settings.REGEX_DUE_DATE);
        if (dueDateMatch !== null) {
            dueDate = moment(dueDateMatch[1], Settings.DATE_FORMAT);
        }

        switch (status) {
            case Status.DONE:
                return Task.doneFromLine({
                    line: element.textContent,
                    description,
                    path,
                    indentation: undefined,
                    pageIndex: undefined,
                    lineNumber: undefined,
                    precedingHeader: undefined,
                    dueDate,
                });
            default:
                return new Task({
                    status: Status.TODO,
                    description,
                    path,
                    indentation: undefined,
                    pageIndex: undefined,
                    lineNumber: undefined,
                    precedingHeader: undefined,
                    dueDate,
                    doneDate: undefined,
                });
        }
    }

    public toggle(): Task {
        let toggledStatus: Status = Status.TODO;
        let toggledDoneDate = undefined;

        if (this.status === Status.TODO) {
            toggledStatus = Status.DONE;
            toggledDoneDate = moment();
        }

        const toggledTask = new Task({
            ...this,
            status: toggledStatus,
            doneDate: toggledDoneDate,
        });

        return toggledTask;
    }

    public toFileString(): string {
        const fileString = `${this.indentation}- ${this.status} ${
            Settings.TASK_TAG
        } ${this.toLiString()}`;

        return fileString;
    }

    public toLiString(): string {
        let liString = `${this.description}`;
        if (this.dueDate !== undefined) {
            liString += ` ${Settings.IDENTIFIER_DUE_DATE} ${this.dueDate.format(
                Settings.DATE_FORMAT,
            )}`;
        }
        if (this.doneDate !== undefined) {
            liString += ` ${
                Settings.IDENTIFIER_DONE_DATE
            } ${this.doneDate.format(Settings.DATE_FORMAT)}`;
        }

        return liString;
    }

    private static doneFromLine({
        line,
        description,
        indentation,
        path,
        pageIndex,
        lineNumber,
        precedingHeader,
        dueDate,
    }: {
        line: string;
        description: string;
        path: string;
        indentation: string | undefined;
        pageIndex: number | undefined;
        lineNumber: number | undefined;
        precedingHeader: string | undefined;
        dueDate: moment.Moment | undefined;
    }): Task {
        // Can be undefined when a status was set to DONE manually
        // or when the rendered text node does not include the entire
        // string, for example when havin `<em />` tags.
        let doneDate: moment.Moment | undefined = undefined;

        const match = line.match(Settings.REGEX_DONE_DATE);
        if (match !== null) {
            doneDate = moment(match[1], Settings.DATE_FORMAT);
        }

        return new Task({
            status: Status.DONE,
            description,
            indentation,
            path,
            pageIndex,
            lineNumber,
            precedingHeader,
            dueDate,
            doneDate,
        });
    }
}
