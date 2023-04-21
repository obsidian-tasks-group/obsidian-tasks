import { App, Modal } from 'obsidian';
import type { Task } from '../Task';
import { Query } from '../Query/Query';
import { isDateBetween } from '../lib/DateTools';
import ReminderView from './components/Reminder.svelte';
import { reminderSettings } from './Reminder';
const electron = require('electron');
const Notification = electron.remote.Notification;
//  Platform.isDesktopApp, // Platform.isMobileApp,
//  import { Platform } from 'obsidian';

const notificationTitle = 'Task Reminder'; // todo is there a file for language localization?

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
                        // task.toggle();
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
        }, reminderSettings.refreshInterval);
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
            const reminderDate = task.reminders[0].date;
            const now = window.moment(); // current date + time
            // Check if reminder will occur inbetween now and next refresh interval, + 1 to account for rounding
            if (isDateBetween(reminderDate, now, reminderSettings.refreshInterval + 1, 'milliseconds')) {
                console.log('Show Notification');
                this.show(task);
                // else check for daily reminder
            } else if (isDailyReminder(reminderDate)) {
                this.show(task);
            }
        }
    }

    private showBuiltinReminder(
        reminder: any,
        // onRemindMeLater: (time: any) => void,
    ) {
        new ObsidianNotificationModal(
            this.app,
            [1, 2, 3, 4, 5],
            reminder,
            // onRemindMeLater,
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
                    // call task.toggle() ?
                    this.close();
                },
                onOpenFile: () => {
                    // this.onOpenFile();
                    this.close();
                },
                onMute: () => {
                    // remove reminder from task
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

function isDailyReminder(date: moment.Moment) {
    const daily = window.moment().startOf('day'); // todays date with a blank time
    const alertTime = window.moment(reminderSettings.dailyReminderTime, reminderSettings.dateTimeRegex);
    const now = window.moment(); // current date + time

    // time has not been set and is between alertTime and offset
    return date.isSame(daily) && isDateBetween(alertTime, now, 30, 'seconds');
}
