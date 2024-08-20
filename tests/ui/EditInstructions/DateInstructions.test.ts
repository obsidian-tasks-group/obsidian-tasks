/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import type { unitOfTime } from 'moment/moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import {
    SetRelativeTaskDate,
    SetTaskDate,
    allHappensDateInstructions,
} from '../../../src/ui/EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../../src/DateTime/DateFieldTypes';
import { Task } from '../../../src/Task/Task';
import { TaskLayoutComponent } from '../../../src/Layout/TaskLayoutOptions';
import { TasksDate } from '../../../src/DateTime/TasksDate';
import { SEPARATOR_INSTRUCTION_DISPLAY_NAME } from '../../../src/ui/EditInstructions/MenuDividerInstruction';
import type { TaskEditingInstruction } from '../../../src/ui/EditInstructions/TaskEditingInstruction';

window.moment = moment;

const today = '2024-10-01';
const tomorrow = '2024-10-02';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterEach(() => {
    jest.useRealTimers();
});

const taskWithNoDates = new TaskBuilder().build();
const taskDueToday = new TaskBuilder().dueDate(today).build();
const taskDueTomorrow = new TaskBuilder().dueDate(tomorrow).build();

describe('SetTaskDate', () => {
    it('should provide information to set up a menu item for due date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(today));

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Set Date: Tue Oct 01 2024');
        expect(instruction.isCheckedForTask(taskWithNoDates)).toEqual(false);
        expect(instruction.isCheckedForTask(taskDueToday)).toEqual(true);
    });

    it('should create a menu item with a custom display name', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(today), 'Apple Sauce');

        // Assert
        expect(instruction.instructionDisplayName()).toEqual('Apple Sauce');
    });

    it('should edit the date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(tomorrow));

        // Apply
        const newTasks = instruction.apply(taskWithNoDates);

        // Assert
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0].dueDate).toEqualMoment(moment(tomorrow));
    });

    it('should not edit task if already has chosen date', () => {
        // Arrange
        const instruction = new SetTaskDate('dueDate', new Date(tomorrow));

        // Apply
        const newTasks = instruction.apply(taskDueTomorrow);

        // Assert
        expect(newTasks.length).toEqual(1);
        // Expect it is the same object
        expect(Object.is(newTasks[0], taskDueTomorrow)).toBe(true);
    });
});

describe('SetRelativeTaskDate', () => {
    function testSetRelativeTaskDate(
        task: Task,
        dateFieldToEdit: AllTaskDateFields,
        amount: number,
        timeUnit: unitOfTime.DurationConstructor,
        expectedTitle: string,
        expectedNewDate: moment.Moment,
    ) {
        // Arrange
        const instruction = new SetRelativeTaskDate(task, dateFieldToEdit, amount, timeUnit);

        // Apply
        const newTasks = instruction.apply(task);

        // Assert
        expect(instruction.instructionDisplayName()).toEqual(expectedTitle);
        expect(newTasks.length).toEqual(1);
        expect(newTasks[0][dateFieldToEdit]).toEqualMoment(expectedNewDate);
    }

    it('should postpone a task with a due date', () => {
        const expectedTitle = 'Due tomorrow, on Wed 2nd Oct';
        testSetRelativeTaskDate(taskDueToday, 'dueDate', 1, 'day', expectedTitle, moment(tomorrow));
    });

    it("should postpone a task without a due date, based on today's date", () => {
        const expectedTitle = 'Start in 2 weeks, on Tue 15th Oct';
        testSetRelativeTaskDate(taskWithNoDates, 'startDate', 2, 'weeks', expectedTitle, moment('2024-10-15'));
    });

    it('should set a done date', () => {
        const expectedTitle = 'Done today, on Tue 1st Oct';
        testSetRelativeTaskDate(taskWithNoDates, 'doneDate', 0, 'days', expectedTitle, moment(today));
    });
});

describe('DateInstruction lists', () => {
    function applyAll(instructions: TaskEditingInstruction[], task: Task, field: TaskLayoutComponent.DueDate) {
        return instructions
            .map((instruction) => {
                const checkMark = instruction.isCheckedForTask(taskWithNoDates) ? 'x' : ' ';

                const label = instruction.instructionDisplayName();
                if (label === SEPARATOR_INSTRUCTION_DISPLAY_NAME) {
                    return `${checkMark} ${label}`;
                }

                const newTasks = instruction.apply(task);
                expect(newTasks.length).toEqual(1);
                const newDate = newTasks[0][field];

                return `${checkMark} ${label} => ${new TasksDate(newDate).formatAsDate('No Date')}`;
            })
            .join('\n');
    }

    it('should offer future dates for task due today', () => {
        const field = TaskLayoutComponent.DueDate;
        const currentFieldValue = { dueDate: window.moment(today) };
        const datesFunction = allHappensDateInstructions;

        const task = new Task({ ...new TaskBuilder().build(), ...currentFieldValue });
        const instructions = datesFunction(field, task);

        const allAppliedToTask = applyAll(instructions, task, field);
        expect('\n' + allAppliedToTask).toMatchInlineSnapshot(`
            "
              Due in 2 days, on Thu 3rd Oct => 2024-10-03
              Due in 3 days, on Fri 4th Oct => 2024-10-04
              Due in 4 days, on Sat 5th Oct => 2024-10-05
              Due in 5 days, on Sun 6th Oct => 2024-10-06
              Due in 6 days, on Mon 7th Oct => 2024-10-07
              ---
              Due in a week, on Tue 8th Oct => 2024-10-08
              Due in 2 weeks, on Tue 15th Oct => 2024-10-15
              Due in 3 weeks, on Tue 22nd Oct => 2024-10-22
              Due in a month, on Fri 1st Nov => 2024-11-01"
        `);
    });
});
