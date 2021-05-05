import moment from 'moment';

import { Status, Task } from './Task';

export class Query {
    private _limit: number | undefined = undefined;
    private _filters: ((task: Task) => boolean)[] = [];
    private readonly noDueString = 'no due date';
    private readonly dueRegexp = /due (before|after|on) (\d{4}-\d{2}-\d{2})/;
    private readonly doneString = 'done';
    private readonly notDoneString = 'not done';
    private readonly doneRegexp = /done (before|after|on) (\d{4}-\d{2}-\d{2})/;
    private readonly pathRegexp = /path (includes|does not include) (.*)/;
    private readonly descriptionRegexp = /description (includes|does not include) (.*)/;
    private readonly limitRegexp = /limit (to )?(\d+)( tasks?)?/;
    private readonly excludeSubItemsString = 'exclude sub-items';

    constructor({ source }: { source: string }) {
        source
            .split('\n')
            .map((line: string) => line.trim())
            .forEach((line: string) => {
                switch (true) {
                    case line === '':
                        break;
                    case line === this.doneString:
                        this._filters.push(
                            (task) => task.status === Status.Done,
                        );
                        break;
                    case line === this.notDoneString:
                        this._filters.push(
                            (task) => task.status !== Status.Done,
                        );
                        break;
                    case line === this.excludeSubItemsString:
                        this._filters.push((task) => task.indentation === '');
                        break;
                    case line === this.noDueString:
                        this._filters.push((task) => task.dueDate === null);
                        break;
                    case this.dueRegexp.test(line):
                        this.parseDueFilter({ line });
                        break;
                    case this.doneRegexp.test(line):
                        this.parseDoneFilter({ line });
                        break;
                    case this.pathRegexp.test(line):
                        this.parsePathFilter({ line });
                        break;
                    case this.descriptionRegexp.test(line):
                        this.parseDescriptionFilter({ line });
                        break;
                    case this.limitRegexp.test(line):
                        this.parseLimit({ line });
                        break;
                }
            });
    }

    public get limit(): number | undefined {
        return this._limit;
    }

    public get filters(): ((task: Task) => boolean)[] {
        return this._filters;
    }

    private parseDueFilter({ line }: { line: string }): void {
        const dueMatch = line.match(this.dueRegexp);
        if (dueMatch !== null) {
            let filter;
            const filterDate = moment(dueMatch[2], Task.dateFormat);
            if (dueMatch[1] === 'before') {
                filter = (task: Task) =>
                    task.dueDate ? task.dueDate.isBefore(filterDate) : false;
            } else if (dueMatch[1] === 'after') {
                filter = (task: Task) =>
                    task.dueDate ? task.dueDate.isAfter(filterDate) : false;
            } else {
                filter = (task: Task) =>
                    task.dueDate ? task.dueDate.isSame(filterDate) : false;
            }

            this._filters.push(filter);
        } else {
            console.error('Tasks: unknown query filter (due date):', line);
        }
    }

    private parseDoneFilter({ line }: { line: string }): void {
        const doneMatch = line.match(this.doneRegexp);
        if (doneMatch !== null) {
            let filter;
            const filterDate = moment(doneMatch[2], Task.dateFormat);
            if (doneMatch[1] === 'before') {
                filter = (task: Task) =>
                    task.doneDate ? task.doneDate.isBefore(filterDate) : false;
            } else if (doneMatch[1] === 'after') {
                filter = (task: Task) =>
                    task.doneDate ? task.doneDate.isAfter(filterDate) : false;
            } else {
                filter = (task: Task) =>
                    task.doneDate ? task.doneDate.isSame(filterDate) : false;
            }

            this._filters.push(filter);
        }
    }

    private parsePathFilter({ line }: { line: string }): void {
        const pathMatch = line.match(this.pathRegexp);
        if (pathMatch !== null) {
            const filterMethod = pathMatch[1];
            if (filterMethod === 'includes') {
                this._filters.push((task: Task) =>
                    task.path.includes(pathMatch[2]),
                );
            } else if (pathMatch[1] === 'does not include') {
                this._filters.push(
                    (task: Task) => !task.path.includes(pathMatch[2]),
                );
            } else {
                console.error('Tasks: unknown query filter (path):', line);
            }
        } else {
            console.error('Tasks: unknown query filter (path):', line);
        }
    }

    private parseDescriptionFilter({ line }: { line: string }): void {
        const descriptionMatch = line.match(this.descriptionRegexp);
        if (descriptionMatch !== null) {
            const filterMethod = descriptionMatch[1];
            if (filterMethod === 'includes') {
                this._filters.push((task: Task) =>
                    task.description.includes(descriptionMatch[2]),
                );
            } else if (descriptionMatch[1] === 'does not include') {
                this._filters.push(
                    (task: Task) =>
                        !task.description.includes(descriptionMatch[2]),
                );
            } else {
                console.error(
                    'Tasks: unknown query filter (description):',
                    line,
                );
            }
        } else {
            console.error('Tasks: unknown query filter (description):', line);
        }
    }

    private parseLimit({ line }: { line: string }): void {
        const limitMatch = line.match(this.limitRegexp);
        if (limitMatch !== null) {
            // limitMatch[2] is per regex always digits and therefore parsable.
            const limit = Number.parseInt(limitMatch[2], 10);
            this._limit = limit;
        } else {
            console.error('Tasks: unknown query limit:', line);
        }
    }
}
