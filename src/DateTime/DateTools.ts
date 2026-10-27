import * as chrono from 'chrono-node';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';

export function compareByDate(a: moment.Moment | null, b: moment.Moment | null): -1 | 0 | 1 {
    if (a !== null && b === null) {
        return -1;
    }
    if (a === null && b !== null) {
        return 1;
    }
    if (!(a !== null && b !== null)) {
        return 0;
    }

    if (a.isValid() && !b.isValid()) {
        return 1;
    } else if (!a.isValid() && b.isValid()) {
        return -1;
    }

    if (a.isAfter(b)) {
        return 1;
    } else if (a.isBefore(b)) {
        return -1;
    } else {
        return 0;
    }
}

/**
 * Returns true if the date moment object has an explicit time component.
 */
export function hasTime(date: moment.Moment | null): boolean {
    if (!date?.isValid()) return false;
    const format = date.creationData()?.format;
    return format === TaskRegularExpressions.dateTimeFormat || format === TaskRegularExpressions.dateTimeIsoFormat;
}

/**
 * Returns the appropriate format string based on whether the date has a time.
 */
export function getDateFormat(date: moment.Moment | null): string {
    const format = date?.creationData()?.format;
    if (format === TaskRegularExpressions.dateTimeIsoFormat || format === TaskRegularExpressions.dateTimeFormat) {
        return format;
    }
    return TaskRegularExpressions.dateFormat;
}

/**
 * Infers the appropriate date or date-time format string from raw user input.
 */
export function inferDateTimeFormat(input: string): string {
    const match = /([ T])(\d{2}:\d{2})\b/.exec(input);
    if (!match || !window.moment(match[2], 'HH:mm', true).isValid()) {
        return TaskRegularExpressions.dateFormat;
    }
    return match[1] === 'T' ? TaskRegularExpressions.dateTimeIsoFormat : TaskRegularExpressions.dateTimeFormat;
}

/**
 * Formats and strictly re-parses a Date or Moment so its creationData().format matches {@link format}.
 */
export function momentWithFormat(date: Date | moment.Moment, format: string): moment.Moment {
    return window.moment(window.moment(date).format(format), format, true);
}

/**
 * If {@link sourceDate} has an explicit time component, copies its hour, minute, and format onto {@link targetDate}.
 */
export function preserveTime(targetDate: moment.Moment, sourceDate: moment.Moment | null): moment.Moment {
    if (!hasTime(sourceDate)) {
        return targetDate;
    }
    const withTime = targetDate.clone().set({
        hour: sourceDate!.hour(),
        minute: sourceDate!.minute(),
    });
    return momentWithFormat(withTime, getDateFormat(sourceDate));
}

/**
 * Strictly compares two date moments for both chronological equality and format equality
 * (e.g. distinguishing '2024-10-01' from '2024-10-01 00:00' and '2024-10-01 20:20' from '2024-10-01T20:20').
 */
export function datesAreIdentical(a: moment.Moment | null, b: moment.Moment | null): boolean {
    if (compareByDate(a, b) !== 0) {
        return false;
    }
    return getDateFormat(a) === getDateFormat(b);
}

/*
    MAINTENANCE NOTE on these Date functions:
        Repetitious date-related code in this file has been extracted
        out in to several parseTypedDateFor....() functions over time.

        There is some similarity between these functions, and also
        some subtle differences.

        Future refactoring to simplify them would be welcomed.

        When editing of Done date is introduced, the functions
        parseTypedDateForDisplayUsingFutureDate() and parseTypedDateForDisplay()
        may collapse in to a single case.
*/

/**
 * Parse and return the entered value for a date field.
 * @param fieldName
 * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
 * @param forwardDate
 * @returns the parsed date string. Includes "invalid" if {@code typedDate} was invalid.
 */
function parseTypedDateForDisplay(
    fieldName: 'created' | 'start' | 'scheduled' | 'due' | 'done' | 'cancelled',
    typedDate: string,
    forwardDate: Date | undefined = undefined,
): string {
    if (!typedDate) {
        return `<i>no ${fieldName} date</i>`;
    }
    const parsed = chrono.parseDate(typedDate, forwardDate, {
        forwardDate: forwardDate != undefined,
    });
    if (parsed !== null) {
        return window.moment(parsed).format(inferDateTimeFormat(typedDate));
    }
    return `<i>invalid ${fieldName} date</i>`;
}

/**
 * Like {@link parseTypedDateForDisplay} but also accounts for the 'Only future dates' setting.
 * @param fieldName
 * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
 * @returns the parsed date string. Includes "invalid" if {@code typedDate} was invalid.
 * @param forwardOnly
 */
export function parseTypedDateForDisplayUsingFutureDate(
    fieldName: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled',
    typedDate: string,
    forwardOnly: boolean,
): string {
    return parseTypedDateForDisplay(fieldName, typedDate, forwardOnly ? new Date() : undefined);
}

/**
 * Read the entered value for a date field, and return the value to be saved in the edited task.
 * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
 * @param forwardDate
 */
export function parseTypedDateForSaving(typedDate: string, forwardDate: boolean): moment.Moment | null {
    const parsedDate = chrono.parseDate(typedDate, new Date(), { forwardDate });
    if (parsedDate === null) {
        return null;
    }
    const format = inferDateTimeFormat(typedDate);
    return format === TaskRegularExpressions.dateFormat
        ? window.moment(parsedDate)
        : momentWithFormat(parsedDate, format);
}
