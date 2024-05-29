/**
 * @jest-environment jsdom
 */
import { expect } from '@jest/globals';
import moment from 'moment';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { EditableTask } from '../../src/ui/EditableTask';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

function testEditableTaskDescriptionAndGlobalFilterOnSave({
    globalFilter,
    taskDescription,
    expectedEditableTaskDescription,
    expectedAddGlobalFilterOnSave,
}: {
    globalFilter: string;
    taskDescription: string;
    expectedEditableTaskDescription: string;
    expectedAddGlobalFilterOnSave: boolean;
}) {
    GlobalFilter.getInstance().set(globalFilter);
    const taskWithoutGlobalFilter = new TaskBuilder().description(taskDescription).build();

    const { editableTask, addGlobalFilterOnSave } = EditableTask.fromTask(taskWithoutGlobalFilter, [
        taskWithoutGlobalFilter,
    ]);

    expect(editableTask.description).toEqual(expectedEditableTaskDescription);
    expect(addGlobalFilterOnSave).toEqual(expectedAddGlobalFilterOnSave);
}

describe('EditableTask tests', () => {
    beforeEach(() => {
        GlobalFilter.getInstance().reset();
    });

    it('should create an editable task without dependencies', () => {
        const taskToEdit = TaskBuilder.createFullyPopulatedTask();

        const { editableTask, originalBlocking } = EditableTask.fromTask(taskToEdit, [taskToEdit]);

        expect(editableTask).toMatchInlineSnapshot(`
            EditableTask {
              "blockedBy": [],
              "blocking": [],
              "cancelledDate": "2023-07-06",
              "createdDate": "2023-07-01",
              "description": "Do exercises #todo #health",
              "doneDate": "2023-07-05",
              "dueDate": "2023-07-04",
              "forwardOnly": true,
              "priority": "medium",
              "recurrenceRule": "every day when done",
              "scheduledDate": "2023-07-03",
              "startDate": "2023-07-02",
              "status": Status {
                "configuration": StatusConfiguration {
                  "availableAsCommand": true,
                  "name": "Todo",
                  "nextStatusSymbol": "x",
                  "symbol": " ",
                  "type": "TODO",
                },
              },
            }
        `);
        expect(originalBlocking).toEqual([]);
    });

    it('should create an editable task with dependencies', () => {
        const taskToEdit = TaskBuilder.createFullyPopulatedTask();
        const blockingTask = new TaskBuilder().description('I am blocking the task to edit').id('123456').build();
        const blockedTask = new TaskBuilder()
            .description('I am blocked by the task to edit')
            .dependsOn(['abcdef'])
            .build();
        const allTasks = [taskToEdit, blockingTask, blockedTask];

        const { editableTask, originalBlocking } = EditableTask.fromTask(taskToEdit, allTasks);

        const blockingTasks = editableTask.blocking;
        const blockedByTasks = editableTask.blockedBy;

        expect(blockingTasks).toEqual([blockedTask]);
        expect(blockedByTasks).toEqual([blockingTask]);
        expect(originalBlocking).toEqual([blockedTask]);
    });

    it('should remember to add global filter when it is absent in task description', () => {
        testEditableTaskDescriptionAndGlobalFilterOnSave({
            globalFilter: '#todo',
            taskDescription: 'global filter is absent',
            expectedEditableTaskDescription: 'global filter is absent',
            expectedAddGlobalFilterOnSave: true,
        });
    });

    it('should remember to add global filter when it is present in task description and remove it from the description', () => {
        testEditableTaskDescriptionAndGlobalFilterOnSave({
            globalFilter: '#important',
            taskDescription: '#important is the global filter',
            expectedEditableTaskDescription: 'is the global filter',
            expectedAddGlobalFilterOnSave: true,
        });
    });

    it('should not add global filter by default (global filter was not set)', () => {
        GlobalFilter.getInstance().set(GlobalFilter.empty);
        const task = new TaskBuilder().description('global filter has not been set').build();

        const { addGlobalFilterOnSave } = EditableTask.fromTask(task, [task]);

        expect(addGlobalFilterOnSave).toEqual(false);
    });
});
