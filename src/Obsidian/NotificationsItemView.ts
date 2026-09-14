import { ItemView, type WorkspaceLeaf } from 'obsidian';
import type TasksPlugin from '../main';
import type { Task } from '../Task/Task';
import { groupTasksByBucket } from '../Notifications/NotificationBuckets';
import { openTaskAtSourceLocation } from '../ui/QuickSearchTasksModal';
import NotificationsView from '../ui/NotificationsView.svelte';
import type { TasksEvents } from './TasksEvents';

export const NOTIFICATIONS_VIEW_TYPE = 'upgraded-tasks-notifications';

/** How often the view re-computes its buckets purely because time has passed, independent of any file
 *  edit (see the doc comment on the `registerInterval` call in `onOpen()` below for why this exists). */
const REFRESH_INTERVAL_MILLISECONDS = 30 * 1000;

/**
 * The first `ItemView` (dedicated workspace pane) in this codebase - Tasks otherwise renders entirely via
 * markdown code-block processors and `Modal`s. Shows every non-completed task with a reminder, grouped
 * live into four buckets (see `Notifications/NotificationBuckets.ts`): Overdue, Today, This week, Later.
 *
 * "Overdue" doubles as what would otherwise need a separate fired-notification history: since a task's
 * `reminderTime` is never cleared automatically, anything whose reminder has already passed just keeps
 * showing there - including one missed entirely because Obsidian was closed when it came due - until the
 * task is completed or its reminder is changed. No persisted log needed.
 *
 * Opened via `TasksPlugin.openNotificationsView()` (ribbon icon, command, and the notification click
 * handler in `main.ts` all funnel through that one method, so repeated triggers reveal the same tab rather
 * than creating duplicates).
 */
export class NotificationsItemView extends ItemView {
    private readonly plugin: TasksPlugin;
    private readonly events: TasksEvents;
    private view: NotificationsView | undefined;

    constructor(leaf: WorkspaceLeaf, plugin: TasksPlugin, events: TasksEvents) {
        super(leaf);
        this.plugin = plugin;
        this.events = events;
    }

    getViewType(): string {
        return NOTIFICATIONS_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Reminder notifications';
    }

    getIcon(): string {
        return 'bell';
    }

    async onOpen(): Promise<void> {
        this.view = new NotificationsView({
            target: this.contentEl,
            props: {
                groups: this.computeGroups(),
                onOpenTask: (task: Task) => void openTaskAtSourceLocation(task, this.app),
            },
        });

        this.registerEvent(
            this.events.onCacheUpdate(() => {
                this.view?.$set({ groups: this.computeGroups() });
            }),
        );

        // onCacheUpdate only fires on an actual file edit - but which bucket a task falls into (and its
        // displayed relative time, e.g. "in 2 minutes") is a function of the current moment, which moves
        // forward with no file ever changing. Without this, a task shown as "in 2 minutes" would keep
        // reading exactly that, unmoved, until something unrelated happened to touch any task's file.
        this.registerInterval(
            window.setInterval(() => {
                this.view?.$set({ groups: this.computeGroups() });
            }, REFRESH_INTERVAL_MILLISECONDS),
        );
    }

    async onClose(): Promise<void> {
        this.view?.$destroy();
        this.view = undefined;
    }

    private computeGroups() {
        return groupTasksByBucket(this.plugin.getTasks(), window.moment());
    }
}
