/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { RecurrenceBuilder } from './RecurrenceBuilder';

window.moment = moment;

describe('RecurrenceBuilder', () => {
    it('should build a Recurrence object', () => {
        const builder = new RecurrenceBuilder();
        const recurrence = builder.rule('every week when done').startDate('2022-07-14').build();
        expect(recurrence).not.toEqual(null);
        expect(recurrence.toText())!.toBe('every week when done');
    });
});
