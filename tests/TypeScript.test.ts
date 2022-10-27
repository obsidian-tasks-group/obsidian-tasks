/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { TaskDate } from '../src/TaskDate';

window.moment = moment;

describe('TaskDate', () => {
    it('should default to no date', () => {
        const date = new TaskDate();
        expect(date.date).toBeNull();
    });
});
