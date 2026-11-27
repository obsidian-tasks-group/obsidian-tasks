import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { capitalizeFirstLetter } from 'lib/StringHelpers';

/**
 * The text for a date field in command names, such as 'Due date' for 'dueDate'.
 */
export function dateFieldCommandNameText(field: AllTaskDateFields): string {
    return capitalizeFirstLetter(field.replace('Date', ' date'));
}
