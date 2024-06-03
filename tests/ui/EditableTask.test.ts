/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Status } from '../../src/Statuses/Status';
import { EditableTask } from '../../src/ui/EditableTask';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

function testEditableTaskDescriptionAndGlobalFilterOnSave({
    globalFilter,
    taskDescription,
    expectedEditableTaskDescription,
}: {
    globalFilter: string;
    taskDescription: string;
    expectedEditableTaskDescription: string;
}) {
    GlobalFilter.getInstance().set(globalFilter);
    const taskWithoutGlobalFilter = new TaskBuilder().description(taskDescription).build();

    const editableTask = EditableTask.fromTask(taskWithoutGlobalFilter, [taskWithoutGlobalFilter]);

    expect(editableTask.description).toEqual(expectedEditableTaskDescription);
}

describe('EditableTask tests', () => {
    beforeEach(() => {
        GlobalFilter.getInstance().reset();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-05-01'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should create an editable task without dependencies', () => {
        const taskToEdit = TaskBuilder.createFullyPopulatedTask();

        const editableTask = EditableTask.fromTask(taskToEdit, [taskToEdit]);

        expect(editableTask).toMatchInlineSnapshot(`
            EditableTask {
              "addGlobalFilterOnSave": false,
              "blockedBy": [],
              "blocking": [],
              "cancelledDate": "2023-07-06",
              "createdDate": "2023-07-01",
              "description": "Do exercises #todo #health",
              "doneDate": "2023-07-05",
              "dueDate": "2023-07-04",
              "forwardOnly": true,
              "originalBlocking": [],
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

        const editableTask = EditableTask.fromTask(taskToEdit, allTasks);

        expect(editableTask.blocking).toEqual([blockedTask]);
        expect(editableTask.blockedBy).toEqual([blockingTask]);
    });

    it('should remember to add global filter when it is absent in task description', () => {
        testEditableTaskDescriptionAndGlobalFilterOnSave({
            globalFilter: '#todo',
            taskDescription: 'global filter is absent',
            expectedEditableTaskDescription: 'global filter is absent',
        });
    });

    it('should remember to add global filter when it is present in task description and remove it from the description', () => {
        testEditableTaskDescriptionAndGlobalFilterOnSave({
            globalFilter: '#important',
            taskDescription: '#important is the global filter',
            expectedEditableTaskDescription: 'is the global filter',
        });
    });

    it('should not add global filter by default (global filter was not set)', () => {
        testEditableTaskDescriptionAndGlobalFilterOnSave({
            globalFilter: GlobalFilter.empty,
            taskDescription: 'global filter has not been set',
            expectedEditableTaskDescription: 'global filter has not been set',
        });
    });

    it('should apply no edits to an empty task', async () => {
        const task = new TaskBuilder().build();
        const allTasks = [task];

        const editableTask = EditableTask.fromTask(task, allTasks);
        const appliedEdits = await editableTask.applyEdits(task, [task]);

        expect(appliedEdits).toEqual([task]);
    });

    it.failing('should apply no edits to a fully populated task', async () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const allTasks = [task];

        const editableTask = EditableTask.fromTask(task, allTasks);
        const appliedEdits = await editableTask.applyEdits(task, [task]);

        expect(appliedEdits).toEqual([task]);
    });

    it('should apply edit all fields in a fully populated task', async () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const allTasks = [task];

        const editableTask = EditableTask.fromTask(task, allTasks);

        editableTask.description = '';
        editableTask.status = Status.TODO;
        editableTask.priority = 'none';
        editableTask.recurrenceRule = '';
        editableTask.createdDate = '';
        editableTask.startDate = '';
        editableTask.scheduledDate = '';
        editableTask.dueDate = '';
        editableTask.doneDate = '';
        editableTask.cancelledDate = '';
        editableTask.forwardOnly = true;
        editableTask.blockedBy = [];
        editableTask.blocking = [];

        const appliedEdits = await editableTask.applyEdits(task, allTasks);

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

    it('should set a date in YYYY-MM-DD format', async () => {
        const task = new TaskBuilder().build();
        const allTasks: Task[] = [];
        const editableTask = EditableTask.fromTask(task, allTasks);

        editableTask.dueDate = '2024-07-13';

        const editedTasks = await editableTask.applyEdits(task, allTasks);
        // TODO Why does this have the time 12:00?
        //      When I edit a task in the plugin, in the modal, and then group by the following, the time is midnight,
        //      so where is the time dropped in production code?
        //          group by function task.due.formatAsDateAndTime()
        //      Or have I misunderstood something?
        //      For now, I would just like assurance that this is the same behaviour as
        //      the code before this PR.... (I expect it is)
        expect(editedTasks[0].dueDate).toEqualMoment(moment('2024-07-13T12:00:00.000Z'));
    });

    it('should honour the forwardOnly value', async () => {
        const task = new TaskBuilder().build();
        const allTasks: Task[] = [];
        const editableTask = EditableTask.fromTask(task, allTasks);

        jest.setSystemTime(new Date('2024-05-22')); // Wednesday 22nd May

        editableTask.dueDate = 'tuesday';
        const tuesdayBefore = moment('2024-05-28T12:00:00.000Z');
        const tuesdayAfter = moment('2024-05-21T12:00:00.000Z');

        editableTask.forwardOnly = true;
        const tasksFutureDay = await editableTask.applyEdits(task, allTasks);
        expect(tasksFutureDay[0].dueDate).toEqualMoment(tuesdayBefore);

        editableTask.forwardOnly = false;
        const tasksClosestDay = await editableTask.applyEdits(task, allTasks);
        expect(tasksClosestDay[0].dueDate).toEqualMoment(tuesdayAfter);
    });
});

describe('parseAndValidateRecurrence() tests', () => {
    const emptyTask = new TaskBuilder().description('').build();

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
            taskEditor: (editableTask: EditableTask) => EditableTask,
            expectedParsedRecurrence: string,
            expectedRecurrenceValidity: boolean,
        ) => {
            const editableTask = EditableTask.fromTask(emptyTask, [emptyTask]);
            const editedTask = taskEditor(editableTask);

            const { parsedRecurrence, isRecurrenceValid } = editedTask.parseAndValidateRecurrence();
            expect(parsedRecurrence).toEqual(expectedParsedRecurrence);
            expect(isRecurrenceValid).toEqual(expectedRecurrenceValidity);
        },
    );
});
