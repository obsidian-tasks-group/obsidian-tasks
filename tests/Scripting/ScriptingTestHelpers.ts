import moment from 'moment';
import { TaskRegularExpressions } from '../../src/Task';
import { TasksDate } from '../../src/Scripting/TasksDate';

export function formatToRepresentType(x: any): string {
    if (typeof x === 'string') {
        return "'" + x + "'";
    }

    if (moment.isMoment(x)) {
        return `moment('${x.format(TaskRegularExpressions.dateTimeFormat)}')`;
    }

    if (x instanceof TasksDate) {
        return x.formatAsDateAndTime();
    }

    if (Array.isArray(x)) {
        return '[' + x.map((v) => formatToRepresentType(v)).join(', ') + ']';
    }
    // TODO Round numbers
    // TODO Format string arrays - can I use 'toString()'?
    // TODO Fix display of 2 spaces as `'  '` - which appears as a single space. <pre></pre> gets the spacing OK, but line is too tall
    return x;
}

export function addBackticks(x: any) {
    return '`' + x + '`';
}

export function determineExpressionType(value: any) {
    if (value === null) {
        return 'null';
    }

    if (moment.isMoment(value)) {
        return 'Moment';
    }

    if (value instanceof TasksDate) {
        return 'TasksDate';
    }

    if (Array.isArray(value)) {
        if (value.length > 0) {
            return `${typeof value[0]}[]`;
        } else {
            return 'any[]';
        }
    }
    return typeof value;
}
