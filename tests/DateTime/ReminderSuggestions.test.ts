/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { buildReminderSuggestions } from '../../src/DateTime/ReminderSuggestions';
import { parseReminderTimeInput } from '../../src/DateTime/ReminderTimeParser';

window.moment = moment;

const now = moment('2023-12-03T10:07:00');

describe('buildReminderSuggestions', () => {
    it('should return one suggestion per preset time, value and label both the bare time', () => {
        const { presetTimes } = buildReminderSuggestions(['09:00', '18:00'], [], 30, now);

        expect(presetTimes).toEqual([
            { value: '09:00', label: '09:00' },
            { value: '18:00', label: '18:00' },
        ]);
    });

    it('should describe relative offsets in both minutes and hours, rounded to the increment', () => {
        const { relativeOffsets } = buildReminderSuggestions([], [30, 60, 90], 30, now);

        expect(relativeOffsets).toEqual([
            { value: 'in 30 minutes', label: 'In 30 minutes (11:00)' },
            { value: 'in 1 hour', label: 'In 1 hour (11:30)' },
            { value: 'in 90 minutes', label: 'In 90 minutes (12:00)' },
        ]);
    });

    it('should pluralise "hours" only when there is more than one', () => {
        const { relativeOffsets } = buildReminderSuggestions([], [60, 120], 30, now);

        expect(relativeOffsets[0].label).toContain('In 1 hour ');
        expect(relativeOffsets[1].label).toContain('In 2 hours ');
    });

    it('should produce a relative value that parseReminderTimeInput resolves back to the same rounded time', () => {
        const { relativeOffsets } = buildReminderSuggestions([], [45], 30, now);
        const suggestion = relativeOffsets[0];

        const parsed = parseReminderTimeInput(suggestion.value, now);

        expect(parsed).not.toBeNull();
        expect(parsed!.isRelative).toEqual(true);
        // 10:07 + 45 minutes = 10:52, rounded up to the next 30-minute mark = 11:00.
        expect(suggestion.label).toContain('11:00');
    });
});
