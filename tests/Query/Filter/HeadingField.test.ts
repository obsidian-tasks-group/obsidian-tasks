import { HeadingField } from '../../../src/Query/Filter/HeadingField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import * as CustomMatchersForSorting from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

function testTaskFilterForHeading(filter: FilterOrErrorMessage, precedingHeader: string | null, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.precedingHeader(precedingHeader), expected);
}

describe('heading', () => {
    it('by heading (includes)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage('heading includes Interesting Heading');

        // Act, Assert
        testTaskFilterForHeading(filter, null, false);
        testTaskFilterForHeading(filter, 'An InteResting HeaDing', true);
        testTaskFilterForHeading(filter, 'Other Heading', false);
    });

    it('by heading (does not include)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage('heading does not include Interesting Heading');

        // Act, Assert
        testTaskFilterForHeading(filter, null, true);
        testTaskFilterForHeading(filter, 'SoMe InteResting HeaDing', false);
        testTaskFilterForHeading(filter, 'Other Heading', true);
    });

    it('by heading (regex matches - case sensitive)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage(
            String.raw`heading regex matches /[Ii]nteresting Head.ng/`,
        );

        // Act, Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithHeading('Interesting Heading');
        expect(filter).not.toMatchTaskWithHeading(null);
        expect(filter).not.toMatchTaskWithHeading('SoMe InteResting HeaDing');
    });

    it('by heading (regex does not match - case in-sensitive)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage(
            String.raw`heading regex does not match /[Ii]nteresting Head.ng/i`,
        );

        // Act, Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithHeading(null);
        expect(filter).not.toMatchTaskWithHeading('Interesting Heading');
        expect(filter).not.toMatchTaskWithHeading('SoMe InteResting HeaDing');
    });
});

describe('sorting by heading', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new HeadingField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // Helper function to create a task with a given path
    function with_heading(heading: string) {
        return new TaskBuilder().precedingHeader(heading).build();
    }

    it('sort by heading', () => {
        // Arrange
        const sorter = new HeadingField().createNormalSorter();

        // Assert
        CustomMatchersForSorting.expectTaskComparesBefore(sorter, with_heading('Heading 1'), with_heading('Heading 2'));
        CustomMatchersForSorting.expectTaskComparesBefore(sorter, with_heading(''), with_heading('Non-empty heading')); // Empty heading comes first
        // Beginning with numbers
        CustomMatchersForSorting.expectTaskComparesBefore(sorter, with_heading('1 Stuff'), with_heading('2 Stuff'));
        CustomMatchersForSorting.expectTaskComparesBefore(sorter, with_heading('9 Stuff'), with_heading('11 Stuff'));
    });

    it('sort by heading reverse', () => {
        // Single example just to prove reverse works.
        // (There's no need to repeat all the examples above)
        const sorter = new HeadingField().createReverseSorter();
        CustomMatchersForSorting.expectTaskComparesAfter(sorter, with_heading('Heading 1'), with_heading('Heading 2'));
    });
});

describe('grouping by heading', () => {
    it('supports grouping methods correctly', () => {
        expect(new HeadingField()).toSupportGroupingWithProperty('heading');
    });

    it.each([
        ['- [ ] xxx', null, ['(No heading)']],
        ['- [ ] xxx', '', ['(No heading)']],
        ['- [ ] xxx', 'heading', ['heading']],
        // underscores in headings are NOT escaped - will be rendered
        ['- [ ] xxx', 'heading _italic text_', ['heading _italic text_']],
    ])(
        'task "%s" with header "%s" should have groups: %s',
        (taskLine: string, header: string | null, groups: string[]) => {
            // Arrange
            const grouper = new HeadingField().createNormalGrouper();

            // Assert
            const tasks = [fromLine({ line: taskLine, precedingHeader: header })];
            expect({ grouper, tasks }).groupHeadingsToBe(groups);
        },
    );

    it('should sort groups for HeadingField', () => {
        // Arrange
        const tasks = SampleTasks.withAllRootsPathsHeadings();
        const grouper = new HeadingField().createNormalGrouper();

        // Assert
        expect({ grouper, tasks }).groupHeadingsToBe([
            '(No heading)',
            'a_b_c',
            'c',
            'heading',
            'heading _italic text_',
        ]);
    });
});
