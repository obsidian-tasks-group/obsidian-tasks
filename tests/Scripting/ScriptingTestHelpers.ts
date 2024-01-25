import moment from 'moment';
import { TasksDate } from '../../src/Scripting/TasksDate';
import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';
import { Task } from '../../src/Task/Task';

export function formatToRepresentType(x: any): string {
    if (typeof x === 'string') {
        return "'" + x + "'";
    }

    if (moment.isMoment(x)) {
        return `moment('${x.format(TaskRegularExpressions.dateTimeFormat)}')`;
    }

    if (x instanceof Task) {
        return x.description;
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
    const quotedText = '`' + x + '`';
    if (typeof x === 'string' && x.includes('%%')) {
        // Link to footnote that explains comments are not rendered...
        return `${quotedText} [^commented]`;
    }
    return quotedText;
}

export function determineExpressionType(value: any): string {
    if (value === null) {
        return 'null';
    }

    if (moment.isMoment(value)) {
        return 'Moment';
    }

    if (value instanceof Task) {
        return 'Task';
    }

    if (value instanceof TasksDate) {
        return 'TasksDate';
    }

    if (Array.isArray(value)) {
        if (value.length > 0) {
            return `${determineExpressionType(value[0])}[]`;
        } else {
            return 'any[]';
        }
    }
    return typeof value;
}
