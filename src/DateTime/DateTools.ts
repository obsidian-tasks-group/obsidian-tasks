import * as chrono from 'chrono-node';

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
        return window.moment(parsed).format('YYYY-MM-DD');
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
    let date: moment.Moment | null = null;
    const parsedDate = chrono.parseDate(typedDate, new Date(), { forwardDate });
    if (parsedDate !== null) {
        date = window.moment(parsedDate);
    }
    return date;
}
