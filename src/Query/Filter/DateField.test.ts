/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { ScheduledDateField } from './ScheduledDateField';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-11 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('DateField', () => {
    describe('Error Checking', () => {
        // See https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2324
        it('should reject any date searches that contain unexpanded templater text', () => {
            const instruction = 'scheduled before <%+ tp.date.now("YYYY-MM-DD", 0, tp.file.title , "YYYY-MM-DD") %>';
            const filter = new ScheduledDateField().createFilterOrErrorMessage(instruction);
            expect(filter).not.toBeValid();
            expect(filter.error).toContain('Instruction contains unexpanded template instructions');
        });
    });
});
