import type { Task } from '../Task/Task';

/**
 * Which of the notifications view's four groups a task's reminder falls into, relative to {@link now}.
 * Reuses the "Overdue" / "Due today" / "Due this week" / "Due later" bucket names already used for the
 * (not yet built) cross-project tabular view in CLAUDE.md's roadmap item 3 - no shared code yet (that
 * feature groups by due date, day-granular; this groups by reminder instant, down to the minute), but the
 * same names for the same underlying idea of urgency buckets.
 */
export type NotificationBucket = 'overdue' | 'today' | 'thisWeek' | 'later';

export const NOTIFICATION_BUCKET_ORDER: readonly NotificationBucket[] = ['overdue', 'today', 'thisWeek', 'later'];

export const NOTIFICATION_BUCKET_LABELS: Readonly<Record<NotificationBucket, string>> = {
    overdue: 'Overdue',
    today: 'Today',
    thisWeek: 'This week',
    later: 'Later',
};

/**
 * `overdue` is deliberately "reminder instant has passed", not "reminder day is before today" - unlike a
 * due *date* (whole-day granularity), a reminder is a specific moment, and this is also what makes
 * "Overdue" double as the replacement for a separate fired-notification history: since a task's
 * `reminderTime` is never cleared automatically (see `notifyRemindersDue`'s own doc comment - a background
 * timer should never mutate vault content), anything that already fired keeps showing here, live, with no
 * separate persisted log needed - including a reminder that was missed entirely because Obsidian was
 * closed when it came due (see `ReminderCheckLoop`'s own doc comment on that limitation).
 *
 * `thisWeek` uses `Moment.isSame(now, 'week')`, which is locale-aware (respects the locale's own week
 * start day) rather than a fixed Sunday/Monday boundary.
 */
export function bucketForReminderDateTime(reminderDateTime: Moment, now: Moment): NotificationBucket {
    if (reminderDateTime.isBefore(now)) {
        return 'overdue';
    }
    if (reminderDateTime.isSame(now, 'day')) {
        return 'today';
    }
    if (reminderDateTime.isSame(now, 'week')) {
        return 'thisWeek';
    }
    return 'later';
}

/**
 * Groups every non-completed task with a resolvable {@link Task.reminderDateTime} into the four
 * {@link NotificationBucket}s, sorted soonest-first within each bucket. Tasks with no reminder, or a
 * completed/cancelled status ({@link Task.isDone}), are excluded entirely.
 */
export function groupTasksByBucket(tasks: Task[], now: Moment): Record<NotificationBucket, Task[]> {
    const groups: Record<NotificationBucket, Task[]> = { overdue: [], today: [], thisWeek: [], later: [] };

    for (const task of tasks) {
        if (task.isDone || task.reminderDateTime === null) {
            continue;
        }
        groups[bucketForReminderDateTime(task.reminderDateTime, now)].push(task);
    }

    for (const bucket of NOTIFICATION_BUCKET_ORDER) {
        groups[bucket].sort((a, b) => a.reminderDateTime!.valueOf() - b.reminderDateTime!.valueOf());
    }

    return groups;
}
