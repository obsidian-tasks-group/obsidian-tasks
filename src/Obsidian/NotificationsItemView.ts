import { ItemView, type WorkspaceLeaf } from 'obsidian';
import type TasksPlugin from '../main';
import type { Task } from '../Task/Task';
import { getSettings, updateSettings } from '../Config/Settings';
import { openTaskAtSourceLocation } from '../ui/QuickSearchTasksModal';
import NotificationsView from '../ui/NotificationsView.svelte';
import type { TasksEvents } from './TasksEvents';

export const NOTIFICATIONS_VIEW_TYPE = 'upgraded-tasks-notifications';

/**
 * The first `ItemView` (dedicated workspace pane) in this codebase - Tasks otherwise renders entirely via
 * markdown code-block processors and `Modal`s. Shows two sections: "Upcoming" (live, computed from
 * {@link TasksPlugin.getTasks} and kept fresh via {@link TasksEvents.onCacheUpdate} - clicking a row opens
 * that task, via the same {@link openTaskAtSourceLocation} the Quick Search modal uses) and "History"
 * (from {@link getSettings}'s `notificationHistory`, populated by `main.ts`'s check loop whenever a
 * reminder fires - read-only, since a stored path doesn't guarantee the task still exists there by the
 * time old history is reviewed).
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
                upcomingTasks: this.computeUpcoming(),
                history: getSettings().notificationHistory,
                onOpenTask: (task: Task) => void openTaskAtSourceLocation(task, this.app),
                onClearHistory: () => {
                    updateSettings({ notificationHistory: [] });
                    void this.plugin.saveSettings();
                    this.view?.$set({ history: [] });
                },
            },
        });

        this.registerEvent(
            this.events.onCacheUpdate(() => {
                this.view?.$set({ upcomingTasks: this.computeUpcoming() });
            }),
        );
    }

    async onClose(): Promise<void> {
        this.view?.$destroy();
        this.view = undefined;
    }

    private computeUpcoming() {
        const now = window.moment();
        return this.plugin
            .getTasks()
            .filter((task) => !task.isDone && task.reminderDateTime !== null && task.reminderDateTime.isAfter(now))
            .sort((a, b) => a.reminderDateTime!.valueOf() - b.reminderDateTime!.valueOf());
    }
}
