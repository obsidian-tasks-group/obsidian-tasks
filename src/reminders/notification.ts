import { App, Modal } from 'obsidian';
import type { Task } from '../Task';
import { Query } from '../Query/Query';
import ReminderView from './components/Reminder.svelte';
const electron = require('electron');
const Notification = electron.remote.Notification;
//  Platform.isDesktopApp, // Platform.isMobileApp,
//  import { Platform } from 'obsidian';

const notificationTitle = 'Task Reminder'; //TODO constant for language localization, is there a file for these already?

export class TaskNotification {
    constructor(private app: App) {} //private app: App

    public show(task: Task) {
        // if election notification is supported, aka desktop app
        if (Notification.isSupported()) {
            // Show system notification
            const n = new Notification({
                title: notificationTitle, // todo set to constant for language localization
                body: task.description,
            });
            n.on('click', () => {
                console.log('Notification clicked');
                n.close();
                this.showBuiltinReminder(task);
            });
            n.on('close', () => {
                console.log('Notification closed');
            });
            // action only supported in macOS
            {
                // const laters = SETTINGS.laters.value;
                n.on('action', (_: any, index: any) => {
                    if (index === 0) {
                        // mark task as done
                        return;
                    }
                    // const later = laters[index - 1]!;
                    // onRemindMeLater(later.later());
                });
                const actions = [{ type: 'button', text: 'Mark as Done' }];
                // laters.forEach((later) => {
                //     actions.push({ type: 'button', text: later.label });
                // });
                n.actions = actions as any;
            }

            n.show();
        } else {
            // Show obsidian modal notification for mobile users
            // Must be in app for this to trigger
            this.showBuiltinReminder(task);
        }
    }

    public watcher(tasks: Task[]): number | undefined {
        let intervalTaskRunning = true;
        // Force the view to refresh as soon as possible.
        this.reminderEvent(tasks).finally(() => {
            intervalTaskRunning = false;
        });

        // Set up the recurring check for reminders.
        return window.setInterval(() => {
            if (intervalTaskRunning) {
                console.log('Skip reminder interval task because task is already running.');
                return;
            }
            intervalTaskRunning = true;
            this.reminderEvent(tasks).finally(() => {
                intervalTaskRunning = false;
            });
        }, 1000000);
    }

    private async reminderEvent(tasks: Task[]): Promise<void> {
        if (!tasks?.length) {
            return; // No tasks, nothing to do.
        }
        const input = 'has reminder date';
        const query = new Query({ source: input });

        // Get list of tasks with reminders
        let reminderTasks = [...tasks];
        query.filters.forEach((filter) => {
            reminderTasks = reminderTasks.filter(filter.filterFunction);
        });

        for (const task of reminderTasks) {
            const now = window.moment(); // current date + time
            const alertTime = window.moment('09:00', 'hh:mm'); // time to show daily reminders
            const daily = window.moment().startOf('day'); // today with a blank time

            // Check if reminder is within 30 seconds of now
            // need .clone() to avoid mutating original date todo: is there a better way to do this?
            if (task.reminders[0].date.isBetween(now, now.clone().add(30, 'seconds'))) {
                console.log('Show Notification');
                this.show(task);
                // else check for daily reminder
            } else if (
                task.reminders[0].date.isSame(daily) &&
                now.isBetween(alertTime, alertTime.clone().add(30, 'minutes'))
            ) {
                this.show(task);
            }
        }
    }

    private showBuiltinReminder(
        reminder: any,
        // onRemindMeLater: (time: any) => void,
        // onDone: () => void,
        // onCancel: () => void,
        // onOpenFile: () => void,
    ) {
        new ObsidianNotificationModal(
            this.app,
            [1, 2, 3, 4, 5],
            reminder,
            // onRemindMeLater,
            // onDone,
            // onCancel,
            // onOpenFile,
        ).open();
    }
}

// Probably want to rewrite this modal to better display task infor
class ObsidianNotificationModal extends Modal {
    constructor(
        app: App,
        private laters: Array<Number>,
        private task: Task, // callbacks // private onRemindMeLater: (time: any) => void, // private onDone: () => void, // private onCancel: () => void, // private onOpenFile: () => void,
    ) {
        super(app);
    }

    override onOpen() {
        const { contentEl } = this;
        new ReminderView({
            target: contentEl,
            props: {
                task: this.task,
                laters: this.laters,
                component: this,
                onRemindMeLater: () => {
                    // this.onRemindMeLater(time);

                    this.close();
                },
                onDone: () => {
                    // this.onDone();
                    this.close();
                },
                onOpenFile: () => {
                    // this.onOpenFile();
                    this.close();
                },
                onMute: () => {
                    this.close();
                },
            },
        });
    }

    override onClose() {
        // Unset the reminder from being displayed. This lets other parts of the
        // plugin continue.
        const { contentEl } = this;
        contentEl.empty();
    }
}
