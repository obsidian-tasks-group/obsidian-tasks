/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import type { Task } from '../../../../src/Task/Task';
import { SampleTasks } from '../../../TestingTools/SampleTasks';
import {
    type CustomPropertyDocsTestData,
    type QueryInstructionLineAndDescription,
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from '../VerifyFunctionFieldSamples';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-05-31 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

// NEW_QUERY_INSTRUCTION_EDIT_REQUIRED

describe('dependencies', () => {
    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // DEPENDENCIES FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.id',
            [
                [
                    'group by function task.id',
                    'Group by task Ids, if any.',
                    'Note that currently there is no way to access any tasks that are blocked by these Ids.',
                ],
            ],
            SampleTasks.withAllRepresentativeDependencyFields(),
        ],

        [
            'task.dependsOn',
            [
                [
                    'group by function task.dependsOn',
                    'Group by the Ids of the tasks that each task depends on, if any',
                    'If a task depends on more than one other task, it will be listed multiple times.',
                    'Note that currently there is no way to access the tasks being depended on',
                ],
            ],
            SampleTasks.withAllRepresentativeDependencyFields(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});

describe('dates', () => {
    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // DATE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.cancelled',
            [
                [
                    'group by function task.cancelled.format("YYYY-MM-DD dddd")',
                    'Like "group by cancelled", except it uses an empty string instead of "No cancelled date" if there is no cancelled date',
                ],
            ],
            SampleTasks.withAllRepresentativeCancelledDates(),
        ],

        [
            'task.created',
            [
                [
                    'group by function task.created.format("YYYY-MM-DD dddd")',
                    'Like "group by created", except it uses an empty string instead of "No created date" if there is no created date',
                ],
            ],
            SampleTasks.withAllRepresentativeCreatedDates(),
        ],

        [
            'task.done',
            [
                [
                    'group by function task.done.format("YYYY-MM-DD dddd")',
                    'Like "group by done", except it uses an empty string instead of "No done date" if there is no done date',
                ],
            ],
            SampleTasks.withAllRepresentativeDoneDates(),
        ],

        [
            'task.due',
            [
                [
                    'group by function task.due.category.groupText',
                    'Group task due dates in to 5 broad categories: `Invalid date`, `Overdue`, `Today`, `Future` and `Undated`, displayed in that order.',
                    'Try this on a line before `group by due` if there are a lot of due date headings, and you would like them to be broken down in to some kind of structure.',
                    'The values `task.due.category.name` and `task.due.category.sortOrder` are also available.',
                ],
                [
                    'group by function task.due.fromNow.groupText',
                    'Group by the [time from now](https://momentjs.com/docs/#/displaying/fromnow/), for example `8 days ago`, `in 11 hours`.',
                    'It users an empty string (so no heading) if there is no due date.',
                    'The values `task.due.fromNow.name` and `task.due.fromNow.sortOrder` are also available.',
                ],
                [
                    'group by function task.due.format("YYYY-MM-DD dddd")',
                    'Like "group by due", except it uses no heading, instead of a heading "No due date", if there is no due date',
                ],
                [
                    'group by function task.due.formatAsDate()',
                    'Format date as YYYY-MM-DD or empty string (so no heading) if there is no due date',
                ],
                [
                    'group by function task.due.formatAsDateAndTime()',
                    'Format date as YYYY-MM-DD HH:mm or empty string if no due date.',
                    'Note:',
                    '    This is shown for demonstration purposes.',
                    '    Currently the Tasks plugin does not support storing of times.',
                    '    Do not add times to your tasks, as it will break the reading of task data',
                ],
                [
                    'group by function task.due.format("YYYY[%%]-MM[%%] MMM", "no due date")',
                    'Group by month, for example `2023%%-05%% May` ...',
                    '    ... which gets rendered by Obsidian as `2023 May`.',
                    'Or show a default heading "no due date" if no date.',
                    'The hidden month number is added, commented-out between two `%%` strings, to control the sort order of headings.',
                    'To escape characters in format strings, you can wrap the characters in square brackets (here, `[%%]`)',
                ],
                [
                    'group by function task.due.format("YYYY[%%]-MM[%%] MMM [- Week] WW")',
                    'Group by month and week number, for example `2023%%-05%% May - Week 22` ...',
                    '    ... which gets rendered by Obsidian as `2023 May - Week 22`.',
                    'If the month number is not embedded, in some years the first or last week of the year is displayed in a non-logical order.',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.due.advanced',
            [
                [
                    'group by function task.due.format("dddd")',
                    'Group by day of the week (Monday, Tuesday, etc).',
                    'The day names are sorted alphabetically',
                ],
                [
                    'group by function task.due.format("[%%]d[%%]dddd")',
                    'Group by day of the week (Sunday, Monday, Tuesday, etc).',
                    'The day names are sorted in date order, starting with Sunday',
                ],
                [
                    `group by function                                   \\
    const date = task.due;                          \\
    if (!date.moment) {                             \\
        return "Undated";                           \\
    }                                               \\
    if (date.moment.day() === 0) {                  \\
        {{! Put the Sunday group last: }}           \\
        return date.format("[%%][8][%%]dddd");      \\
    }                                               \\
    return date.format("[%%]d[%%]dddd");`,
                    'Group by day of the week (Monday, Tuesday, etc).',
                    'The day names are sorted in date order, starting with Monday.',
                    'Tasks without due dates are displayed at the end, under a heading "Undated".',
                    'The key technique is to say that if the day is Sunday (`0`), then force it to be displayed as date number `8`, so it comes after the other days of the week',
                    'To add comments, we can use `{{! ... }}`',
                    'To make the expression more readable, we put a `\\` at the end of several lines, to continue the expression on the next line.',
                ],
                [
                    `group by function \\
    const date = task.due.moment; \\
    return \\
        (!date)                           ? '%%4%% Undated' :      \\
        !date.isValid()                   ? '%%0%% Invalid date' : \\
        date.isBefore(moment(), 'day')    ? '%%1%% Overdue' :      \\
        date.isSame(moment(), 'day')      ? '%%2%% Today'   :      \\
        '%%3%% Future';`,
                    'This gives exactly the same output as `group by function task.due.category.groupText`, and is shown here in case you want to customise the behaviour in some way',
                    'Group task due dates in to 5 broad categories: `Invalid date`, `Overdue`, `Today`, `Future` and `Undated`, displayed in that order.',
                    'Try this on a line before `group by due` if there are a lot of due date headings, and you would like them to be broken down in to some kind of structure.',
                    'Note that because we use variables to avoid repetition of values, we need to add `return`',
                ],
                [
                    `group by function \\
    const date = task.due.moment; \\
    return \\
        (!date)                           ? '%%4%% ==Undated==' :      \\
        !date.isValid()                   ? '%%0%% ==Invalid date==' : \\
        date.isBefore(moment(), 'day')    ? '%%1%% ==Overdue==' :      \\
        date.isSame(moment(), 'day')      ? '%%2%% ==Today=='   :      \\
        '%%3%% ==Future==';`,
                    'As above, but the headings `Invalid date`, `Overdue`, `Today`, `Future` and `Undated` are highlighted.',
                    'See the sample screenshot below',
                ],
                [
                    `group by function \\
    const date = task.due.moment; \\
    const now = moment(); \\
    const label = (order, name) => \`%%\${order}%% ==\${name}==\`; \\
    if (!date)                      return label(4, 'Undated'); \\
    if (!date.isValid())            return label(0, 'Invalid date'); \\
    if (date.isBefore(now, 'day'))  return label(1, 'Overdue'); \\
    if (date.isSame(now, 'day'))    return label(2, 'Today'); \\
    return label(3, 'Future');`,
                    'As above, but using a local function, and `if` statements',
                ],
                [
                    `group by function \\
    const date = task.due.moment; \\
    const tomorrow  = moment().add(1,'days'); \\
    const now = moment(); \\
    const label = (order, name) => \`%%\${order}%% ==\${name}==\`; \\
    if (!date)                           return label(5, 'Undated'); \\
    if (!date.isValid())                 return label(0, 'Invalid date'); \\
    if (date.isBefore(now, 'day'))       return label(1, 'Overdue'); \\
    if (date.isSame(now, 'day'))         return label(2, 'Today'); \\
    if (date.isSame(tomorrow, 'day'))    return label(3, 'Tomorrow'); \\
    return label(4, 'Future');`,
                    'As above, but adds a heading for Tomorrow',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.happens',
            [
                [
                    'group by function task.happens.format("YYYY-MM-DD dddd")',
                    'Like "group by happens", except it uses an empty string instead of "No happens date" if there is no happens date',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.scheduled',
            [
                [
                    'group by function task.scheduled.format("YYYY-MM-DD dddd")',
                    'Like "group by scheduled", except it uses an empty string instead of "No scheduled date" if there is no scheduled date',
                ],
            ],
            SampleTasks.withAllRepresentativeScheduledDates(),
        ],

        [
            'task.start',
            [
                [
                    'group by function task.start.format("YYYY-MM-DD dddd")',
                    'Like "group by start", except it uses an empty string instead of "No start date" if there is no start date',
                ],
            ],
            SampleTasks.withAllRepresentativeStartDates(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});

describe('file properties', () => {
    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // FILE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.file.path',
            [
                // comment to force line break
                ['group by function task.file.path', "Like 'group by path' but includes the file extension"],
                [
                    "group by function task.file.path.replace(query.file.folder, '')",
                    "Group by the task's file path, but remove the query's folder from the group.",
                    "For tasks in the query's folder or a sub-folder, this is a nice way of seeing shortened paths.",
                    "This is provided to give ideas: it's a bit of a lazy implementation, as it doesn't check that `query.file.folder` is at the start of the line.",
                ],
            ],
            SampleTasks.withAllRootsPathsHeadings(),
        ],

        [
            'task.file.root',
            [
                // comment to force line break
                ['group by function task.file.root', "Same as 'group by root'"],
            ],
            SampleTasks.withAllRootsPathsHeadings(),
        ],

        [
            'task.file.folder',
            [
                // comment to force line break
                ['group by function task.file.folder', "Same as 'group by folder'"],
                [
                    "group by function task.file.folder.slice(0, -1).split('/').pop() + '/'",
                    'Group by the immediate parent folder of the file containing task.',
                    "Here's how it works:",
                    "    '.slice(0, -1)' removes the trailing slash ('/') from the original folder.",
                    "    '.split('/')' divides the remaining path up in to an array of folder names.",
                    "    '.pop()' returns the last folder name, that is, the parent of the file containing the task.",
                    '    Then the trailing slash is added back, to ensure we do not get an empty string for files in the top level of the vault',
                ],
            ],
            SampleTasks.withAllRootsPathsHeadings(),
        ],

        [
            'task.file.filename',
            [
                ['group by function task.file.filename', "Like 'group by filename' but does not link to the file"],
                [
                    "group by function task.file.filenameWithoutExtension + (task.hasHeading ? (' > ' + task.heading) : '')",
                    "Like 'group by backlink' but does not link to the heading in the file",
                ],
            ],
            SampleTasks.withAllRootsPathsHeadings(),
        ],

        [
            'task.heading',
            [
                [
                    "group by function (task.heading + '.md' === task.file.filename) ? '' : task.heading",
                    'Group by heading, but only if the heading differs from the file name.',
                    "This works well immediately after a 'group by filename' line.",
                    "Note the three equals signs '===': these are important for safety in JavaScript",
                ],
            ],
            SampleTasks.withAllRootsPathsHeadings(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});

describe('statuses', () => {
    const testData: CustomPropertyDocsTestData[] = [
        [
            'task.status.name',
            [
                ['group by function task.status.name', 'Identical to "group by status.name"'],
                ['group by function task.status.name.toUpperCase()', 'Convert the status names to capitals'],
            ],
            SampleTasks.withAllStatuses(),
        ],

        [
            'task.status.nextSymbol',
            [
                [
                    'group by function "Next status symbol: " + task.status.nextSymbol.replace(" ", "space")',
                    'Group by the next status symbol, making space characters visible',
                ],
            ],
            SampleTasks.withAllStatuses(),
        ],

        [
            'task.status.symbol',
            [
                [
                    'group by function "Status symbol: " + task.status.symbol.replace(" ", "space")',
                    'Group by the status symbol, making space characters visible',
                ],
            ],
            SampleTasks.withAllStatuses(),
        ],

        [
            'task.status.type',
            [
                [
                    'group by function task.status.type',
                    'Unlike "group by status.type", this sorts the status types in alphabetical order',
                ],
                [
                    'group by function task.status.typeGroupText',
                    'This sorts the status types in the same order as "group by status.type"',
                ],
            ],
            SampleTasks.withAllStatuses(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});

describe('other properties', () => {
    const testData: CustomPropertyDocsTestData[] = [
        // ---------------------------------------------------------------------------------
        // RECURRENCE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.isRecurring',
            [
                [
                    'group by function task.isRecurring ? "Recurring" : "Non-Recurring"',
                    "Use JavaScript's ternary operator to choose what to do for true (after the ?) and false (after the :) values",
                ],
            ],
            SampleTasks.withAllRecurrences(),
        ],

        [
            'task.recurrenceRule',
            [
                [
                    "group by function task.recurrenceRule.replace('when done', '==when done==')",
                    'Group by recurrence rule, highlighting any occurrences of the words "when done"',
                ],
            ],
            SampleTasks.withAllRecurrences(),
        ],

        // ---------------------------------------------------------------------------------
        // OTHER FIELDS
        // ---------------------------------------------------------------------------------
        [
            'task.blockLink',
            [
                [
                    "group by function task.blockLink.replace(' ^', '')",
                    'DO NOT RELEASE UNTIL THE LEADING SPACE IS REMOVED FROM BLOCKLINKS. Removing the leading space and carat prevents the rendered heading itself being treated as a blocklink.',
                ],
            ],
            SampleTasks.withAllRepresentativeBlockLinks(),
        ],

        [
            'task.description',
            [
                [
                    'group by function task.description',
                    'group by description.',
                    'This might be useful for finding completed recurrences of the same task',
                ],
                ['group by function task.description.toUpperCase()', 'Convert the description to capitals'],
                [
                    'group by function task.description.slice(0, 25)',
                    'Truncate descriptions to at most their first 25 characters, and group by that string',
                ],
                [
                    "group by function task.description.replace('short', '==short==')",
                    'Highlight the word "short" in any group descriptions',
                ],
            ],
            SampleTasks.withAllRepresentativeDescriptions().concat(SampleTasks.withRepresentativeTags()),
        ],

        [
            'task.descriptionWithoutTags',
            [
                [
                    'group by function task.descriptionWithoutTags',
                    'Like `group by description`, but it removes any tags from the group headings.',
                    'This might be useful for finding completed recurrences of the same task, even if the tags differ in some recurrences',
                ],
            ],
            SampleTasks.withAllRepresentativeDescriptions().concat(SampleTasks.withRepresentativeTags()),
        ],

        // [
        //     'task.indentation',
        //     [['group by function task.indentation', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.indentation'
        // ],

        [
            'task.isDone',
            [
                [
                    'group by function task.isDone ? "Action Required" : "Nothing To Do"',
                    "Use JavaScript's ternary operator to choose what to do for true (after the ?) and false (after the :) values",
                ],
            ],
            SampleTasks.withAllStatuses(),
        ],

        // [
        //     'task.listMarker',
        //     [['group by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        [
            'task.priorityName',
            [
                [
                    'group by function task.priorityName',
                    "Group by the task's priority name",
                    'The priority names are displayed in alphabetical order.',
                    "Note that the default priority is called 'Normal', as opposed to with `group by priority` which calls the default 'None'",
                ],
                [
                    'group by function task.priorityNameGroupText',
                    "Group by the task's priority name",
                    'The priority names are displayed from highest to lowest priority.',
                    "Note that the default priority is called 'Normal', as opposed to with `group by priority` which calls the default 'None'",
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],

        [
            'task.priorityNumber',
            [
                [
                    'group by function task.priorityNumber',
                    "Group by the task's priority number, where Highest is 0 and Lowest is 5",
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],

        [
            'task.tags',
            [
                [
                    'group by function task.tags',
                    'Like "group by tags" except that tasks with no tags have no heading instead of "(No tags)"',
                ],
                [
                    'group by function task.tags.join(", ")',
                    'Tasks with multiple tags are listed once, with a heading that combines all the tags.',
                    'Separating with commas means the tags are clickable in the headings',
                ],
                [
                    'group by function task.tags.sort().join(", ")',
                    'As above, but sorting the tags first ensures that the final headings are independent of order of tags in the tasks',
                ],
                [
                    'group by function task.tags.filter( (tag) => tag.includes("#context/") )',
                    'Only create headings for tags that contain "#context/"',
                ],
                [
                    'group by function task.tags.filter( (tag) => ! tag.includes("#tag") )',
                    'Create headings for all tags that do not contain "#tag"',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        [
            'task.tags.advanced',
            [
                // These 4 examples are a different, simpler approach to the reply in https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1677:
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[0].replace('#', '') )",
                    '`#tag/subtag/sub-sub-tag` gives **`tag`**',
                ],
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[1] ? tag.split('/').slice(1, 2) : '')",
                    '`#tag/subtag/sub-sub-tag` gives **`subtag`**',
                ],
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[2] ? tag.split('/').slice(2, 3) : '')",
                    '`#tag/subtag/sub-sub-tag` gives **`sub-sub-tag`**',
                ],
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[3] ? tag.split('/').slice(3, 4) : '')",
                    '`#tag/subtag/sub-sub-tag` gives no heading, as there is no value at the 4th level',
                ],

                // These 4 examples came from https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1677:
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[0] )",
                    '`#tag/subtag/sub-sub-tag` gives **`#tag`**',
                ],
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[1] ? tag.split('/').slice(0, 2).join('/') : '')",
                    '`#tag/subtag/sub-sub-tag` gives **`#tag/subtag`**',
                ],
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[2] ? tag.split('/').slice(0, 3).join('/') : '')",
                    '`#tag/subtag/sub-sub-tag` gives **`#tag/subtag/sub-sub-tag`**',
                ],
                [
                    "group by function task.tags.map( (tag) => tag.split('/')[3] ? tag.split('/').slice(0, 4).join('/') : '')",
                    '`#tag/subtag/sub-sub-tag` gives no heading, as there is no value at the 4th level',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        [
            'task.originalMarkdown',
            [
                [
                    "group by function '``' + task.originalMarkdown + '``'",
                    "Group by the raw text of the task's original line in the MarkDown file as code.",
                    "Note the pairs of backtick characters ('`'), to preserve even single backtick characters in the task line.",
                    "It's important to prevent the task checkbox (for example, '[ ]') from being rendered in the heading, as it gets very confusing if there are checkboxes on both headings and tasks",
                ],
                [
                    "group by function task.originalMarkdown.replace(/^[^\\[\\]]+\\[.\\] */, '')",
                    'An alternative to formatting the markdown line as code is to remove everything up to the end of the checkbox.',
                    'Then render the rest of the task line as normal markdown',
                ],
            ],
            SampleTasks.withRepresentativeTags(),
        ],

        [
            'task.urgency',
            [
                [
                    'group by function task.urgency.toFixed(3)',
                    'Show the urgency to 3 decimal places, unlike the built-in "group by urgency" which uses 2',
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});

describe('special cases', () => {
    const testData: CustomPropertyDocsTestData[] = [
        [
            'formatting',
            [
                [
                    'group by function task.due.format("YYYY %%MM%% MMMM [<mark style=\'background: var(--color-base-00); color: var(--color-base-40)\'>- Week</mark>] WW", "Undated")',
                    'Show Year then Month, and then week number. Draw the fixed text paler, to de-emphasize it.',
                ],
                [
                    'group by function task.due.format("[%%]YYYY-MM-DD[%%]dddd [<mark style=\'background: var(--color-base-00); color: var(--color-base-40);\'>](YYYY-MM-DD)[</mark>]")',
                    'Show the day of the week, then the date in paler text',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        // idea: folder: show stripping out the folder containing the query file - may need to escape forward slashes if using regular expression
    ];

    it.each(testData)('%s results', (_: string, groups: QueryInstructionLineAndDescription[], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: QueryInstructionLineAndDescription[], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});
