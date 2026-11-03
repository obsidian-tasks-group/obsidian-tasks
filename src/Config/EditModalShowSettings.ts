/**
 * This is a list of {@link Task} fields that are shown (or not) in {@link TaskModal}.
 *
 * Stored within {@link Settings}.isShownInEditModal.
 *
 * Edited within {@link OptionsModal}.
 */
export interface EditModalShowSettings {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    priority: boolean;

    recurrence: boolean;
    due: boolean;
    scheduled: boolean;
    start: boolean;

    before_this: boolean;
    after_this: boolean;

    status: boolean;
    created: boolean;
    done: boolean;
    cancelled: boolean;
}

export const defaultEditModalShowSettings: Readonly<EditModalShowSettings> = {
    priority: true,

    recurrence: true,
    due: true,
    scheduled: true,
    start: true,

    before_this: true,
    after_this: true,

    status: true,
    created: true,
    done: true,
    cancelled: true,
};

export type EditModalField = keyof EditModalShowSettings;

export type EditModalFieldGroupName = 'priority' | 'dates' | 'dependencies' | 'statusAndDates';

/**
 * The groups of fields in {@link TaskModal}, in their default order.
 *
 * Groups can be reordered, and fields can be reordered within their group, but
 * fields cannot move between groups.
 */
export const editModalFieldGroups: Readonly<Record<EditModalFieldGroupName, readonly EditModalField[]>> = {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    priority: ['priority'],
    dates: ['recurrence', 'due', 'scheduled', 'start'],
    dependencies: ['before_this', 'after_this'],
    statusAndDates: ['status', 'created', 'done', 'cancelled'],
};

/**
 * The default order of fields in {@link TaskModal}.
 *
 * Stored within {@link Settings}.editModalFieldOrder.
 */
export const defaultEditModalFieldOrder: readonly EditModalField[] = Object.values(editModalFieldGroups).flat();

export interface EditModalFieldGroup {
    name: EditModalFieldGroupName;
    fields: EditModalField[];
}

function groupNameOf(field: EditModalField): EditModalFieldGroupName {
    const names = Object.keys(editModalFieldGroups) as EditModalFieldGroupName[];
    return names.find((name) => editModalFieldGroups[name].includes(field))!;
}

/**
 * Split a saved field order into groups, ordered by where each group's first field appears.
 *
 * Unknown fields are ignored, and fields missing from {@link order} (for example, ones added
 * in a later version) are put at the end of their group.
 */
export function editModalFieldGroupsInOrder(order: readonly string[] | undefined): EditModalFieldGroup[] {
    const knownFields = (order ?? []).filter((field): field is EditModalField =>
        defaultEditModalFieldOrder.includes(field as EditModalField),
    );

    const groups: EditModalFieldGroup[] = [];
    for (const field of [...knownFields, ...defaultEditModalFieldOrder]) {
        const name = groupNameOf(field);
        let group = groups.find((g) => g.name === name);
        if (!group) {
            group = { name, fields: [] };
            groups.push(group);
        }
        if (!group.fields.includes(field)) {
            group.fields.push(field);
        }
    }
    return groups;
}
