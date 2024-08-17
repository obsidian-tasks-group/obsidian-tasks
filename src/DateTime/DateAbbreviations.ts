// Abbreviations for entering dates with chrono
// MAINTENANCE NOTE:
//      If adding more abbreviations, please review datePlaceholder in src/ui/EditTask.svelte
const abbreviations = {
    td: 'today',
    tm: 'tomorrow',
    yd: 'yesterday',
    tw: 'this week',
    nw: 'next week',
    weekend: 'sat',
    we: 'sat',
};

/**
 * Expand any recognised abbreviations for dates.
 *
 * Important: the abbreviation is only expanded if it is foolowed by a space.
 *
 * For example, 'td ' is expanded to 'today'
 * @param date
 */
export function doAutocomplete(date: string): string {
    for (const [key, val] of Object.entries(abbreviations)) {
        date = date.replace(RegExp(`\\b${key}\\s`, 'i'), val);
    }
    return date;
}
