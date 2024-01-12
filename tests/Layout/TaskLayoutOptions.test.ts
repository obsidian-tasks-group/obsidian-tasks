import { TaskLayoutOptions2 } from '../../src/Layout/TaskLayoutOptions';

describe('TaskLayoutOptions2', () => {
    it('should be constructable', () => {
        const options = new TaskLayoutOptions2();
        expect(options).not.toBeNull();

        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
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

    it('should be settable via a boolean', () => {
        const options = new TaskLayoutOptions2();

        options.setVisibility('scheduledDate', false);
        expect(options.isShown('scheduledDate')).toEqual(false);

        options.setVisibility('scheduledDate', true);
        expect(options.isShown('scheduledDate')).toEqual(true);
    });

    it('should provide a list of shown components', () => {
        const options = new TaskLayoutOptions2();
        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
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

        options.setVisibility('dueDate', false);
        options.setVisibility('blockLink', false);

        expect(options.shownComponents.join('\n')).toMatchInlineSnapshot(`
            "description
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
        const options = new TaskLayoutOptions2();
        expect(options.hiddenComponents.join('\n')).toMatchInlineSnapshot('""');

        options.setVisibility('startDate', false);
        options.setVisibility('doneDate', false);

        expect(options.hiddenComponents.join('\n')).toMatchInlineSnapshot(`
            "startDate
            doneDate"
        `);
    });

    it('should toggle visibility', () => {
        const options = new TaskLayoutOptions2();

        options.setVisibility('cancelledDate', false);
        options.setVisibility('priority', true);
        options.setVisibility('description', true);
        options.setVisibility('blockLink', true);
        options.toggleVisibilityExceptDescriptionAndBlockLink();

        expect(options.isShown('cancelledDate')).toEqual(true);
        expect(options.isShown('priority')).toEqual(false);
        expect(options.isShown('description')).toEqual(true);
        expect(options.isShown('blockLink')).toEqual(true);
    });

    it('should provide toggleable components', () => {
        const options = new TaskLayoutOptions2();

        expect(options.toggleableComponents.join('\n')).toMatchInlineSnapshot(`
            "priority
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
