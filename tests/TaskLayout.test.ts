/**
 * @jest-environment jsdom
 */

import { QueryLayoutOptions } from '../src/QueryLayoutOptions';
import { TaskLayout, type TaskLayoutComponent, TaskLayoutOptions, defaultLayout } from '../src/TaskLayout';

describe('TaskLayout tests', () => {
    it('should generate expected CSS components for default layout', () => {
        const taskLayout = new TaskLayout();
        expect(taskLayout.shownTaskLayoutComponents().join('\n')).toMatchInlineSnapshot(`
            "description
            priority
            recurrenceRule
            createdDate
            startDate
            scheduledDate
            dueDate
            cancelledDate
            doneDate
            blockLink"
        `);
        expect(taskLayout.hiddenTaskLayoutComponents().join('\n')).toMatchInlineSnapshot('""');
        expect(taskLayout.taskListHiddenClasses().join('\n')).toMatchInlineSnapshot('"tasks-layout-hide-urgency"');
    });

    it('should generate expected CSS components with all default option reversed', () => {
        const layoutOptions = new TaskLayoutOptions();
        // Negate all the task layout boolean values:
        Object.keys(layoutOptions).forEach((key) => {
            const key2 = key as keyof TaskLayoutOptions;
            layoutOptions[key2] = !layoutOptions[key2];
        });

        const queryLayoutOptions = new QueryLayoutOptions();
        // Negate all the query layout boolean values:
        Object.keys(queryLayoutOptions).forEach((key) => {
            const key2 = key as keyof QueryLayoutOptions;
            queryLayoutOptions[key2] = !queryLayoutOptions[key2];
        });

        const taskLayout = new TaskLayout(layoutOptions, queryLayoutOptions);

        expect(taskLayout.shownTaskLayoutComponents().join('\n')).toMatchInlineSnapshot(`
            "description
            blockLink"
        `);
        expect(taskLayout.hiddenTaskLayoutComponents().join('\n')).toMatchInlineSnapshot(`
            "priority
            recurrenceRule
            createdDate
            startDate
            scheduledDate
            dueDate
            cancelledDate
            doneDate"
        `);
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

class TaskLayoutOptions2 {
    private visible: { [component: string]: boolean } = {};

    constructor() {
        defaultLayout.forEach((component) => {
            this.visible[component] = true;
        });
    }

    public isShown(component: TaskLayoutComponent) {
        return this.visible[component];
    }

    public hide(component: TaskLayoutComponent) {
        this.visible[component] = false;
    }
}

describe('TaskLayoutOptions2', () => {
    it('should be constructable', () => {
        const options = new TaskLayoutOptions2();
        expect(options).not.toBeNull();
    });

    it('should show fields by default', () => {
        const options = new TaskLayoutOptions2();

        expect(options.isShown('priority')).toEqual(true);
        expect(options.isShown('createdDate')).toEqual(true);
    });

    it('should be able to hide a field', () => {
        const options = new TaskLayoutOptions2();
        options.hide('createdDate');

        expect(options.isShown('createdDate')).toEqual(false);
    });
});
