import { Priority, Task } from '../src/Task';
import { TaskLocation } from '../src/TaskLocation';
import { PriorityTools } from '../src/lib/PriorityTools';
import { Status } from '../src/Status';
import { StatusType } from '../src/StatusConfiguration';
import { Recurrence } from '../src/Recurrence';
import { TaskBuilder } from './TestingTools/TaskBuilder';

export function fromLine({
    line,
    path = '',
    precedingHeader = null,
}: {
    line: string;
    path?: string;
    precedingHeader?: string | null;
}) {
    return Task.fromLine({
        line,
        taskLocation: new TaskLocation(path, 0, 0, 0, precedingHeader),
        fallbackDate: null,
    })!;
}

export function fromLines({
    lines,
    path = '',
    precedingHeader = null,
}: {
    lines: string[];
    path?: string;
    precedingHeader?: string | null;
}): Task[] {
    return lines.map((line) => fromLine({ line, path, precedingHeader }));
}

export function createTasksFromMarkdown(tasksAsMarkdown: string, path: string, precedingHeader: string): Task[] {
    const taskLines = tasksAsMarkdown.split('\n');
    const tasks: Task[] = [];
    for (const line of taskLines) {
        const task = Task.fromLine({
            line: line,
            taskLocation: new TaskLocation(path, 0, 0, 0, precedingHeader),
            fallbackDate: null,
        });
        if (task) {
            tasks.push(task);
        }
    }
    return tasks;
}

const representativeDates = ['2023-05-30', '2023-05-31', '2023-06-01', '2023-02-32', null];

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
            return fromLine({ line: t + ' in ' + path, path: path, precedingHeader: heading });
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

    public static withAllStatuses(): Task[] {
        const statuses = [
            Status.makeCancelled(),
            Status.makeDone(),
            Status.makeEmpty(),
            Status.makeInProgress(),
            Status.makeTodo(),
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

    public static withAllRepresentativeBlockLinks(): Task[] {
        const descriptions = ['', ' ^ca47c7', ' ^fromseparatefile'];
        return descriptions.map((blockLink) => {
            return new TaskBuilder().blockLink(blockLink).build();
        });
    }
}
