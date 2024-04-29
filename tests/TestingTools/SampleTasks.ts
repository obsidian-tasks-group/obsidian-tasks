import { Task } from '../../src/Task/Task';
import { Recurrence } from '../../src/Task/Recurrence';
import { Status } from '../../src/Statuses/Status';
import { StatusType } from '../../src/Statuses/StatusConfiguration';
import { Priority } from '../../src/Task/Priority';
import { PriorityTools } from '../../src/lib/PriorityTools';
import { TaskBuilder } from './TaskBuilder';
import { fromLine, fromLines } from './TestHelpers';

const representativeDates = ['2023-05-30', '2023-05-31', '2023-06-01', '2023-06-02', '2023-02-32', null];

export class SampleTasks {
    public static withRepresentativeTags(): Task[] {
        const sampleTags = [
            [],
            ['#tag'],
            ['#tag/subtag'],
            ['#tag/subtag/sub-sub-tag'],
            ['#multiple-tags1', '#multiple-tags2'],
            ['#project/project1'],
            ['#context/home'],
            ['#context/work'],
        ];

        return sampleTags.map((tags) => {
            return new TaskBuilder().tags(tags).build();
        });
    }

    public static withAllRecurrences(): Task[] {
        const recurrenceRules = [
            // Months
            'every 4 months on the 3rd Wednesday',
            'every month',
            'every month on the 2nd',
            'every month on the 2nd when done',

            // Weeks
            'every Tuesday',
            'every Tuesday when done',
            'every week',
            'every 3 weeks on Thursday',
            'every 4 weeks',

            // Days
            'every 6 days',
            'every 8 days',
            'every 8 days when done',
            'every day',
            '',
        ];

        return recurrenceRules.map((recurrenceRule) => {
            return new TaskBuilder()
                .recurrence(
                    Recurrence.fromText({
                        recurrenceRuleText: recurrenceRule,
                        startDate: null,
                        scheduledDate: null,
                        dueDate: null,
                    }),
                )
                .build();
        });
    }

    public static withAllRootsPathsHeadings(): Task[] {
        const allPathsAndHeadings: [string, string | null][] = [
            ['', 'heading'],

            // no heading supplied
            ['a/b.md', null],
            ['a/b/c.md', null],

            // File and heading, nominal case
            ['a/d/c.md', 'heading'],
            ['e/d/c.md', 'heading'],

            // If file name and heading are identical, avoid duplication ('c > c')
            ['a/b/c.md', 'c'],

            // If file name and heading are identical, avoid duplication, even if there are underscores in the file name
            ['a_b_c.md', 'a_b_c'],

            // Underscores in file name component are escaped
            ['a/b/_c_.md', null],

            // But underscores in the heading component are not
            ['a/b/_c_.md', 'heading _italic text_'],
        ];
        const t = '- [ ] xyz';

        return allPathsAndHeadings.map(([path, heading]) => {
            return fromLine({
                line: `${t} in '${path}' in heading '${heading}'`,
                path: path,
                precedingHeader: heading,
            });
        });
    }

    public static withAllRepresentativeCreatedDates(): Task[] {
        return representativeDates.map((date) => {
            return new TaskBuilder().createdDate(date).build();
        });
    }

    public static withAllRepresentativeDoneDates(): Task[] {
        return representativeDates.map((date) => {
            return new TaskBuilder().doneDate(date).build();
        });
    }

    public static withAllRepresentativeDueDates(): Task[] {
        return representativeDates.map((date) => {
            return new TaskBuilder().dueDate(date).build();
        });
    }

    public static withAllRepresentativeScheduledDates(): Task[] {
        return representativeDates.map((date) => {
            return new TaskBuilder().scheduledDate(date).build();
        });
    }

    public static withAllRepresentativeStartDates(): Task[] {
        return representativeDates.map((date) => {
            return new TaskBuilder().startDate(date).build();
        });
    }

    public static withAllRepresentativeCancelledDates(): Task[] {
        return representativeDates.map((date) => {
            return new TaskBuilder().cancelledDate(date).build();
        });
    }

    public static withEachDateTypeAndCorrespondingStatus(): Task[] {
        function desc(fieldName: string) {
            return `#task Has a ${fieldName} date`;
        }

        const taskBuilders = [
            new TaskBuilder().status(Status.makeTodo()).description(desc('created')).createdDate('2023-04-13'),
            new TaskBuilder().status(Status.makeTodo()).description(desc('scheduled')).scheduledDate('2023-04-14'),
            new TaskBuilder().status(Status.makeTodo()).description(desc('start')).startDate('2023-04-15'),
            new TaskBuilder().status(Status.makeTodo()).description(desc('due')).dueDate('2023-04-16'),
            new TaskBuilder().status(Status.makeDone()).description(desc('done')).doneDate('2023-04-17'),
            new TaskBuilder().status(Status.makeCancelled()).description(desc('cancelled')).cancelledDate('2023-04-18'),
        ];
        // If this test fails, a new date format is now supported, and needs to be added to the above list:
        const documentedDateFieldsCount = taskBuilders.length;
        const supportedDateFieldsCount = Task.allDateFields().length;
        expect(documentedDateFieldsCount).toEqual(supportedDateFieldsCount);

        return taskBuilders.map((builder) => builder.build());
    }

    public static withAllStatuses(): Task[] {
        const statuses = [
            Status.makeCancelled(),
            Status.makeDone(),
            Status.makeEmpty(),
            Status.makeInProgress(),
            Status.makeTodo(),
            Status.makeNonTask(),
        ];

        return statuses.map((status) => {
            return new TaskBuilder().status(status).description(`Status ${status.name}`).build();
        });
    }

    public static withAllStatusTypes(): Task[] {
        // Abbreviated names so that the markdown text is aligned
        const todoTask = fromLine({ line: '- [ ] Todo' });
        const inprTask = fromLine({ line: '- [/] In progress' });
        const doneTask = fromLine({ line: '- [x] Done' });
        const cancTask = fromLine({ line: '- [-] Cancelled' });
        const unknTask = fromLine({ line: '- [%] Unknown' });
        const non_Task = new TaskBuilder()
            .statusValues('^', 'non-task', 'x', false, StatusType.NON_TASK)
            .description('Non-task')
            .build();
        const emptTask = new TaskBuilder().status(Status.makeEmpty()).description('Empty task').build();

        return [todoTask, inprTask, doneTask, cancTask, unknTask, non_Task, emptTask];
    }

    public static withAllPriorities(): Task[] {
        const tasks: Task[] = [];
        const allPriorities = Object.values(Priority);
        allPriorities.forEach((priority) => {
            // This description is chosen to be useful for including tasks in user docs, so
            // changing it will change documentation and sample vault content.
            const priorityName = PriorityTools.priorityNameUsingNormal(priority);
            const description = `#task ${priorityName} priority`;

            const task = new TaskBuilder().priority(priority).description(description).build();
            tasks.push(task);
        });
        return tasks;
    }

    public static withAllRepresentativeDescriptions(): Task[] {
        const descriptions = [
            'short description',
            'long description Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quam ipsum, consectetur ut dolor nec, fringilla lobortis mi. Vestibulum gravida tincidunt urna nec ornare. Cras sit amet sagittis sapien, vitae mattis velit. Vestibulum sem tortor, blandit at ultrices eget, ultrices eget odio. Donec efficitur purus massa, vel molestie turpis tincidunt id. ',
        ];
        return descriptions.map((description) => {
            return new TaskBuilder().description(description).build();
        });
    }

    public static withAllRepresentativeDependencyFields(): Task[] {
        const id1 = 'dcf64c';
        const id2 = '0h17ye';
        return [
            new TaskBuilder().description('#task do this first').id(id1).build(),
            new TaskBuilder()
                .description('#task do this after first and some other task')
                .dependsOn([id1, id2])
                .build(),
        ];
    }

    public static withWideSelectionOfDependencyScenarios() {
        const lines = [
            '- [ ] No dependency - TODO',
            '- [x] No dependency - DONE',
            //
            '- [ ] scenario 1 - TODO depends on TODO 🆔 scenario1',
            '- [ ] scenario 1 - TODO depends on TODO ⛔ scenario1',
            //
            '- [x] scenario 2 - TODO depends on DONE 🆔 scenario2',
            '- [ ] scenario 2 - TODO depends on DONE ⛔ scenario2',
            //
            '- [ ] scenario 3 - DONE depends on TODO 🆔 scenario3',
            '- [x] scenario 3 - DONE depends on TODO ⛔ scenario3',
            //
            '- [x] scenario 4 - DONE depends on DONE 🆔 scenario4',
            '- [x] scenario 4 - DONE depends on DONE ⛔ scenario4',
            //
            '- [ ] scenario 5 - TODO depends on non-existing ID ⛔ nosuchid',
            //
            '- [ ] scenario 6 - TODO depends on self 🆔 self ⛔ self',
            //
            '- [x] scenario 7 - task with duplicated id - this is DONE                                  - 🆔 scenario7',
            '- [ ] scenario 7 - task with duplicated id - this is TODO - and is blocking                - 🆔 scenario7',
            '- [ ] scenario 7 - TODO depends on id that is duplicated - ensure all tasks are checked    - ⛔ scenario7',
            //
            '- [ ] scenario 8 - mutually dependant 🆔 scenario8a ⛔ scenario8b',
            '- [ ] scenario 8 - mutually dependant 🆔 scenario8b ⛔ scenario8a',
            //
            '- [ ] scenario 9 - cyclic dependency 🆔 scenario9a ⛔ scenario9c',
            '- [ ] scenario 9 - cyclic dependency 🆔 scenario9b ⛔ scenario9a',
            '- [ ] scenario 9 - cyclic dependency 🆔 scenario9c ⛔ scenario9b',
            //
            '- [ ] scenario 10 - multiple dependencies TODO         - 🆔 scenario10a',
            '- [/] scenario 10 - multiple dependencies IN_PROGRESS  - 🆔 scenario10b',
            '- [x] scenario 10 - multiple dependencies DONE         - 🆔 scenario10c',
            '- [-] scenario 10 - multiple dependencies CANCELLED    - 🆔 scenario10d',
            '- [Q] scenario 10 - multiple dependencies NON_TASK     - 🆔 scenario10e',
            '- [ ] scenario 10 - multiple dependencies              - ⛔ scenario10a,scenario10b,scenario10c,scenario10d,scenario10e',
            //
            '- [ ] scenario 11 - indirect dependency - indirect blocking of scenario11c ignored - 🆔 scenario11a',
            '- [x] scenario 11 - indirect dependency - DONE                                     - 🆔 scenario11b ⛔ scenario11a',
            '- [ ] scenario 11 - indirect dependency - indirect blocking of scenario11a ignored - 🆔 scenario11c ⛔ scenario11b',
        ];
        return fromLines({ lines });
    }

    public static withAllRepresentativeBlockLinks(): Task[] {
        const descriptions = ['', ' ^ca47c7', ' ^fromseparatefile'];
        return descriptions.map((blockLink) => {
            return new TaskBuilder().blockLink(blockLink).build();
        });
    }
}
