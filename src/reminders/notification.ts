import { App, Modal } from 'obsidian';
import { getSettings } from '../Config/Settings';
import type { Task } from '../Task';
import { Query } from '../Query/Query';
import { sameDateTime } from '../lib/DateTools';
import type { Cache } from '../Cache';
import { getTaskLineAndFile } from '../File';
import ReminderView from './components/Reminder.svelte';
import { ReminderType } from './Reminder';
const electron = require('electron');
const Notification = electron.remote.Notification;

export class TaskNotification {
    // this is the default reminder settings not getting updated
    constructor(private app: App) {}

    public show(task: Task) {
        const { reminderSettings } = getSettings();
        // if election notification is supported, aka desktop app
        if (Notification.isSupported()) {
            // Show system notification
            const n = new Notification({
                title: reminderSettings.notificationTitle,
                body: task.description,
            });
            n.on('click', () => {
                console.log('Notification clicked');
                n.close();
                this.showBuiltinReminder(task);
            });
            // Notification actions only supported in macOS
            {
                n.on('action', (_: any, index: any) => {
                    if (index === 0) {
                        onDone(task);
                        return;
                    }
                });
                const actions = [{ type: 'button', text: 'Mark as Done' }];
                n.actions = actions as any;
            }

            n.show();
        } else {
            // Show obsidian modal notification for mobile users, must be in app
            this.showBuiltinReminder(task);
        }
    }

    public watcher(cache: Cache): number | undefined {
        let intervalTaskRunning = false;
        const { reminderSettings } = getSettings();
        // Set up the recurring check for reminders.
        return window.setInterval(() => {
            if (intervalTaskRunning) {
                // console.log('Skip reminder interval task because task is already running.');
                return;
            }
            intervalTaskRunning = true;

            const tasks = cache.getTasks();
            this.reminderEvent(tasks).finally(() => {
                intervalTaskRunning = false;
            });
        }, reminderSettings.refreshInterval);
    }

    private async reminderEvent(tasks: Task[]): Promise<void> {
        if (!tasks?.length) {
            return; // No tasks, nothing to do.
        }

        // get list of all future reminders that are not done
        const input = 'reminder after yesterday\nnot done';
        const query = new Query({ source: input });

        // Get list of tasks with reminders
        let reminderTasks = [...tasks];
        query.filters.forEach((filter) => {
            reminderTasks = reminderTasks.filter(filter.filterFunction);
        });

        const { reminderSettings } = getSettings();
        for (const task of reminderTasks) {
            let curTime = window.moment();
            const dailyTime = window.moment(
                `${curTime.format('YYYY-MM-DD')} ${reminderSettings.dailyReminderTime}`,
                reminderSettings.dateTimeFormat,
            );

            task.reminders?.reminders.forEach((rDate) => {
                curTime = window.moment();
                if (!rDate.notified) {
                    if (rDate.type === ReminderType.Date && sameDateTime(dailyTime, curTime)) {
                        rDate.notified = true;
                        this.show(task);
                        // time reminder
                    } else if (sameDateTime(rDate.time, curTime)) {
                        rDate.notified = true;
                        this.show(task);
                    }
                }
            });
        }
    }

    private showBuiltinReminder(
        reminder: any,
        //onRemindMeLater: (time: DateTime) => void,
    ) {
        new ObsidianNotificationModal(
            this.app,
            [1, 2, 3, 4, 5],
            reminder,
            //onRemindMeLater,
            onDone,
            onIgnore,
            onOpenFile,
        ).open();
    }
}

function onDone(task: Task) {
    if (!task.status.isCompleted()) {
        task.toggleUpdate();
    }
}
function onIgnore() {}

async function onOpenFile(task: Task, app: App) {
    const result = await getTaskLineAndFile(task, app.vault);
    if (result) {
        const [line, file] = result;
        const leaf = app.workspace.getLeaf('tab');
        await leaf.openFile(file, { eState: { line: line } });
    }
}

// Probably want to rewrite this modal to better display task infor
class ObsidianNotificationModal extends Modal {
    constructor(
        app: App,
        private laters: Array<Number>,
        private task: Task, // callbacks //
        //private onRemindMeLater: (time: any) => void,
        private onDone: (task: Task) => void,
        private onIgnore: () => void,
        private onOpenFile: (task: Task, app: App) => void,
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
                    this.onDone(this.task);
                    this.close();
                },
                onOpenFile: () => {
                    this.onOpenFile(this.task, this.app);
                    this.close();
                },
                onIgnore: () => {
                    // remove reminder from task
                    this.onIgnore();
                    this.close();
                },
            },
        });
    }

    override onClose() {
        // Unset the reminder from being displayed. This lets other parts of the plugin continue.
        const { contentEl } = this;
        contentEl.empty();
    }
}
