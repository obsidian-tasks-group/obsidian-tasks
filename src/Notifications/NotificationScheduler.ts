import type { Task } from '../Task/Task';

/**
 * Returns every task in {@link tasks} whose {@link Task.reminderDateTime} falls in the half-open interval
 * `(windowStart, windowEnd]` - strictly after {@link windowStart}, up to and including {@link windowEnd} -
 * excluding completed/cancelled tasks (see {@link Task.isDone}).
 *
 * This is a pure function: it has no knowledge of 'now', of `setInterval`, or of any previous call. The
 * half-open sliding window itself is what prevents a task's reminder from firing twice: {@link
 * ReminderCheckLoop} always advances `windowStart` to the previous call's `windowEnd`, so once an instant
 * has been swept past by one call, it can never fall inside a later call's window again - no persisted
 * 'already fired' state is needed. This also means a reminder that comes due while Obsidian is not running
 * at all is never caught up on the next check - see {@link ReminderCheckLoop}'s own doc comment.
 *
 * `windowStart` is exclusive and `windowEnd` is inclusive so that consecutive, back-to-back windows (as
 * {@link ReminderCheckLoop} produces, each one starting exactly where the previous one ended) partition
 * time without gaps or double-counting the boundary instant.
 */
export function findDueReminders(tasks: Task[], windowStart: Moment, windowEnd: Moment): Task[] {
    return tasks.filter((task) => {
        if (task.isDone) {
            return false;
        }
        const reminderDateTime = task.reminderDateTime;
        if (reminderDateTime === null) {
            return false;
        }
        return reminderDateTime.isAfter(windowStart) && reminderDateTime.isSameOrBefore(windowEnd);
    });
}

/**
 * Drives {@link findDueReminders} over time: each {@link tick} call checks the window since the previous
 * tick (or since construction, for the first call), and remembers `now` as the new window start.
 *
 * Deliberately not persisted anywhere: {@link lastCheckTime} starts at construction time (plugin startup),
 * not at whenever the plugin was last running. This means a reminder that came due while Obsidian was
 * fully closed is *not* fired retroactively on reopen - a silent skip, not a notification burst - which is
 * an honest reflection of this being the foreground/session-scoped phase of native notification delivery
 * (see CLAUDE.md roadmap item 4; true background delivery while closed needs the separate ntfy relay
 * phase, which does not go through this class at all).
 */
export class ReminderCheckLoop {
    private lastCheckTime: Moment;

    constructor(now: Moment = window.moment()) {
        this.lastCheckTime = now;
    }

    public tick(tasks: Task[], now: Moment): Task[] {
        const due = findDueReminders(tasks, this.lastCheckTime, now);
        this.lastCheckTime = now;
        return due;
    }
}
