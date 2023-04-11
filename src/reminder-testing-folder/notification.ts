// import type { ReadOnlyReference } from "model/ref";
// import type { DateTime } from "model/time";
// import { App } from 'obsidian';
// import { SETTINGS } from "settings";
// import type { Reminder } from "../model/reminder";
// import type { Later } from "../model/time";
// import ReminderView from './components/Reminder.svelte';
const electron = require('electron');
const Notification = electron.remote.Notification;
//  (electron as any).remote.Notification;

export class TaskNotification {
    constructor() {} //private app: App

    // not sure if I can use Async functions
    // public enableNotifications(): boolean {
    //     if (Notification.permission === 'denied') {
    //         Notification.requestPermission().then((result: any) => {
    //             console.log(result);
    //             return Notification.permission === 'granted' ? true : false;
    //         });
    //     }
    //     return Notification.permission === 'granted' ? true : false;
    // }

    // Notifications will need to be enabled first before showing
    // Idealy this will be called in settings menu and will only togle after user has enabled
    public async enableNotifications(): Promise<boolean> {
        if (Notification.permission === 'denied') {
            const result = await Notification.requestPermission();
            console.log(result);
        }
        return Notification.permission === 'granted';
    }

    public show() {
        if (Notification.isSupported() && Notification.permission === 'granted') {
            // Show system notification
            const n = new Notification({
                title: 'Obsidian Reminder',
                body: "Hello World, You've got mail!",
            });
            n.on('click', () => {
                console.log('Notification clicked');
                n.close();
                // this.showBuiltinReminder(reminder, onRemindMeLater, onDone, onMute, onOpenFile);
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
        }
    }

    //   private showBuiltinReminder(
    //     reminder: Reminder,
    //     onRemindMeLater: (time: DateTime) => void,
    //     onDone: () => void,
    //     onCancel: () => void,
    //     onOpenFile: () => void
    //   ) {
    //     new NotificationModal(this.app, this.laters.value, reminder, onRemindMeLater, onDone, onCancel, onOpenFile).open();
    //   }
}

// class ObsidianNotificationModal extends Modal { // was NotificationModal

//   canceled: boolean = true;

//   constructor(
//     app: App,
//     private laters: Array<Later>,
//     private reminder: Reminder,
//     private onRemindMeLater: (time: DateTime) => void,
//     private onDone: () => void,
//     private onCancel: () => void,
//     private onOpenFile: () => void
//   ) {
//     super(app);
//   }

//   override onOpen() {
//     // When the modal is opened we mark the reminder as being displayed. This
//     // lets us introspect the reminder's display state from elsewhere.
//     this.reminder.beingDisplayed = true;

//     let { contentEl } = this;
//     new ReminderView({
//       target: contentEl,
//       props: {
//         reminder: this.reminder,
//         laters: this.laters,
//         component: this,
//         onRemindMeLater: (time: DateTime) => {
//           this.onRemindMeLater(time);
//           this.canceled = false;
//           this.close();
//         },
//         onDone: () => {
//           this.canceled = false;
//           this.onDone();
//           this.close();
//         },
//         onOpenFile: () => {
//           this.canceled = true;
//           this.onOpenFile();
//           this.close();
//         },
//         onMute: () => {
//           this.canceled = true;
//           this.close();
//         },
//       },
//     });
//   }

//   override onClose() {
//     // Unset the reminder from being displayed. This lets other parts of the
//     // plugin continue.
//     this.reminder.beingDisplayed = false;
//     let { contentEl } = this;
//     contentEl.empty();
//     if (this.canceled) {
//       this.onCancel();
//     }
//   }
// }
