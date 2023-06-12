/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import type { Task } from '../../../../../src/Task';
import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-10 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('custom grouping by', () => {
    type CustomGroupingPropertyTestData = [string, string[][], Task[]];
    const testData: CustomGroupingPropertyTestData[] = [
        // ---------------------------------------------------------------------------------
        // DATE FIELDS
        // ---------------------------------------------------------------------------------

        [
            'task.created',
            [
                [
                    'group by function task.created.format("YYYY-MM-DD dddd")',
                    'Like "group by task.created", except it uses an empty string instead of "No created date" if there is no created date.',
                ],
            ],
            SampleTasks.withAllRepresentativeCreatedDates(),
        ],

        [
            'task.done',
            [
                [
                    'group by function task.done.format("YYYY-MM-DD dddd")',
                    'Like "group by task.done", except it uses an empty string instead of "No done date" if there is no done date',
                ],
            ],
            SampleTasks.withAllRepresentativeDoneDates(),
        ],

        [
            'task.due',
            [
                [
                    'group by function task.due.format("YYYY-MM-DD dddd")',
                    'Like "group by task.due", except it uses an empty string instead of "No due date" if there is no due date',
                ],
                ['group by function task.due.formatAsDate()', 'Format date as YYYY-MM-DD or empty string if no date'],
                [
                    'group by function task.due.formatAsDateAndTime()',
                    'Format date as YYYY-MM-DD HH:mm or empty string if no date',
                ],
                ['group by function task.due.format("dddd")', 'Group by day of the week (Monday, Tuesday, etc)'],
                [
                    'group by function task.due.format("YYYY MM MMM", "no due date")',
                    'Group by month, for example "2023 05 May". The month number is also displayed, to control the sort order of headings',
                ],
                [
                    'group by function task.due.format("YYYY-MM MMM [- Week] WW", "no  date")',
                    'Group by month and week number, for example "2023-05 May - Week 22", or show a default heading if no date. If the month number is not displayed, in some years the first or last week of the year is displayed in a non-logical order',
                ],
                [
                    'group by function task.due.moment?.fromNow() || ""',
                    'Group by the time from now, for example "8 days ago". Because Moment.fromNow() is not provided by TasksDate, we need special code for when there is no date value. Whilst interesting, the alphabetical sort order makes the headings a little hard to read',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.happens',
            [
                [
                    'group by function task.happens.format("YYYY-MM-DD dddd")',
                    'Like "group by task.happens", except it uses an empty string instead of "No happens date" if there is no happens date',
                ],
            ],
            SampleTasks.withAllRepresentativeDueDates(),
        ],

        [
            'task.scheduled',
            [
                [
                    'group by function task.scheduled.format("YYYY-MM-DD dddd")',
                    'Like "group by task.scheduled", except it uses an empty string instead of "No scheduled date" if there is no scheduled date',
                ],
            ],
            SampleTasks.withAllRepresentativeScheduledDates(),
        ],

        [
            'task.start',
            [
                [
                    'group by function task.start.format("YYYY-MM-DD dddd")',
                    'Like "group by task.start", except it uses an empty string instead of "No start date" if there is no start date',
                ],
            ],
            SampleTasks.withAllRepresentativeStartDates(),
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
                    'group by description. This might be useful for finding completed recurrences of the same task',
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
            SampleTasks.withAllRepresentativeDescriptions(),
        ],

        // [
        //     'task.indentation',
        //     [['group by function task.indentation', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.indentation'
        // ],

        // [
        //     'task.listMarker',
        //     [['group by function task.listMarker', '...']],
        //     SampleTasks.withAllPriorities(), // TODO Choose specific tasks for task.listMarker'
        // ],

        [
            'task.priority',
            [
                [
                    'group by function task.priority',
                    "Group by the task's priority number, where Highest is 0 and Lowest is 5",
                ],
            ],
            SampleTasks.withAllPriorities(),
        ],

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
            ],
            SampleTasks.withAllStatuses(),
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
                    'Tasks with multiple tags are listed once, with a heading that combines all the tags. Separating with commas means the tags are clickable in the headings',
                ],
                [
                    'group by function task.tags.filter( (t) => t.includes("#context/"))',
                    'Only create headings for tags that contain "#context/"',
                ],
                [
                    'group by function task.tags.filter( (t) => ! t.includes("#tag"))',
                    'Create headings for all tags that do not contain "#tag"',
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

        // idea: heading: only show the heading if it differs from the filename (for when I want to group by file and then heading)
        // idea: folder: show only the closest folder name, not the whole tree
        // idea: folder: show stripping out the folder containing the query file - may need to escape forward slashes if using regular expression
    ];

    it.each(testData)('%s results', (_: string, groups: string[][], tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesOnTasks(groups, tasks);
    });

    it.each(testData)('%s docs', (_: string, groups: string[][], _tasks: Task[]) => {
        verifyFunctionFieldGrouperSamplesForDocs(groups);
    });
});
