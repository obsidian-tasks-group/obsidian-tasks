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
    // Old behavior (locale detection) if 'locale-default' or not a weekday
    return (new (Intl as any).Locale(navigator.language) as any).weekInfo?.firstDay ?? 1;
}
