import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { capitalizeFirstLetter } from 'lib/StringHelpers';

/**
 * The text for a date field in command names, such as 'Due date' for 'dueDate'.
 */
export function dateFieldCommandNameText(field: AllTaskDateFields): string {
    return capitalizeFirstLetter(field.replace('Date', ' date'));
}

/**
 * The text for a date field in command ids, such as 'due-date' for 'dueDate'.
 *
 * Command ids are permanent, as users assign hotkeys to them, so this must never change.
 */
export function dateFieldCommandIdText(field: AllTaskDateFields): string {
    return field.replace('Date', '-date');
}

/**
 * The text for a signed amount in command ids, such as 'plus-1' or 'minus-1'.
 */
export function signedAmountCommandIdText(amount: number): string {
    return `${amount >= 0 ? 'plus' : 'minus'}-${Math.abs(amount)}`;
}
