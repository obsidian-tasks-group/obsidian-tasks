/**
 * @jest-environment jsdom
 */
jest.mock('obsidian');
import moment from 'moment';
import { TIME_FORMATS, resetSettings } from '../../src/Config/Settings';
import { Reminder, ReminderType, parseDateTime, parseMoment } from '../../src/Reminders/Reminder';
import { fromLine } from '../TestHelpers';

window.moment = moment;

function checkParsedDateTime(input: string, output: string) {
    const dateTime = parseDateTime(input);
    expect(dateTime).not.toBeNull();
    expect(dateTime!.toString()).toEqual(output);
}

describe('should parse Moment() dates & times as reminder: ', () => {
    it('test Moment() datetime 24hr', () => {
        const reminder = moment('2023-04-30 13:45', TIME_FORMATS.twentyFourHour);
        expect(parseMoment(reminder)).toStrictEqual(
            new Reminder(moment('2023-04-30 13:45', TIME_FORMATS.twentyFourHour), ReminderType.DateTime),
        );
    });

    it('test Moment() date', () => {
        const reminder = moment('2023-04-30');
        expect(parseMoment(reminder)).toStrictEqual(new Reminder(moment('2023-04-30'), ReminderType.Date));
    });
});

describe('should parse dates & times string as reminder: ', () => {
    afterEach(function () {
        resetSettings();
    });

    it('test 24-hour format', () => {
        checkParsedDateTime('2023-01-15', '2023-01-15');
        checkParsedDateTime('2023-01-15 13:45', '2023-01-15 13:45');
        checkParsedDateTime('2023-01-15 1:45 pm', '2023-01-15 01:45'); // the pm & leading 0 are ignored
    });
});

describe('should parse task strings: ', () => {
    afterEach(function () {
        resetSettings();
    });

    it('valid task - in 24-hour format', () => {
        const line = '- [ ] #task Reminder at 13:57 ⏰️ 2023-05-03 13:57';
        const task = fromLine({ line: line });
        expect(task.reminder).not.toBeNull();
    });
});
