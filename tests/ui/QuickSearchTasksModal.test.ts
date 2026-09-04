import moment from 'moment';

import { taskSearchMetadataText, taskSearchSuggestionText } from '../../src/Commands/QuickSearchTasks';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Priority } from '../../src/Task/Priority';

window.moment = moment;

describe('Describing matching task', () => {
    it('should provide the description, source file name, and preceding heading for each suggestion', () => {
        expect(
            taskSearchSuggestionText(
                new TaskBuilder()
                    .description('Write release notes')
                    .path('Projects/Release.md')
                    .lineNumber(12)
                    .precedingHeader('Preparation')
                    .build(),
            ),
        ).toEqual({
            description: 'Write release notes',
            source: 'Release.md',
            heading: 'Preparation',
        });
    });

    it('should use a clear fallback when a task has no preceding heading', () => {
        const task = new TaskBuilder().description('Inbox task').path('Inbox.md').precedingHeader(null).build();

        expect(taskSearchSuggestionText(task)).toEqual({
            description: 'Inbox task',
            source: 'Inbox.md',
            heading: 'No heading',
        });
    });

    it('should list due dates before scheduled and start dates in task metadata', () => {
        const task = new TaskBuilder()
            .priority(Priority.High)
            .startDate('2023-07-02')
            .scheduledDate('2023-07-03')
            .dueDate('2023-07-04')
            .build();

        expect(taskSearchMetadataText(task)).toEqual([
            expect.stringContaining('2023-07-04'),
            expect.stringContaining('2023-07-03'),
            expect.stringContaining('2023-07-02'),
            expect.any(String),
        ]);
    });
});
