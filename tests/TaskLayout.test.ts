/**
 * @jest-environment jsdom
 */

import { LayoutOptions, TaskLayout } from '../src/TaskLayout';

describe('TaskLayout tests', () => {
    it('should generate expected CSS components for default layout', () => {
        const taskLayout = new TaskLayout();
        expect(taskLayout.shownTaskLayoutComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            priority
            recurrenceRule
            createdDate
            startDate
            scheduledDate
            dueDate
            doneDate
            blockLink"
        `);
        expect(taskLayout.hiddenTaskLayoutComponents.join('\n')).toMatchInlineSnapshot('""');
        expect(taskLayout.taskListClasses.join('\n')).toMatchInlineSnapshot('"tasks-layout-hide-urgency"');
    });

    it('should generate expected CSS components with all default option reversed', () => {
        const layoutOptions = new LayoutOptions();
        layoutOptions.hideTaskCount = true;
        layoutOptions.hideBacklinks = true;
        layoutOptions.hidePriority = true;
        layoutOptions.hideCreatedDate = true;
        layoutOptions.hideStartDate = true;
        layoutOptions.hideScheduledDate = true;
        layoutOptions.hideDoneDate = true;
        layoutOptions.hideDueDate = true;
        layoutOptions.hideRecurrenceRule = true;
        layoutOptions.hideEditButton = true;
        layoutOptions.hideUrgency = false;
        layoutOptions.hideTags = true;
        layoutOptions.shortMode = true;
        layoutOptions.explainQuery = true;

        const taskLayout = new TaskLayout(layoutOptions);

        expect(taskLayout.shownTaskLayoutComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            blockLink"
        `);
        expect(taskLayout.hiddenTaskLayoutComponents.join('\n')).toMatchInlineSnapshot(`
            "priority
            recurrenceRule
            createdDate
            startDate
            scheduledDate
            dueDate
            doneDate"
        `);
        expect(taskLayout.taskListClasses.join('\n')).toMatchInlineSnapshot(`
            "tasks-layout-hide-priority
            tasks-layout-hide-recurrenceRule
            tasks-layout-hide-createdDate
            tasks-layout-hide-startDate
            tasks-layout-hide-scheduledDate
            tasks-layout-hide-dueDate
            tasks-layout-hide-doneDate
            tasks-layout-hide-tags
            tasks-layout-hide-backlinks
            tasks-layout-hide-edit-button
            tasks-layout-short-mode"
        `);
    });
});
