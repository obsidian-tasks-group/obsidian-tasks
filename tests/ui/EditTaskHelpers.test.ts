/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';
import { Status } from '../../src/Statuses/Status';
import type { EditableTask } from '../../src/ui/EditableTask';
import { labelContentWithAccessKey, parseAndValidateRecurrence } from '../../src/ui/EditTaskHelpers';

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
    const emptyTask: EditableTask = {
        description: '',
        status: Status.TODO,
        priority: 'none',
        recurrenceRule: '',
        createdDate: '',
        startDate: '',
        scheduledDate: '',
        dueDate: '',
        doneDate: '',
        cancelledDate: '',
        forwardOnly: true,
        blockedBy: [],
        blocking: [],
    };
    const noRecurrenceRule: Partial<EditableTask> = emptyTask;
    const invalidRecurrenceRule: Partial<EditableTask> = {
        recurrenceRule: 'thisIsWrong',
    };
    const withRecurrenceRuleButNoHappensDate: Partial<EditableTask> = {
        recurrenceRule: 'every day',
    };
    const withRecurrenceRuleAndHappensDate: Partial<EditableTask> = {
        recurrenceRule: 'every 1 months when done', // confirm that recurrence text is standardised
        startDate: '2024-05-20',
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
            editableTaskFields: Partial<EditableTask>,
            expectedParsedRecurrence: string,
            expectedRecurrenceValidity: boolean,
        ) => {
            const editableTask = { ...emptyTask, ...editableTaskFields };

            const { parsedRecurrence, isRecurrenceValid } = parseAndValidateRecurrence(editableTask);
            expect(parsedRecurrence).toEqual(expectedParsedRecurrence);
            expect(isRecurrenceValid).toEqual(expectedRecurrenceValidity);
        },
    );
});
