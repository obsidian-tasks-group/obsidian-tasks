import moment from 'moment';
import { Status } from 'Tasks/Status';
import { DATE_FORMAT, Task } from '../Task';

export class Query {
    public readonly filters: ((task: Task) => boolean)[];
    private readonly noDueString = 'no due date';
    private readonly dueRegexp = /due (before|after|on) (\d{4}-\d{2}-\d{2})/;
    private readonly doneString = 'done';
    private readonly notDoneString = 'not done';
    private readonly doneRegexp = /done (before|after|on) (\d{4}-\d{2}-\d{2})/;
    private readonly pathRegexp = /path (includes|does not include) (.*)/;
    private readonly excludeSubItemsString = 'exclude sub-items';

    constructor({ source }: { source: string }) {
        this.filters = this.parseFilters({ source });
    }

    private parseFilters({
        source,
    }: {
        source: string;
    }): ((task: Task) => boolean)[] {
        const filters: ((task: Task) => boolean)[] = [];
        const sourceLines = source.split('\n').map(line => line.trim());

        for (const sourceLine of sourceLines) {
            if (sourceLine === '') {
                continue;
            }

            if (sourceLine === this.doneString) {
                filters.push((task) => task.status === Status.DONE);
            } else if (sourceLine === this.notDoneString) {
                filters.push((task) => task.status !== Status.DONE);
            } else if (sourceLine === this.noDueString) {
                filters.push((task) => task.dueDate === undefined);
            } else if (this.dueRegexp.test(sourceLine)) {
                const filter = this.parseDueFilter({ line: sourceLine });
                if (filter !== undefined) {
                    filters.push(filter);
                }
            } else if (this.doneRegexp.test(sourceLine)) {
                const filter = this.parseDoneFilter({ line: sourceLine });
                if (filter !== undefined) {
                    filters.push(filter);
                }
            } else if (this.pathRegexp.test(sourceLine)) {
                const filter = this.parsePathFilter({ line: sourceLine });
                if (filter !== undefined) {
                    filters.push(filter);
                }
            } else if (sourceLine === this.excludeSubItemsString) {
                filters.push((task) => task.indentation === '');
            } else {
                console.error('Tasks: do not understand filter: ' + sourceLine);
            }
        }

        return filters;
    }

    private parseDueFilter({
        line,
    }: {
        line: string;
    }): ((task: Task) => boolean) | undefined {
        const dueMatch = line.match(this.dueRegexp);
        if (dueMatch !== null) {
            let filter;
            const filterDate = moment(dueMatch[2], DATE_FORMAT);
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

            return filter;
        }

        return undefined;
    }

    private parseDoneFilter({
        line,
    }: {
        line: string;
    }): ((task: Task) => boolean) | undefined {
        const doneMatch = line.match(this.doneRegexp);
        if (doneMatch !== null) {
            let filter;
            const filterDate = moment(doneMatch[2], DATE_FORMAT);
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

            return filter;
        }

        return undefined;
    }

    private parsePathFilter({
        line,
    }: {
        line: string;
    }): ((task: Task) => boolean) | undefined {
        const pathMatch = line.match(this.pathRegexp);
        if (pathMatch !== null) {
            let filter;
            const filterMethod = pathMatch[1];
            if (filterMethod === 'includes') {
                filter = (task: Task) =>
                    task.path.includes(pathMatch[2]);
            } else if (pathMatch[1] === 'does not include') {
                filter = (task: Task) =>
                    !task.path.includes(pathMatch[2]);
            } else {
                console.error('Tasks: do not understand path query: ' + line);
                return undefined;
            }

            return filter;
        }

        return undefined;
    }
}
