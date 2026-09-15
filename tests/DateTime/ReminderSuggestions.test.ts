/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { buildReminderSuggestions } from '../../src/DateTime/ReminderSuggestions';

window.moment = moment;

const now = moment('2023-12-03T10:07:00');

describe('buildReminderSuggestions', () => {
    it('should return one suggestion per preset time, value and label both the bare time, and no resolvedDate', () => {
        const { presetTimes } = buildReminderSuggestions(['09:00', '18:00'], [], 30, 'ceil', now);

        expect(presetTimes).toEqual([
            { value: '09:00', label: '09:00' },
            { value: '18:00', label: '18:00' },
        ]);
    });

    it('should label a relative offset with the EXACT time remaining until the rounded target, not the nominal configured duration', () => {
        // 10:07 + 30 minutes = 10:37 exactly, rounded (ceil) to the next 30-minute mark = 11:00 - 53 minutes
        // away from 'now', not the nominal 30 the offset was configured as.
        const { relativeOffsets } = buildReminderSuggestions([], [30, 60, 90], 30, 'ceil', now);

        expect(relativeOffsets.map((s) => ({ value: s.value, label: s.label }))).toEqual([
            { value: 'in 30 minutes', label: 'In 53 minutes (11:00)' },
            { value: 'in 1 hour', label: 'In 83 minutes (11:30)' },
            { value: 'in 90 minutes', label: 'In 113 minutes (12:00)' },
        ]);
    });

    it("should keep the nominal offset as the suggestion's value even though the label shows the exact time", () => {
        // Picking this suggestion should still insert 'in 30 minutes' as free text, so re-parsing it later
        // (e.g. after the modal's Apply is eventually pressed) resolves fresh from whatever 'now' is by
        // then - not the exact-minutes wording, which is only ever a display label.
        const { relativeOffsets } = buildReminderSuggestions([], [30], 30, 'ceil', now);

        expect(relativeOffsets[0].value).toEqual('in 30 minutes');
    });

    it('should pluralise "hours" only when there is more than one, using the exact time remaining', () => {
        // With rounding disabled, the exact time remaining coincides with the nominal offset, so this
        // exercises offsetPhrase's own hour-conversion logic the same way a configured '1 hour'/'2 hours'
        // offset would read.
        const { relativeOffsets } = buildReminderSuggestions([], [60, 120], 0, 'ceil', now);

        expect(relativeOffsets[0].label).toContain('In 1 hour ');
        expect(relativeOffsets[1].label).toContain('In 2 hours ');
    });

    it("should give each relative offset a resolvedDate matching its label's rounded time - not the exact, unrounded offset", () => {
        // 10:07 + 45 minutes = 10:52, rounded up to the next 30-minute mark = 11:00.
        const { relativeOffsets } = buildReminderSuggestions([], [45], 30, 'ceil', now);
        const suggestion = relativeOffsets[0];

        expect(suggestion.label).toContain('11:00');
        expect(suggestion.resolvedDate).toBeDefined();
        expect(suggestion.resolvedDate!.format('YYYY-MM-DD HH:mm')).toEqual('2023-12-03 11:00');
    });

    it('should not round resolvedDate at all when the rounding increment is 0 ("no rounding")', () => {
        const { relativeOffsets } = buildReminderSuggestions([], [45], 0, 'ceil', now);
        const suggestion = relativeOffsets[0];

        expect(suggestion.label).toContain('10:52');
        expect(suggestion.resolvedDate!.format('YYYY-MM-DD HH:mm')).toEqual('2023-12-03 10:52');
    });

    it('should show the same exact time as the nominal offset when rounding is disabled ("no rounding")', () => {
        const { relativeOffsets } = buildReminderSuggestions([], [45], 0, 'ceil', now);

        expect(relativeOffsets[0].label).toEqual('In 45 minutes (10:52)');
    });

    describe('rounding mode', () => {
        it("'floor' should round a relative offset's target down, not up", () => {
            // 10:07 + 45 minutes = 10:52, floored to the previous 30-minute mark = 10:30.
            const { relativeOffsets } = buildReminderSuggestions([], [45], 30, 'floor', now);

            expect(relativeOffsets[0].label).toEqual('In 23 minutes (10:30)');
        });

        it("'round' should round a relative offset's target to the nearer mark", () => {
            // 10:07 + 20 minutes = 10:27, closer to 10:30 than to 10:00.
            const { relativeOffsets } = buildReminderSuggestions([], [20], 30, 'round', now);

            expect(relativeOffsets[0].label).toEqual('In 23 minutes (10:30)');
        });

        it("should never suggest a target at or before 'now', even when 'floor'/'round' would otherwise land there", () => {
            // 18:31 + 1 minute = 18:32, floored to 18:30 - which is BEFORE 'now' (18:31). Must be nudged
            // forward by a full increment instead of ever suggesting an already-past time.
            const lateNow = moment('2023-12-03T18:31:00');
            const { relativeOffsets } = buildReminderSuggestions([], [1], 30, 'floor', lateNow);

            expect(relativeOffsets[0].label).toEqual('In 29 minutes (19:00)');
            expect(relativeOffsets[0].resolvedDate!.isAfter(lateNow)).toEqual(true);
        });
    });
});
