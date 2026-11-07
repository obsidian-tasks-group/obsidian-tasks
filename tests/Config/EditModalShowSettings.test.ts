import {
    defaultEditModalFieldOrder,
    editModalFieldGroups,
    editModalFieldGroupsInOrder,
} from '../../src/Config/EditModalShowSettings';

describe('editModalFieldGroupsInOrder', () => {
    const defaultGroups = Object.entries(editModalFieldGroups).map(([name, fields]) => ({ name, fields }));

    it('should use the default order when there is no saved order', () => {
        expect(editModalFieldGroupsInOrder(undefined)).toEqual(defaultGroups);
        expect(editModalFieldGroupsInOrder([])).toEqual(defaultGroups);
        expect(editModalFieldGroupsInOrder(defaultEditModalFieldOrder)).toEqual(defaultGroups);
    });

    it('should order groups by their first field, and keep the order of fields within groups', () => {
        const groups = editModalFieldGroupsInOrder([
            'done',
            'before_this',
            'status',
            'priority',
            'start',
            'due',
            'after_this',
            'cancelled',
            'created',
            'recurrence',
            'scheduled',
        ]);

        expect(groups).toEqual([
            { name: 'statusAndDates', fields: ['done', 'status', 'cancelled', 'created'] },
            { name: 'dependencies', fields: ['before_this', 'after_this'] },
            { name: 'priority', fields: ['priority'] },
            { name: 'dates', fields: ['start', 'due', 'recurrence', 'scheduled'] },
        ]);
    });

    it('should ignore unknown and duplicated fields', () => {
        const groups = editModalFieldGroupsInOrder(['unknown', 'due', 'due', 'priority']);

        expect(groups.map((group) => group.name)).toEqual(['dates', 'priority', 'dependencies', 'statusAndDates']);
        expect(groups[0].fields).toEqual(['due', 'recurrence', 'scheduled', 'start']);
    });

    it('should add fields missing from the saved order to the end of their group', () => {
        const groups = editModalFieldGroupsInOrder(['cancelled', 'done', 'priority']);

        expect(groups).toEqual([
            { name: 'statusAndDates', fields: ['cancelled', 'done', 'status', 'created'] },
            { name: 'priority', fields: ['priority'] },
            { name: 'dates', fields: ['recurrence', 'due', 'scheduled', 'start'] },
            { name: 'dependencies', fields: ['before_this', 'after_this'] },
        ]);
    });
});
