/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { toHaveExplanation } from '../../CustomMatchers/CustomMatchersForFilters';
import { StartDateField } from '../../../src/Query/Filter/StartDateField';

window.moment = moment;

expect.extend({
    toHaveExplanation,
});

describe('explain start date queries', () => {
    it('should explain explicit date', () => {
        const filterOrMessage = new StartDateField().createFilterOrErrorMessage('starts before 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('start date is before 2023-01-02 (Monday)');
    });

    it('implicit "on" gets added to explanation', () => {
        const filterOrMessage = new StartDateField().createFilterOrErrorMessage('starts 2023-01-02');
        expect(filterOrMessage).toHaveExplanation('start date is 2023-01-02 (Monday)');
    });
});
