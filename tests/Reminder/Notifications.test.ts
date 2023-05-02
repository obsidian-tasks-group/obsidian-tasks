/**
 * @jest-environment jsdom
 */
jest.mock('obsidian');
import moment from 'moment';
import { Reminder, ReminderType, parseMoment } from '../../src/Reminders/Reminder';
//import { TaskNotification } from '../../src/Reminders/Notification';
window.moment = moment;

describe('Notifications ', () => {
    it('testing parsing Moment() datetime', () => {
        const reminder = moment('2023-04-30 11:44 am');

        expect(parseMoment(reminder)).toStrictEqual(new Reminder(moment('2023-04-30 11:44 am'), ReminderType.DateTime));
    });

    // it('testing shouldNotifiy', () => {
    //     const curTime = moment('2023-04-30 11:50 am');
    //     const dailyReminder = parseMoment(moment('2023-04-30'));
    //     const timeReminder = parseMoment(moment('2023-04-30 11:50 am'));
    //     const oldReminder = parseMoment(moment('2023-04-30 11:49 am'));
    //     const futureRinder = parseMoment(moment('2023-04-30 11:51 am'));

    //     expect(TaskNotification.shouldNotifiy(dailyReminder, curTime, curTime)).toBe(true);
    //     expect(TaskNotification.shouldNotifiy(timeReminder, curTime, curTime)).toBe(true);
    //     expect(TaskNotification.shouldNotifiy(oldReminder, curTime, curTime)).toBe(false);
    //     expect(TaskNotification.shouldNotifiy(futureRinder, curTime, curTime)).toBe(false);

    //     /* Fails: TypeError: Class extends value undefined is not a constructor or null
    //          > 145 | class ObsidianNotificationModal extends Modal {
    //                 |                                         ^
    //         at Object.<anonymous> (src/Reminders/Notification.ts:145:41)
    //         at Object.<anonymous> (tests/Reminder/Notifications.test.ts:8:1)

    //     */
    // });
});
