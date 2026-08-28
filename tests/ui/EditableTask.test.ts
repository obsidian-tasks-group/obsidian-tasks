/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Task } from 'Task/Task';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Status } from '../../src/Statuses/Status';
import { OnCompletion } from '../../src/Task/OnCompletion';
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
              "onCompletion": "delete",
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
        editableTask.onCompletion = OnCompletion.Ignore;
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
              "_cancelledDate": null,
              "_createdDate": null,
              "_doneDate": null,
              "_dueDate": null,
              "_scheduledDate": null,
              "_startDate": null,
              "_urgency": null,
              "blockLink": " ^dcf64c",
              "children": [],
              "dependsOn": [],
              "description": "",
              "id": "abcdef",
              "indentation": "  ",
              "listMarker": "-",
              "markdownHardBreak": "",
              "onCompletion": "",
              "originalMarkdown": "  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c",
              "parent": null,
              "priority": "3",
              "recurrence": null,
              "scheduledDateIsInferred": false,
              "status": Status {
                "configuration": StatusConfiguration {
                  "availableAsCommand": true,
                  "name": "Todo",
                  "nextStatusSymbol": "x",
                  "symbol": " ",
                  "type": "TODO",
                },
              },
              "statusCharacter": " ",
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
                  "_cachedMetadata": {},
                  "_frontmatter": {
                    "tags": [],
                  },
                  "_outlinksInBody": [],
                  "_outlinksInProperties": [],
                  "_path": "some/folder/fileName.md",
                  "_tags": [],
                  "tFile": undefined,
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

describe('parseAndValidateDates() tests', () => {
    // Per the discussion on #2986: "a task can have both a Cancelled and a Done date"
    // is not the fundamental error. There are two independent constraints:
    //   1. a Done date is only valid when status.type is DONE
    //   2. a Cancelled date is only valid when status.type is CANCELLED
    function editableTaskWith({
        status,
        doneDate = '',
        cancelledDate = '',
    }: {
        status: Status;
        doneDate?: string;
        cancelledDate?: string;
    }) {
        const task = new TaskBuilder().build();
        const editableTask = EditableTask.fromTask(task, [task]);
        editableTask.status = status;
        editableTask.doneDate = doneDate;
        editableTask.cancelledDate = cancelledDate;
        return editableTask;
    }

    it('should accept a Done date when the status type is DONE', () => {
        const { doneDateError, areDatesValid } = editableTaskWith({
            status: Status.DONE,
            doneDate: '2024-04-20',
        }).parseAndValidateDates();

        expect(doneDateError).toBeNull();
        expect(areDatesValid).toEqual(true);
    });

    it('should accept a Cancelled date when the status type is CANCELLED', () => {
        const { cancelledDateError, areDatesValid } = editableTaskWith({
            status: Status.CANCELLED,
            cancelledDate: '2024-04-21',
        }).parseAndValidateDates();

        expect(cancelledDateError).toBeNull();
        expect(areDatesValid).toEqual(true);
    });

    it.each([
        ['TODO', Status.TODO],
        ['IN_PROGRESS', Status.IN_PROGRESS],
        ['ON_HOLD', Status.ON_HOLD],
        ['NON_TASK', Status.NON_TASK],
        ['CANCELLED', Status.CANCELLED],
    ])('should reject a Done date when the status type is %s', (_name, status) => {
        const { doneDateError, areDatesValid } = editableTaskWith({
            status,
            doneDate: '2024-04-20',
        }).parseAndValidateDates();

        expect(doneDateError).not.toBeNull();
        expect(areDatesValid).toEqual(false);
    });

    it.each([
        ['TODO', Status.TODO],
        ['IN_PROGRESS', Status.IN_PROGRESS],
        ['ON_HOLD', Status.ON_HOLD],
        ['NON_TASK', Status.NON_TASK],
        ['DONE', Status.DONE],
    ])('should reject a Cancelled date when the status type is %s', (_name, status) => {
        const { cancelledDateError, areDatesValid } = editableTaskWith({
            status,
            cancelledDate: '2024-04-21',
        }).parseAndValidateDates();

        expect(cancelledDateError).not.toBeNull();
        expect(areDatesValid).toEqual(false);
    });

    it('should reject both dates on a task that is neither done nor cancelled', () => {
        // The original report: a task saved as not-started, cancelled and done at once.
        const { doneDateError, cancelledDateError, areDatesValid } = editableTaskWith({
            status: Status.TODO,
            doneDate: '2024-04-20',
            cancelledDate: '2024-04-21',
        }).parseAndValidateDates();

        expect(doneDateError).not.toBeNull();
        expect(cancelledDateError).not.toBeNull();
        expect(areDatesValid).toEqual(false);
    });

    it('should report the status mismatch, not the parse error, for an unparseable date on the wrong status', () => {
        // Raised in review: with a TODO status and an unparseable Done date, telling the
        // user to fix the date is the wrong advice — there should be no Done date at all
        // for this status, so that error has to take precedence.
        const { doneDateError } = editableTaskWith({
            status: Status.TODO,
            doneDate: 'not a date',
        }).parseAndValidateDates();

        expect(doneDateError).not.toBeNull();
        expect(doneDateError).not.toMatch(/invalid/i);
    });

    it('should accept a task with no Done or Cancelled date at all', () => {
        const { doneDateError, cancelledDateError, areDatesValid } = editableTaskWith({
            status: Status.TODO,
        }).parseAndValidateDates();

        expect(doneDateError).toBeNull();
        expect(cancelledDateError).toBeNull();
        expect(areDatesValid).toEqual(true);
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
