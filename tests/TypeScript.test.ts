/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { TaskDate } from '../src/TaskDate';
import { TaskRegularExpressions } from '../src/Task';

window.moment = moment;

describe('TaskDate', () => {
    it('should default to no date', () => {
        const date = new TaskDate();
        expect(date.date).toBeNull();
    });

    it('should construct a date from a string', () => {
        const date = new TaskDate('2022-01-23');
        // TODO Write out meaningful information if test fails:
        expect(date.date!.isSame(moment('2022-01-23', 'YYYY-MM-DD'))).toStrictEqual(true);
    });

    it('should construct a date from a null', () => {
        const date = new TaskDate(null);
        expect(date.date).toBeNull();
    });

    it('should construct a date from a moment', () => {
        const dateAsMoment = window.moment('1983-10-13', TaskRegularExpressions.dateFormat);
        const date = TaskDate.fromMoment(dateAsMoment);
        expect(date.date!.isSame(dateAsMoment)).toStrictEqual(true);
    });
});
