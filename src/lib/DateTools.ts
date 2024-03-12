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

/**
 * Parse and return the entered value for a date field.
 * @param fieldName
 * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
 * @param forwardDate
 * @returns the parsed date string. Includes "invalid" if {@code typedDate} was invalid.
 */
export function parseTypedDateForDisplay(
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
