import type { Moment } from "moment";
import { getSettings } from "../Config/Settings";

/**
 * Returns the current moment, adjusted for the "Next day start hour" setting.
 *
 * If the current time is before the "next day start hour" (e.g., 2 AM),
 * this function will return a moment object for the end of the *previous* day.
 * Otherwise, it returns the current, unaltered moment.
 */
export function momentAdjusted(): Moment {
    const { nextDayStartHour } = getSettings();
    const now = window.moment();
    if (now.hour() < nextDayStartHour) {
        return now.subtract(1, 'day').endOf('day');
    }
    return now;
}
