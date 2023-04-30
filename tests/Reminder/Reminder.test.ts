/**
 * @jest-environment jsdom
 */
jest.mock('obsidian');
import moment from 'moment';
import { Reminder, ReminderType, parseMoment } from '../../src/reminders/Reminder';

window.moment = moment;

describe('Reminder ', () => {
    it('testing parsing Moment() datetime', () => {
        const reminder = moment('2023-04-30 11:44 am');

        expect(parseMoment(reminder)).toStrictEqual(new Reminder(moment('2023-04-30 11:44 am'), ReminderType.DateTime));
    });

    it('testing parsing Moment() date', () => {
        const reminder = moment('2023-04-30');

        expect(parseMoment(reminder)).toStrictEqual(new Reminder(moment('2023-04-30'), ReminderType.Date));
    });
});
