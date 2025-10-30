import type { Moment } from 'moment';
import { getSettings } from '../Config/Settings';

/**
 * Returns the current moment, adjusted for the "Next day start hour" setting.
 */
export function momentAdjusted(): Moment {
    const { nextDayStartHour } = getSettings();
    return window.moment().subtract(nextDayStartHour, 'hours');
}
