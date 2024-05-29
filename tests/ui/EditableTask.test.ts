/**
 * @jest-environment jsdom
 */
import { expect } from '@jest/globals';
import moment from 'moment';
import { EditableTask } from '../../src/ui/EditableTask';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('EditableTask tests', () => {
    it('should create an editable task without dependencies', () => {
        const taskToEdit = TaskBuilder.createFullyPopulatedTask();

        const { editableTask } = EditableTask.fromTask(taskToEdit, [taskToEdit]);

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
});
