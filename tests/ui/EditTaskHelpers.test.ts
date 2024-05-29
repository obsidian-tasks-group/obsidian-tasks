/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import { EditableTask } from '../../src/ui/EditableTask';
import { labelContentWithAccessKey, parseAndValidateRecurrence } from '../../src/ui/EditTaskHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('labelContentWithAccessKey() tests', () => {
    it.each([
        [
            //should make...
            'first letter is the access key f, not the second',
            'f',
            '<span class="accesskey">F</span>irst letter is the access key f, not the second',
        ],
        [
            'should make this x the access key even if it is in the middle',
            'x',
            'Should make this <span class="accesskey">x</span> the access key even if it is in the middle',
        ],
        [
            'should keep the Capitalised letter as the access key',
            'C',
            'Should keep the <span class="accesskey">C</span>apitalised letter as the access key',
        ],
        [
            'should make this y the access key too even if the parameter is a capital Y',
            'Y',
            'Should make this <span class="accesskey">y</span> the access key too even if the parameter is a capital Y',
        ],
        [
            'should add the access key at the end of this text',
            'z',
            'Should add the access key at the end of this text (<span class="accesskey">z</span>)',
        ],
        [
            'should add the access key at the end of this text even if the parameter is capital',
            'Z',
            'Should add the access key at the end of this text even if the parameter is capital (<span class="accesskey">z</span>)',
        ],
        ['should not add an access key span here', null, 'Should not add an access key span here'],
    ])("label text '%s' with access key '%s' should have label content '%s'", (labelText, accessKey, labelContent) => {
        expect(labelContentWithAccessKey(labelText, accessKey)).toEqual(labelContent);
    });
});

describe('parseAndValidateRecurrence() tests', () => {
    const emptyTask = new TaskBuilder().build();
    const { editableTask } = EditableTask.fromTask(emptyTask, [emptyTask]);

    const noRecurrenceRule = (editableTask: EditableTask) => {
        editableTask.recurrenceRule = '';
        return editableTask;
    };
    const invalidRecurrenceRule = (editableTask: EditableTask) => {
        editableTask.recurrenceRule = 'thisIsWrong';
        return editableTask;
    };
    const withRecurrenceRuleButNoHappensDate = (editableTask: EditableTask) => {
        editableTask.recurrenceRule = 'every day';
        return editableTask;
    };
    const withRecurrenceRuleAndHappensDate = (editableTask: EditableTask) => {
        editableTask.recurrenceRule = 'every 1 months when done'; // confirm that recurrence text is standardised
        editableTask.startDate = '2024-05-20';
        return editableTask;
    };

    it.each([
        // editable task, expected parsed recurrence, expected recurrence validity
        [noRecurrenceRule, '<i>not recurring</>', true],
        [invalidRecurrenceRule, '<i>invalid recurrence rule</i>', false],
        [withRecurrenceRuleButNoHappensDate, '<i>due, scheduled or start date required</i>', false],
        [withRecurrenceRuleAndHappensDate, 'every month when done', true],
    ])(
        "editable task with '%s' fields should have '%s' parsed recurrence and its validity is %s",
        (
            editableTaskFields: (editableTask: EditableTask) => EditableTask,
            expectedParsedRecurrence: string,
            expectedRecurrenceValidity: boolean,
        ) => {
            const editedTask = editableTaskFields(editableTask);

            const { parsedRecurrence, isRecurrenceValid } = parseAndValidateRecurrence(editedTask);
            expect(parsedRecurrence).toEqual(expectedParsedRecurrence);
            expect(isRecurrenceValid).toEqual(expectedRecurrenceValidity);
        },
    );
});
