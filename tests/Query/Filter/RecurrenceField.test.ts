/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { RecurrenceField } from '../../../src/Query/Filter/RecurrenceField';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { toMatchTask } from '../../CustomMatchers/CustomMatchersForFilters';
import { RecurrenceBuilder } from '../../TestingTools/RecurrenceBuilder';
import { fromLine } from '../../TestHelpers';

window.moment = moment;

expect.extend({
    toMatchTask,
});

describe('recurrence', () => {
    it('value', () => {
        const field = new RecurrenceField();
        expect(field.value(fromLine({ line: '- [ ] I do not have a recurrence rule' }))).toStrictEqual('');
        expect(field.value(fromLine({ line: '- [ ] a 🔁 every Sunday when done' }))).toStrictEqual(
            'every week on Sunday when done',
        );
    });

    it('by recurrence (includes)', () => {
        // Arrange
        const filter = new RecurrenceField().createFilterOrErrorMessage('recurrence includes wednesday');

        // Assert
        const recurrence = new RecurrenceBuilder().rule('every Wednesday').startDate('2022-07-14').build();
        const task = new TaskBuilder().recurrence(recurrence).build();
        expect(filter).toMatchTask(task);
    });
});
