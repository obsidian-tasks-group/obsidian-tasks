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
    it('should reject date search containing unexpanded template text', () => {
        // Thorough checks are done in TemplatingPluginTools tests.

        // Arrange
        const instruction = 'scheduled before <%+ tp.date.now("YYYY-MM-DD", 0, tp.file.title , "YYYY-MM-DD") %>';

        // Act
        const filter = new ScheduledDateField().createFilterOrErrorMessage(instruction);

        // Assert
        expect(filter).not.toBeValid();
        expect(filter.error).toContain('Instruction contains unexpanded template text');
    });

    it('should honour original case, when explaining simple filters', () => {
        const filter = new ScheduledDateField().createFilterOrErrorMessage('HAS SCHEDULED DATE');
        expect(filter).toHaveExplanation('HAS SCHEDULED DATE');
    });
});
