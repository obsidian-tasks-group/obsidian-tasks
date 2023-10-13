/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { ScheduledDateField } from '../../../src/Query/Filter/ScheduledDateField';

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
        // All instructions should be scheduled, as test uses ScheduledDateField
        it.each([
            // A Templater 'dynamic command', which has a + after <%
            // From https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2324:
            'scheduled before <%+ tp.date.now("YYYY-MM-DD", 0, tp.file.title , "YYYY-MM-DD") %>',
            // From https://publish.obsidian.md/tasks/Advanced/Daily+Agenda.
            // In practice, when run via Query, this will give the following error instead:
            //      Tasks query: There was an error expanding one or more placeholders.
            // Nevertheless, it's useful to guard against any date formatting text leaking in to filters:
            'scheduled on {{date+14d:YYYY-MM-DD}}',
        ])(
            'should reject date search containing unexpanded template text for instruction "%s"',
            async (instruction: string) => {
                const filter = new ScheduledDateField().createFilterOrErrorMessage(instruction);
                expect(filter).not.toBeValid();
                expect(filter.error).toContain('Instruction contains unexpanded template text');
            },
        );
    });
});
