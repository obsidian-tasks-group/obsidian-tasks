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
        layoutOptions.hideTaskCount = !layoutOptions.hideTaskCount;
        layoutOptions.hideBacklinks = !layoutOptions.hideBacklinks;
        layoutOptions.hidePriority = !layoutOptions.hidePriority;
        layoutOptions.hideCreatedDate = !layoutOptions.hideCreatedDate;
        layoutOptions.hideStartDate = !layoutOptions.hideStartDate;
        layoutOptions.hideScheduledDate = !layoutOptions.hideScheduledDate;
        layoutOptions.hideDoneDate = !layoutOptions.hideDoneDate;
        layoutOptions.hideDueDate = !layoutOptions.hideDueDate;
        layoutOptions.hideRecurrenceRule = !layoutOptions.hideRecurrenceRule;
        layoutOptions.hideEditButton = !layoutOptions.hideEditButton;
        layoutOptions.hideUrgency = !layoutOptions.hideUrgency;
        layoutOptions.hideTags = !layoutOptions.hideTags;
        layoutOptions.shortMode = !layoutOptions.shortMode;
        layoutOptions.explainQuery = !layoutOptions.explainQuery;

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
