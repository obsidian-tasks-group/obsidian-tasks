import type { DurationInputArg1, DurationInputArg2 } from 'moment';

export function compareByDate(a: moment.Moment | null, b: moment.Moment | null): -1 | 0 | 1 {
    if (a !== null && b === null) {
        return -1;
    } else if (a === null && b !== null) {
        return 1;
    } else if (a !== null && b !== null) {
        if (a.isValid() && !b.isValid()) {
            return -1;
        } else if (!a.isValid() && b.isValid()) {
            return 1;
        }

        if (a.isAfter(b)) {
            return 1;
        } else if (a.isBefore(b)) {
            return -1;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

export function isDateBetween(
    a: moment.Moment | null,
    b: moment.Moment,
    offset: DurationInputArg1,
    unit: DurationInputArg2,
) {
    if (a === null || b === null || !a.isValid() || !b.isValid()) {
        return false;
    }
    return a.isBetween(b, b.clone().add(offset, unit));
}
