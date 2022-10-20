/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';
import { ScheduledDateField } from '../../../src/Query/Filter/ScheduledDateField';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

describe('explain start date queries', () => {
    it('should explain explicit date', () => {
        const instruction = 'scheduled before 2023-01-02';
        const filterOrMessage = new ScheduledDateField().createFilterOrErrorMessage(instruction);
        const expected = 'scheduled date is before 2023-01-02';
        expect(filterOrMessage).toHaveExplanation(expected);
    });

    it('implicit "on" gets added to explanation', () => {
        const field = new ScheduledDateField();
        const filterOrMessage = field.createFilterOrErrorMessage('scheduled 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('scheduled date is 2023-01-02');
    });
});
