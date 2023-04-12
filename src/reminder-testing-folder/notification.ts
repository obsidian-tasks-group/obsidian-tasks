import { App, Modal } from 'obsidian';
import ReminderView from './components/Reminder.svelte';
const electron = require('electron');
const Notification = electron.remote.Notification;

export class TaskNotification {
    constructor(private app: App) {} //private app: App

    public show() {
        const reminder = {
            title: 'Reminder Title',
            file: 'path/to/file.md',
            time: new Date(),
            rowNumber: 1,
            done: false,
        };

        // if election notification is supported, aka desktop app
        if (Notification.isSupported()) {
            // Show system notification
            const n = new Notification({
                title: 'Obsidian Reminder',
                body: "Hello World, You've got mail!",
            });
            n.on('click', () => {
                console.log('Notification clicked');
                n.close();
                this.showBuiltinReminder(reminder);
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
            this.showBuiltinReminder(reminder);
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
        private reminder: any, // callbacks // private onRemindMeLater: (time: any) => void, // private onDone: () => void, // private onCancel: () => void, // private onOpenFile: () => void,
    ) {
        super(app);
    }

    override onOpen() {
        const { contentEl } = this;
        new ReminderView({
            target: contentEl,
            props: {
                reminder: this.reminder,
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
