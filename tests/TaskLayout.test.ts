/**
 * @jest-environment jsdom
 */

import { TaskLayoutOptions } from '../src/Layout/TaskLayoutOptions';
import { QueryLayoutOptions } from '../src/QueryLayoutOptions';
import { TaskLayout } from '../src/TaskLayout';

describe('TaskLayout tests', () => {
    it('should generate expected CSS classes for default layout', () => {
        const taskLayout = new TaskLayout();
        expect(taskLayout.taskListHiddenClasses().join('\n')).toMatchInlineSnapshot('"tasks-layout-hide-urgency"');
    });

    it('should generate expected CSS classes with all default options reversed', () => {
        const taskLayoutOptions = new TaskLayoutOptions();
        taskLayoutOptions.toggleVisibilityExceptDescriptionAndBlockLink();

        const queryLayoutOptions = new QueryLayoutOptions();
        // Negate all the query layout boolean values:
        Object.keys(queryLayoutOptions).forEach((key) => {
            const key2 = key as keyof QueryLayoutOptions;
            queryLayoutOptions[key2] = !queryLayoutOptions[key2];
        });

        const taskLayout = new TaskLayout(taskLayoutOptions, queryLayoutOptions);

        expect(taskLayout.taskListHiddenClasses().join('\n')).toMatchInlineSnapshot(`
            "tasks-layout-hide-priority
            tasks-layout-hide-recurrenceRule
            tasks-layout-hide-createdDate
            tasks-layout-hide-startDate
            tasks-layout-hide-scheduledDate
            tasks-layout-hide-dueDate
            tasks-layout-hide-cancelledDate
            tasks-layout-hide-doneDate
            tasks-layout-hide-tags
            tasks-layout-hide-backlinks
            tasks-layout-hide-edit-button
            tasks-layout-hide-postpone-button
            tasks-layout-short-mode"
        `);
    });
});
