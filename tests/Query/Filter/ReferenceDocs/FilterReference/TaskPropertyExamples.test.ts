import type { Task } from '../../../../../src/Task';
import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by', () => {
    type CustomGroupingPropertyTestData = [string, string[][], Task[]];
    const testData: CustomGroupingPropertyTestData[] = [
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
