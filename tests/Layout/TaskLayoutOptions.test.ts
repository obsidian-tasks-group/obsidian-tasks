import { TaskLayoutOptions } from '../../src/Layout/TaskLayoutOptions';

describe('TaskLayoutOptions', () => {
    it('should be constructable', () => {
        const options = new TaskLayoutOptions();
        expect(options).not.toBeNull();

        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            id
            blockedBy
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

        expect(options.isShown('priority')).toEqual(true);
        expect(options.isShown('createdDate')).toEqual(true);
    });

    it('should be able to hide a field', () => {
        const options = new TaskLayoutOptions();
        options.hide('createdDate');

        expect(options.isShown('createdDate')).toEqual(false);
    });

    it('should be settable via a boolean', () => {
        const options = new TaskLayoutOptions();

        options.setVisibility('scheduledDate', false);
        expect(options.isShown('scheduledDate')).toEqual(false);

        options.setVisibility('scheduledDate', true);
        expect(options.isShown('scheduledDate')).toEqual(true);
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
            blockedBy
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

        options.setVisibility('dueDate', false);
        options.setVisibility('blockLink', false);

        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
            "description
            id
            blockedBy
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

        options.setVisibility('startDate', false);
        options.setVisibility('doneDate', false);

        expect(options.hiddenComponents.join('\n')).toMatchInlineSnapshot(`
            "startDate
            doneDate"
        `);
    });

    it('should toggle visibility', () => {
        const options = new TaskLayoutOptions();

        options.setVisibility('cancelledDate', false);
        options.setVisibility('priority', true);
        options.setTagsVisibility(true);

        options.toggleVisibilityExceptDescriptionAndBlockLink();

        expect(options.isShown('cancelledDate')).toEqual(true);
        expect(options.isShown('priority')).toEqual(false);
        expect(options.areTagsShown()).toEqual(false);
    });

    it('should not toggle visibility of description and blockLink', () => {
        const options = new TaskLayoutOptions();
        options.setVisibility('description', true);
        options.setVisibility('blockLink', true);

        options.toggleVisibilityExceptDescriptionAndBlockLink();

        expect(options.isShown('description')).toEqual(true);
        expect(options.isShown('blockLink')).toEqual(true);
    });

    it('should provide toggleable components', () => {
        const options = new TaskLayoutOptions();

        expect(options.toggleableComponents.join('\n')).toMatchInlineSnapshot(`
            "id
            blockedBy
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
