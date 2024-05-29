/**
 * @jest-environment jsdom
 */
import { expect } from '@jest/globals';
import moment from 'moment';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Status } from '../../src/Statuses/Status';
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
        testEditableTaskDescriptionAndGlobalFilterOnSave({
            globalFilter: GlobalFilter.empty,
            taskDescription: 'global filter has not been set',
            expectedEditableTaskDescription: 'global filter has not been set',
            expectedAddGlobalFilterOnSave: false,
        });
    });

    it('should apply no edits to an empty task', async () => {
        const task = new TaskBuilder().build();
        const allTasks = [task];

        const { editableTask, originalBlocking, addGlobalFilterOnSave } = EditableTask.fromTask(task, allTasks);
        const appliedEdits = await editableTask.applyEdits(task, originalBlocking, addGlobalFilterOnSave, [task]);

        expect(appliedEdits).toEqual([task]);
    });

    it.failing('should apply no edits to a fully populated task', async () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const allTasks = [task];

        const { editableTask, originalBlocking, addGlobalFilterOnSave } = EditableTask.fromTask(task, allTasks);
        const appliedEdits = await editableTask.applyEdits(task, originalBlocking, addGlobalFilterOnSave, [task]);

        expect(appliedEdits).toEqual([task]);
    });

    it('should apply edit all fields in a fully populated task', async () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const allTasks = [task];

        const { originalBlocking, addGlobalFilterOnSave } = EditableTask.fromTask(task, allTasks);

        const removeAllTaskFields = new EditableTask({
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
        });
        const appliedEdits = await removeAllTaskFields.applyEdits(
            task,
            originalBlocking,
            addGlobalFilterOnSave,
            allTasks,
        );

        expect(appliedEdits.length).toEqual(1);
        expect(appliedEdits[0]).toMatchInlineSnapshot(`
            Task {
              "_urgency": null,
              "blockLink": " ^dcf64c",
              "cancelledDate": null,
              "children": [],
              "createdDate": null,
              "dependsOn": [],
              "description": "",
              "doneDate": null,
              "dueDate": null,
              "id": "abcdef",
              "indentation": "  ",
              "listMarker": "-",
              "originalMarkdown": "  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c",
              "parent": null,
              "priority": "3",
              "recurrence": null,
              "scheduledDate": null,
              "scheduledDateIsInferred": false,
              "startDate": null,
              "status": Status {
                "configuration": StatusConfiguration {
                  "availableAsCommand": true,
                  "name": "Todo",
                  "nextStatusSymbol": "x",
                  "symbol": " ",
                  "type": "TODO",
                },
              },
              "tags": [
                "#todo",
                "#health",
              ],
              "taskLocation": TaskLocation {
                "_lineNumber": 17,
                "_precedingHeader": "My Header",
                "_sectionIndex": 3,
                "_sectionStart": 5,
                "_tasksFile": TasksFile {
                  "_path": "some/folder/fileName.md",
                },
              },
            }
        `);
    });
});
