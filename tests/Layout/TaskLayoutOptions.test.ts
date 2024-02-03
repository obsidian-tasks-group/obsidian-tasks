import { TaskLayoutComponent, TaskLayoutOptions } from '../../src/Layout/TaskLayoutOptions';

describe('TaskLayoutOptions', () => {
    it('should be constructable', () => {
        const options = new TaskLayoutOptions();
        expect(options).not.toBeNull();

        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            id
            dependsOn
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

        expect(options.areTagsShown()).toEqual(true);
    });

    it('should show fields by default', () => {
        const options = new TaskLayoutOptions();

        expect(options.isShown(TaskLayoutComponent.Priority)).toEqual(true);
        expect(options.isShown(TaskLayoutComponent.CreatedDate)).toEqual(true);
    });

    it('should be able to hide a field', () => {
        const options = new TaskLayoutOptions();
        options.hide(TaskLayoutComponent.CreatedDate);

        expect(options.isShown(TaskLayoutComponent.CreatedDate)).toEqual(false);
    });

    it('should be settable via a boolean', () => {
        const options = new TaskLayoutOptions();

        options.setVisibility(TaskLayoutComponent.ScheduledDate, false);
        expect(options.isShown(TaskLayoutComponent.ScheduledDate)).toEqual(false);

        options.setVisibility(TaskLayoutComponent.ScheduledDate, true);
        expect(options.isShown(TaskLayoutComponent.ScheduledDate)).toEqual(true);
    });

    it('should set tag visibility', () => {
        const options = new TaskLayoutOptions();
        expect(options.areTagsShown()).toEqual(true);

        options.setTagsVisibility(false);
        expect(options.areTagsShown()).toEqual(false);

        options.setTagsVisibility(true);
        expect(options.areTagsShown()).toEqual(true);
    });

    it('should provide a list of shown components', () => {
        const options = new TaskLayoutOptions();
        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            id
            dependsOn
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

        options.setVisibility(TaskLayoutComponent.DueDate, false);
        options.setVisibility(TaskLayoutComponent.BlockLink, false);

        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            id
            dependsOn
            priority
            recurrenceRule
            createdDate
            startDate
            scheduledDate
            cancelledDate
            doneDate"
        `);
    });

    it('should provide a list of hidden components', () => {
        const options = new TaskLayoutOptions();
        expect(options.hiddenComponents.join('\n')).toMatchInlineSnapshot('""');

        options.setVisibility(TaskLayoutComponent.StartDate, false);
        options.setVisibility(TaskLayoutComponent.DoneDate, false);

        expect(options.hiddenComponents.join('\n')).toMatchInlineSnapshot(`
            "startDate
            doneDate"
        `);
    });

    it('should toggle visibility', () => {
        const options = new TaskLayoutOptions();

        options.setVisibility(TaskLayoutComponent.CancelledDate, false);
        options.setVisibility(TaskLayoutComponent.Priority, true);
        options.setTagsVisibility(true);

        options.toggleVisibilityExceptDescriptionAndBlockLink();

        expect(options.isShown(TaskLayoutComponent.CancelledDate)).toEqual(true);
        expect(options.isShown(TaskLayoutComponent.Priority)).toEqual(false);
        expect(options.areTagsShown()).toEqual(false);
    });

    it('should not toggle visibility of description and blockLink', () => {
        const options = new TaskLayoutOptions();
        options.setVisibility(TaskLayoutComponent.Description, true);
        options.setVisibility(TaskLayoutComponent.BlockLink, true);

        options.toggleVisibilityExceptDescriptionAndBlockLink();

        expect(options.isShown(TaskLayoutComponent.Description)).toEqual(true);
        expect(options.isShown(TaskLayoutComponent.BlockLink)).toEqual(true);
    });

    it('should provide toggleable components', () => {
        const options = new TaskLayoutOptions();

        expect(options.toggleableComponents.join('\n')).toMatchInlineSnapshot(`
            "id
            dependsOn
            priority
            recurrenceRule
            createdDate
            startDate
            scheduledDate
            dueDate
            cancelledDate
            doneDate"
        `);
    });
});
