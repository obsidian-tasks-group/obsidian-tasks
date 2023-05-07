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

export function sameDateTime(a: moment.Moment, b: moment.Moment) {
    return a.format('YYYY-MM-DD HH:mm') === b.format('YYYY-MM-DD HH:mm');
}
