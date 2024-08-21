/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import type { unitOfTime } from 'moment/moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import {
    RemoveTaskDate,
    SetRelativeTaskDate,
    SetTaskDate,
    allHappensDateInstructions,
    allLifeCycleDateInstructions,
} from '../../../src/ui/EditInstructions/DateInstructions';
import type { AllTaskDateFields } from '../../../src/DateTime/DateFieldTypes';
import { Task } from '../../../src/Task/Task';
import { TaskLayoutComponent } from '../../../src/Layout/TaskLayoutOptions';
import { TasksDate } from '../../../src/DateTime/TasksDate';
import { SEPARATOR_INSTRUCTION_DISPLAY_NAME } from '../../../src/ui/EditInstructions/MenuDividerInstruction';
import type { TaskEditingInstruction } from '../../../src/ui/EditInstructions/TaskEditingInstruction';

window.moment = moment;

const yesterday = '2024-09-30';
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
        const instruction = new SetRelativeTaskDate(dateFieldToEdit, task, amount, timeUnit);

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

describe('RemoveTaskDate', () => {
    it('should provide information to set up a menu item for removing start date', () => {
        const instruction = new RemoveTaskDate('startDate', taskWithNoDates);

        expect(instruction.instructionDisplayName()).toEqual('Remove start date');
        expect(instruction.isCheckedForTask(taskWithNoDates)).toEqual(false);
    });

    it('should refuse to remove scheduled date from task with inferred scheduled date', () => {
        const task = new TaskBuilder().scheduledDate(today).scheduledDateIsInferred(true).build();
        const instruction = new RemoveTaskDate('scheduledDate', task);

        expect(instruction.instructionDisplayName()).toEqual('Cannot remove inferred scheduled date');

        const newTasks = instruction.apply(task);
        expect(newTasks.length).toEqual(1);
        const newTask = newTasks[0];

        // Check that the initial task has not been modified:
        expect(newTask).toBe(task);
    });

    it('should not edit task if already has no value in field being removed', () => {
        // Arrange
        const task = new TaskBuilder()
            .createdDate(today)
            .doneDate(today)
            .dueDate(today)
            .scheduledDate(today)
            .startDate(today)
            .build();
        const instruction = new RemoveTaskDate('cancelledDate', task);

        // Apply
        const newTasks = instruction.apply(task);

        // Assert
        expect(newTasks.length).toEqual(1);
        // Expect it is the same object
        expect(newTasks[0]).toBe(task);
    });

    it('should create a new task with Due date removed', () => {
        const instruction = new RemoveTaskDate('dueDate', taskDueToday);

        const newTasks = instruction.apply(taskDueToday);
        expect(newTasks.length).toEqual(1);
        const newTask = newTasks[0];

        expect(newTask['dueDate']).toBeNull();
        expect(newTask.description).toEqual(taskDueToday.description);
    });
});

describe('DateInstruction lists', () => {
    function applyAllInstructions(
        field:
            | TaskLayoutComponent.DueDate
            | TaskLayoutComponent.ScheduledDate
            | TaskLayoutComponent.StartDate
            | TaskLayoutComponent.CreatedDate
            | TaskLayoutComponent.DoneDate
            | TaskLayoutComponent.CancelledDate,
        currentFieldValue:
            | { dueDate: any }
            | { scheduledDate: any }
            | { startDate: any }
            | { createdDate: any }
            | { doneDate: any }
            | { cancelledDate: any },
        datesFunction: (field: AllTaskDateFields, task: Task) => TaskEditingInstruction[],
    ) {
        const task = new Task({ ...new TaskBuilder().build(), ...currentFieldValue });
        const instructions = datesFunction(field, task);
        return (
            '\n' +
            instructions
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
                .join('\n')
        );
    }

    describe('happens dates', () => {
        it('should offer future dates for task due yesterday', () => {
            const allAppliedToTask = applyAllInstructions(
                TaskLayoutComponent.DueDate,
                { dueDate: window.moment(yesterday) },
                allHappensDateInstructions,
            );
            expect(allAppliedToTask).toMatchInlineSnapshot(`
                "
                  Due today, on Tue 1st Oct => 2024-10-01
                  Due tomorrow, on Wed 2nd Oct => 2024-10-02
                  ---
                  Due in 2 days, on Thu 3rd Oct => 2024-10-03
                  Due in 3 days, on Fri 4th Oct => 2024-10-04
                  Due in 4 days, on Sat 5th Oct => 2024-10-05
                  Due in 5 days, on Sun 6th Oct => 2024-10-06
                  Due in 6 days, on Mon 7th Oct => 2024-10-07
                  ---
                  Due in a week, on Tue 8th Oct => 2024-10-08
                  Due in 2 weeks, on Tue 15th Oct => 2024-10-15
                  Due in 3 weeks, on Tue 22nd Oct => 2024-10-22
                  Due in a month, on Fri 1st Nov => 2024-11-01
                  ---
                  Remove due date => No Date"
            `);
        });

        it('should offer future dates for task due today', () => {
            const allAppliedToTask = applyAllInstructions(
                TaskLayoutComponent.ScheduledDate,
                { scheduledDate: window.moment(today) },
                allHappensDateInstructions,
            );
            expect(allAppliedToTask).toMatchInlineSnapshot(`
                "
                  Scheduled today, on Tue 1st Oct => 2024-10-01
                  Scheduled tomorrow, on Wed 2nd Oct => 2024-10-02
                  ---
                  Scheduled in 2 days, on Thu 3rd Oct => 2024-10-03
                  Scheduled in 3 days, on Fri 4th Oct => 2024-10-04
                  Scheduled in 4 days, on Sat 5th Oct => 2024-10-05
                  Scheduled in 5 days, on Sun 6th Oct => 2024-10-06
                  Scheduled in 6 days, on Mon 7th Oct => 2024-10-07
                  ---
                  Scheduled in a week, on Tue 8th Oct => 2024-10-08
                  Scheduled in 2 weeks, on Tue 15th Oct => 2024-10-15
                  Scheduled in 3 weeks, on Tue 22nd Oct => 2024-10-22
                  Scheduled in a month, on Fri 1st Nov => 2024-11-01
                  ---
                  Remove scheduled date => No Date"
            `);
        });

        it('should offer future dates for task due tomorrow', () => {
            const allAppliedToTask = applyAllInstructions(
                TaskLayoutComponent.StartDate,
                { startDate: window.moment(tomorrow) },
                allHappensDateInstructions,
            );
            expect(allAppliedToTask).toMatchInlineSnapshot(`
                "
                  Start today, on Tue 1st Oct => 2024-10-01
                  Start tomorrow, on Wed 2nd Oct => 2024-10-02
                  ---
                  Postpone start date by 2 days, to Fri 4th Oct => 2024-10-04
                  Postpone start date by 3 days, to Sat 5th Oct => 2024-10-05
                  Postpone start date by 4 days, to Sun 6th Oct => 2024-10-06
                  Postpone start date by 5 days, to Mon 7th Oct => 2024-10-07
                  Postpone start date by 6 days, to Tue 8th Oct => 2024-10-08
                  ---
                  Postpone start date by a week, to Wed 9th Oct => 2024-10-09
                  Postpone start date by 2 weeks, to Wed 16th Oct => 2024-10-16
                  Postpone start date by 3 weeks, to Wed 23rd Oct => 2024-10-23
                  Postpone start date by a month, to Sat 2nd Nov => 2024-11-02
                  ---
                  Remove start date => No Date"
            `);
        });
    });

    describe('lifecycle dates', () => {
        it('should offer past dates for task due yesterday', () => {
            const allAppliedToTask = applyAllInstructions(
                TaskLayoutComponent.CreatedDate,
                { createdDate: window.moment(yesterday) },
                allLifeCycleDateInstructions,
            );
            expect(allAppliedToTask).toMatchInlineSnapshot(`
                "
                  Created today, on Tue 1st Oct => 2024-10-01
                  Created yesterday, on Mon 30th Sep => 2024-09-30
                  ---
                  Created 2 days ago, on Sun 29th Sep => 2024-09-29
                  Created 3 days ago, on Sat 28th Sep => 2024-09-28
                  Created 4 days ago, on Fri 27th Sep => 2024-09-27
                  Created 5 days ago, on Thu 26th Sep => 2024-09-26
                  Created 6 days ago, on Wed 25th Sep => 2024-09-25
                  ---
                  Created 1 week ago, on Tue 24th Sep => 2024-09-24
                  Created 2 weeks ago, on Tue 17th Sep => 2024-09-17
                  Created 3 weeks ago, on Tue 10th Sep => 2024-09-10
                  Created 1 month ago, on Sun 1st Sep => 2024-09-01
                  ---
                  Remove created date => No Date"
            `);
        });

        it('should offer past dates for task due today', () => {
            const allAppliedToTask = applyAllInstructions(
                TaskLayoutComponent.DoneDate,
                { doneDate: window.moment(today) },
                allLifeCycleDateInstructions,
            );
            expect(allAppliedToTask).toMatchInlineSnapshot(`
                "
                  Done today, on Tue 1st Oct => 2024-10-01
                  Done yesterday, on Mon 30th Sep => 2024-09-30
                  ---
                  Done 2 days ago, on Sun 29th Sep => 2024-09-29
                  Done 3 days ago, on Sat 28th Sep => 2024-09-28
                  Done 4 days ago, on Fri 27th Sep => 2024-09-27
                  Done 5 days ago, on Thu 26th Sep => 2024-09-26
                  Done 6 days ago, on Wed 25th Sep => 2024-09-25
                  ---
                  Done 1 week ago, on Tue 24th Sep => 2024-09-24
                  Done 2 weeks ago, on Tue 17th Sep => 2024-09-17
                  Done 3 weeks ago, on Tue 10th Sep => 2024-09-10
                  Done 1 month ago, on Sun 1st Sep => 2024-09-01
                  ---
                  Remove done date => No Date"
            `);
        });

        it('should offer past dates for task due tomorrow', () => {
            const allAppliedToTask = applyAllInstructions(
                TaskLayoutComponent.CancelledDate,
                { cancelledDate: window.moment(tomorrow) },
                allLifeCycleDateInstructions,
            );
            expect(allAppliedToTask).toMatchInlineSnapshot(`
                "
                  Cancelled today, on Tue 1st Oct => 2024-10-01
                  Cancelled yesterday, on Mon 30th Sep => 2024-09-30
                  ---
                  Backdate cancelled date by 2 days, to Mon 30th Sep => 2024-09-30
                  Backdate cancelled date by 3 days, to Sun 29th Sep => 2024-09-29
                  Backdate cancelled date by 4 days, to Sat 28th Sep => 2024-09-28
                  Backdate cancelled date by 5 days, to Fri 27th Sep => 2024-09-27
                  Backdate cancelled date by 6 days, to Thu 26th Sep => 2024-09-26
                  ---
                  Backdate cancelled date by 1 week, to Wed 25th Sep => 2024-09-25
                  Backdate cancelled date by 2 weeks, to Wed 18th Sep => 2024-09-18
                  Backdate cancelled date by 3 weeks, to Wed 11th Sep => 2024-09-11
                  Backdate cancelled date by 1 month, to Mon 2nd Sep => 2024-09-02
                  ---
                  Remove cancelled date => No Date"
            `);
        });
    });
});
