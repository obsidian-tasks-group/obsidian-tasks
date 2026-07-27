import { Task } from '../../Task/Task';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import type { TaskEditingInstruction } from './TaskEditingInstruction';
import { createEditingInstructionForPriorityGroups } from './PriorityInstructions';
import { createEditingInstructionForDateGroups } from './DateInstructions';

/**
 * Creates a task-editing instruction for a group column based on the grouping property
 * and a representative task from that group.
 *
 * The returned instruction can be applied to another task to make it match the target
 * group's value for supported group types, such as priority and supported date fields.
 *
 * Returns `null` when the grouping property is not supported or when no valid editing
 * instruction can be created for the given group.
 *
 * @param groupedBy The query grouping property that defines the column or group.
 * @param firstTask A task from the destination group whose grouped value should be copied.
 *                  Must match one of the strings returned by Field.fieldName() for
 *                  implementations of Field.
 * @returns A task editing instruction for moving another task into the group, or `null`
 * if no instruction can be created.
 */
export function createEditingInstructionForGroup(groupedBy: string, firstTask: Task): TaskEditingInstruction | null {
    // TODO Support status.name groups, for destination column names that are unique.

    if (groupedBy === 'priority') {
        return createEditingInstructionForPriorityGroups(firstTask);
    }

    const dateField = (Task.allDateFields() as AllTaskDateFields[]).find(
        (field) => groupedPropertyForDateField(field) === groupedBy,
    );
    if (dateField) {
        return createEditingInstructionForDateGroups(dateField, firstTask);
    }

    return null;
}

/** Convert Task field names like 'dueDate' to groupedBy names like 'due' */
function groupedPropertyForDateField(field: AllTaskDateFields): string {
    return field.replace(/Date$/, '');
}
