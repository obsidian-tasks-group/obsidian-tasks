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

/**
 * The groups of fields in {@link TaskModal}, in their default order.
 *
 * Stored within {@link Settings}.editModalFieldOrder.
 * Groups can be reordered, and fields can be reordered within their group, but
 * fields cannot move between groups.
 */
export const editModalFieldGroups: readonly (readonly EditModalField[])[] = [
    // NEW_TASK_FIELD_EDIT_REQUIRED
    ['priority'],
    ['recurrence', 'due', 'scheduled', 'start'],
    ['before_this', 'after_this'],
    ['status', 'created', 'done', 'cancelled'],
];
