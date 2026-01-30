// Array of weekday names in order matching flatpickr's numeric values (0=Sunday, 1=Monday, etc.)
export const WEEKDAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export type FirstDayOfWeekOption = 'locale-default' | (typeof WEEKDAY_ORDER)[number];

/**
 * Converts the first day of week setting to the numeric value expected by flatpickr.
 *
 * @param setting - The user's first day of week setting
 * @returns The numeric value (0-6) representing the first day of week for flatpickr
 */
export function getFirstDayOfWeekValue(setting: FirstDayOfWeekOption): number {
    if (setting !== 'locale-default') {
        const index = WEEKDAY_ORDER.indexOf(setting);
        if (index >= 0) {
            return index;
        }
    }

    // Locale detection for 'locale-default'
    // Note: Intl.Locale().weekInfo.firstDay returns 1-7 (Monday=1, Sunday=7)
    // but flatpickr expects 0-6 (Sunday=0, Saturday=6)
    // We need to convert: 7 -> 0, 1 -> 1, 2 -> 2, ... 6 -> 6
    const localeFirstDay = (new Intl.Locale(navigator.language) as any).weekInfo?.firstDay ?? 1;

    // Convert from 1-7 (Monday=1, Sunday=7) to 0-6 (Sunday=0, Saturday=6)
    // Sunday (7) becomes 0, Monday (1) stays 1, etc.
    return localeFirstDay === 7 ? 0 : localeFirstDay;
}
