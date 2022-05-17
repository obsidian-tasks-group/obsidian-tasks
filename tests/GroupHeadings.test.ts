/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { GroupHeadings } from '../src/GroupHeadings';
import { GroupHeading } from '../src/Query/GroupHeading';
import { IntermediateTaskGroupsStorage } from '../src/Query/IntermediateTaskGroups';

window.moment = moment;

export function getHeadingsForAllTaskGroups(
    groupedTasks: IntermediateTaskGroupsStorage,
) {
    const headings: GroupHeading[] = [];
    const grouper = new GroupHeadings(groupedTasks);
    for (const [key] of groupedTasks) {
        const groupHeadings = grouper.getHeadingsForTaskGroup(key);
        for (const heading of groupHeadings) {
            headings.push(heading);
        }
    }
    return headings;
}

describe('GroupHeadings', () => {
    it('generates correct headings for 0 groups', () => {
        const groupedTasks = new IntermediateTaskGroupsStorage();
        const expectedHeadings = new Array<GroupHeading>();

        groupedTasks.set([], []);

        const actualHeadings = getHeadingsForAllTaskGroups(groupedTasks);
        expect(actualHeadings).toEqual(expectedHeadings);
    });

    it('generates correct headings for 1 groups', () => {
        const groupedTasks = new IntermediateTaskGroupsStorage();
        const expectedHeadings = new Array<GroupHeading>();

        groupedTasks.set(['h1 a'], []);
        expectedHeadings.push(new GroupHeading(0, 'h1 a'));

        groupedTasks.set(['h1 b'], []);
        expectedHeadings.push(new GroupHeading(0, 'h1 b'));

        const actualHeadings = getHeadingsForAllTaskGroups(groupedTasks);
        expect(actualHeadings).toEqual(expectedHeadings);
    });

    it('generates correct headings for 2 groups', () => {
        const groupedTasks = new IntermediateTaskGroupsStorage();
        const expectedHeadings = new Array<GroupHeading>();

        // Same Level 1 heading: 'h1 a'
        {
            // First group: write all heading levels
            groupedTasks.set(['h1 a', 'h2 a'], []);
            expectedHeadings.push(new GroupHeading(0, 'h1 a'));
            expectedHeadings.push(new GroupHeading(1, 'h2 a'));

            // Differs only in level 2 heading - only write out second heading:
            groupedTasks.set(['h1 a', 'h2 b'], []);
            expectedHeadings.push(new GroupHeading(1, 'h2 b'));
        }

        // Same Level 1 heading: 'h1 b'
        {
            groupedTasks.set(['h1 b', 'h2 a'], []);
            expectedHeadings.push(new GroupHeading(0, 'h1 b'));
            expectedHeadings.push(new GroupHeading(1, 'h2 a'));

            groupedTasks.set(['h1 b', 'h2 b'], []);
            expectedHeadings.push(new GroupHeading(1, 'h2 b'));

            groupedTasks.set(['h1 b', 'h2 c'], []);
            expectedHeadings.push(new GroupHeading(1, 'h2 c'));
        }

        const actualHeadings = getHeadingsForAllTaskGroups(groupedTasks);
        expect(actualHeadings).toEqual(expectedHeadings);
    });

    it('generates correct headings for 3 groups', () => {
        const groupedTasks = new IntermediateTaskGroupsStorage();
        const expectedHeadings = new Array<GroupHeading>();

        // Same Level 1 heading: 'h1 a'
        {
            // First group: write all heading levels
            groupedTasks.set(['h1 a', 'h2 a', 'h3 a'], []);
            expectedHeadings.push(new GroupHeading(0, 'h1 a'));
            expectedHeadings.push(new GroupHeading(1, 'h2 a'));
            expectedHeadings.push(new GroupHeading(2, 'h3 a'));

            // Differs only in level 2 heading - write out remaining headings:
            groupedTasks.set(['h1 a', 'h2 b', 'h3 a'], []);
            expectedHeadings.push(new GroupHeading(1, 'h2 b'));
            expectedHeadings.push(new GroupHeading(2, 'h3 a'));
        }

        // Same Level 1 heading: 'h1 b'
        {
            groupedTasks.set(['h1 b', 'h2 a', 'h3 a'], []);
            expectedHeadings.push(new GroupHeading(0, 'h1 b'));
            expectedHeadings.push(new GroupHeading(1, 'h2 a'));
            expectedHeadings.push(new GroupHeading(2, 'h3 a'));

            groupedTasks.set(['h1 b', 'h2 b', 'h3 a'], []);
            expectedHeadings.push(new GroupHeading(1, 'h2 b'));
            expectedHeadings.push(new GroupHeading(2, 'h3 a'));

            groupedTasks.set(['h1 b', 'h2 c', 'h3 a'], []);
            expectedHeadings.push(new GroupHeading(1, 'h2 c'));
            expectedHeadings.push(new GroupHeading(2, 'h3 a'));
        }

        const actualHeadings = getHeadingsForAllTaskGroups(groupedTasks);
        expect(actualHeadings).toEqual(expectedHeadings);
    });
});
