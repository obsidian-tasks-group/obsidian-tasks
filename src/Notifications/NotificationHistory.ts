import type { Task } from '../Task/Task';

/**
 * A record of one task's reminder having fired, kept for the "History" section of the notifications view
 * (`src/Obsidian/NotificationsItemView.ts`). One entry per task, not one per check - several tasks firing
 * in the same combined notification (see `notifyRemindersDue`) still produce one history row each.
 */
export interface NotificationHistoryEntry {
    description: string;
    /**
     * The task's file path at the moment it fired. Not used for navigation in this version - the History
     * section is deliberately read-only, since a task may have moved, changed or been deleted by the time
     * someone reviews old history, and there's no live `Task` object left to re-resolve it against (unlike
     * the "Upcoming" section, which links to still-live tasks via `openTaskAtSourceLocation`). Captured now
     * anyway, cheaply, so a later "make history clickable" feature isn't permanently missing data for
     * everything logged before it exists.
     */
    path: string;
    /** ISO string, not a Moment - `Settings` round-trips through JSON (`loadData`/`saveData`), which a
     *  Moment doesn't survive as a usable value. Format for display with `window.moment(firedAt)`. */
    firedAt: string;
}

/** Internal cap on how many history entries are kept - not a setting, no UI need for one. */
export const MAX_NOTIFICATION_HISTORY_ENTRIES = 500;

/**
 * Appends one {@link NotificationHistoryEntry} per task in {@link newlyFired} to {@link existing}, pruning
 * to the most recent {@link maxEntries} overall. Pure: never mutates {@link existing}.
 */
export function appendHistoryEntries(
    existing: NotificationHistoryEntry[],
    newlyFired: Task[],
    firedAt: Moment,
    maxEntries: number = MAX_NOTIFICATION_HISTORY_ENTRIES,
): NotificationHistoryEntry[] {
    const newEntries: NotificationHistoryEntry[] = newlyFired.map((task) => ({
        description: task.descriptionWithoutTags,
        path: task.path,
        firedAt: firedAt.toISOString(),
    }));
    return [...existing, ...newEntries].slice(-maxEntries);
}
