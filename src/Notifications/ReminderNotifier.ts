import { Notice, Platform } from 'obsidian';
import type { Task } from '../Task/Task';

/** The default title for a "these just came due" notification - see {@link missedReminderTitle} for the
 *  other title this module builds. */
function dueReminderTitle(tasks: Task[]): string {
    return tasks.length === 1 ? 'Reminder' : `${tasks.length} reminders due`;
}

/** The title for a "these were already overdue when Obsidian started" summary - see
 *  {@link notifyMissedReminders}. */
function missedReminderTitle(tasks: Task[]): string {
    return tasks.length === 1
        ? 'A reminder came due while you were away'
        : `${tasks.length} reminders came due while you were away`;
}

/**
 * The title/body text for a notification covering every task in {@link tasks} that came due in the same
 * check (see {@link findDueReminders}/{@link ReminderCheckLoop} in `NotificationScheduler.ts`) - always
 * one notification per check, never one per task, even when several reminders land in the same window.
 * Body lines are built from {@link Task.descriptionWithoutTags} - the same 'clean-ish' rendering already
 * used for quick-search result display (see `src/lib/QuickSearchTasks.ts`).
 *
 * {@link title}, if given, overrides the default "N reminders due" wording - used by
 * {@link notifyMissedReminders} to say "came due while you were away" instead, for the same tasks/body
 * shape.
 *
 * Deliberately a pure function, separate from {@link notifyRemindersDue}'s side effect, so the content
 * itself is testable without touching `Notice`/`Notification`. {@link tasks} must be non-empty.
 */
export function buildReminderNotificationContent(
    tasks: Task[],
    title: string = dueReminderTitle(tasks),
): { title: string; body: string } {
    return {
        title,
        body: tasks.map((task) => task.descriptionWithoutTags).join('\n'),
    };
}

/**
 * Which delivery channel {@link notifyRemindersDue} should use, given the current platform and what the
 * runtime actually supports. Pure and separately testable from the side-effecting delivery itself:
 *
 * - `'native'` - a real OS-level notification via the renderer's global `Notification` API, which Electron
 *   implements on desktop (no `electron` package import needed, and no permission prompt - Electron treats
 *   the app as trusted). This is what makes delivery 'native' rather than an in-app toast.
 * - `'notice'` - Obsidian's own `Notice`, used on mobile (the only surface available while Obsidian is
 *   open there) and as a fallback if a desktop build somehow lacks a working `Notification` global.
 */
export function chooseNotificationChannel(): 'native' | 'notice' {
    if (Platform.isDesktopApp && typeof Notification !== 'undefined') {
        return 'native';
    }
    return 'notice';
}

/**
 * Fires a single notification covering every task in {@link tasks} whose reminder came due in the same
 * check - never one notification per task, so several reminders landing in the same window (or the same
 * tick) surface as one combined alert, not a burst. {@link tasks} must be non-empty; callers should skip
 * calling this at all when nothing is due.
 *
 * Both delivery channels are persistent, staying visible until the user dismisses them, rather than
 * auto-disappearing after a few seconds like a typical transient toast - a reminder that vanishes on its
 * own timer defeats the point of it:
 * - native: `requireInteraction: true` (standard `NotificationOptions`) keeps the OS notification on
 *   screen until dismissed.
 * - notice: duration `0`, same as other important Notices in this codebase (e.g.
 *   `settings.statuses.reloadRequired`).
 *
 * If given, {@link onClick} fires when the user clicks/activates the notification, on either channel (e.g.
 * to focus Obsidian and open the notifications view - see `main.ts`). Deliberately just a plain callback,
 * not an `App`/`Plugin` reference: this module stays fully decoupled from Obsidian's workspace and
 * unit-testable without it. The notice-channel fragment is built with `createFragment`/`createEl`/
 * `createDiv` (Obsidian's own DOM sugar, mimicked for tests in `tests/jest.setup.ts`), not raw
 * `document.createElement`/`createDocumentFragment` - both are fully mimicked now, so there's no
 * testability reason left to avoid the idiomatic Obsidian API.
 *
 * Never writes anything back to any task or its file - a background timer should never be able to mutate
 * vault content. `reminderTime` is left exactly as the user set it.
 *
 * {@link titleOverride}, if given, is passed straight through to {@link buildReminderNotificationContent}
 * - see {@link notifyMissedReminders} for the other caller that uses this.
 */
export function notifyRemindersDue(tasks: Task[], onClick?: () => void, titleOverride?: string): void {
    const { title, body } = buildReminderNotificationContent(tasks, titleOverride);

    if (chooseNotificationChannel() === 'native') {
        const notification = new Notification(title, { body, requireInteraction: true });
        if (onClick) {
            notification.onclick = () => onClick();
        }
        return;
    }

    // The click listener must go on a real Element, not the DocumentFragment itself: once Notice inserts
    // the fragment into the DOM, its children are moved out and the (now-empty) fragment stops receiving
    // bubbled events - but a listener already attached to an actual element travels with it.
    const container = createDiv(onClick ? { cls: 'tasks-notification-clickable' } : undefined);
    container.createEl('strong', { text: title });
    container.createDiv({ text: body });
    if (onClick) {
        container.addEventListener('click', () => onClick());
    }

    const fragment = createFragment();
    fragment.appendChild(container);
    new Notice(fragment, 0);
}

/**
 * Fires the one-time startup summary for reminders that were already overdue before this session began -
 * "N reminders came due while you were away" - rather than "N reminders due" (which would misleadingly
 * suggest they just became due now). Otherwise identical to {@link notifyRemindersDue}: same combined
 * single-notification shape, same persistence, same optional click callback.
 *
 * This exists because `ReminderCheckLoop` (`NotificationScheduler.ts`) deliberately never fires
 * individually for anything already overdue when it's constructed (its window starts at construction time,
 * so a task that was already overdue can never fall inside a later window) - a reminder that comes due
 * while Obsidian is fully closed would otherwise be silently skipped forever, not just delayed. See
 * `main.ts`'s `checkForMissedRemindersOnStartup` for where this is actually called from, once, at startup.
 */
export function notifyMissedReminders(tasks: Task[], onClick?: () => void): void {
    notifyRemindersDue(tasks, onClick, missedReminderTitle(tasks));
}
