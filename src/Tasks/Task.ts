import moment from 'moment';
import { NodeTypes } from './Render/NodeTypes';
import { Status } from './Status';

export const IDENTIFIER_DUE_DATE = '📅';
export const IDENTIFIER_DONE_DATE = '✅';
export const DATE_FORMAT = 'YYYY-MM-DD';

export const CLASS_ITEM = 'tasks-item';

export const DATA_PAGE_INDEX = 'data-tasks-page-index';
export const DATA_PATH = 'data-tasks-path';

export const REGEX_TASK = /^([\s\t]*)- (TODO|DONE) ([^📅✅]*)(.*)/u;
export const REGEX_LI_TASK = /^(TODO|DONE) ([^📅✅]*)(.*)/u;
export const REGEX_DUE_DATE = /📅 (\d{4}-\d{2}-\d{2})/u;
export const REGEX_DONE_DATE = /✅ (\d{4}-\d{2}-\d{2})/u;

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
        const taskMatch = line.match(REGEX_TASK);

        if (taskMatch !== null) {
            const indentation = taskMatch[1];
            const status = taskMatch[2];
            const description = taskMatch[3].trim();

            let dueDate: moment.Moment | undefined;
            const dueDateMatch = line.match(REGEX_DUE_DATE);
            if (dueDateMatch !== null) {
                dueDate = moment(dueDateMatch[1], DATE_FORMAT);
            }

            switch (status) {
                case Status.DONE:
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
        element: Element;
        path: string;
    }): Task | undefined {
        for (let i = 0; i < element.childNodes.length; i = i + 1) {
            const childNode = element.childNodes[i];
            if (
                // Process to the first text child in the list item that is a task, if any.
                childNode.nodeType == NodeTypes.TEXT &&
                childNode.textContent !== null
            ) {
                const taskMatch = childNode.textContent.match(REGEX_LI_TASK);
                if (taskMatch === null) {
                    // Maybe a later text node?
                    continue;
                }

                const status = taskMatch[1];
                const description = taskMatch[2].trim();

                let dueDate: moment.Moment | undefined;
                const dueDateMatch = childNode.textContent.match(
                    REGEX_DUE_DATE,
                );
                if (dueDateMatch !== null) {
                    dueDate = moment(dueDateMatch[1], DATE_FORMAT);
                }

                switch (status) {
                    case Status.DONE:
                        return Task.doneFromLine({
                            line: childNode.textContent,
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
        }

        return undefined;
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
        const fileString = `${this.indentation}- ${
            this.status
        } ${this.toLiString()}`;

        return fileString;
    }

    public toLiString(): string {
        let liString = `${this.description}`;
        if (this.dueDate !== undefined) {
            liString += ` ${IDENTIFIER_DUE_DATE} ${this.dueDate.format(
                DATE_FORMAT,
            )}`;
        }
        if (this.doneDate !== undefined) {
            liString += ` ${IDENTIFIER_DONE_DATE} ${this.doneDate.format(
                DATE_FORMAT,
            )}`;
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

        const match = line.match(REGEX_DONE_DATE);
        if (match !== null) {
            doneDate = moment(match[1], DATE_FORMAT);
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
