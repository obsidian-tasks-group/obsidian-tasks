import { resetSettings, updateSettings } from '../../../src/Config/Settings';
import type { FilteringCase } from '../../TestingTools/FilterTestHelpers';
import { shouldSupportFiltering } from '../../TestingTools/FilterTestHelpers';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';
import { TagsField } from '../../../src/Query/Filter/TagsField';
import { fromLine } from '../../TestHelpers';
import { Sort } from '../../../src/Query/Sort';

expect.extend({
    toMatchTaskFromLine,
});

describe('tag/tags', () => {
    it('should honour any # in query', () => {
        const filter = new TagsField().createFilterOrErrorMessage('tags include #home');
        expect(filter).toMatchTaskFromLine('- [ ] stuff #home');
        expect(filter).not.toMatchTaskFromLine('- [ ] stuff #location/home');
    });

    it('should match any position if no # in query', () => {
        const filter = new TagsField().createFilterOrErrorMessage('tags include home');
        expect(filter).toMatchTaskFromLine('- [ ] stuff #home');
        expect(filter).toMatchTaskFromLine('- [ ] stuff #location/home');
    });

    const defaultTasksWithTags = [
        '- [ ] #task something to do #later #work',
        '- [ ] #task something to do #later #work/meeting',
        '- [ ] #task something to do #later #home',
        '- [ ] #task something to do #later #home/kitchen',
        '- [ ] #task get the milk',
        '- [ ] #task something to do #later #work #TopLevelItem/sub',
    ];

    describe('filtering with "tags"', () => {
        const TagFilteringCases: Array<[string, FilteringCase]> = [
            [
                'by tag presence',
                {
                    filters: ['tags include #home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence',
                {
                    filters: ['tags do not include #home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag presence without hash',
                {
                    filters: ['tags include home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence without hash',
                {
                    filters: ['tags do not include home'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],

            [
                'by tag presence case insensitive',
                {
                    filters: ['tags include #HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence case insensitive',
                {
                    filters: ['tags do not include #HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag presence without hash case insensitive',
                {
                    filters: ['tags include HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                    ],
                },
            ],
            [
                'by tag absence without hash case insensitive',
                {
                    filters: ['tags do not include HoMe'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task get the milk',
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
                },
            ],
            [
                'by tag presence without hash case insensitive and substring',
                {
                    filters: ['tags include TopLevelItem'],
                    tasks: defaultTasksWithTags,
                    expectedResult: ['- [ ] #task something to do #later #work #TopLevelItem/sub'],
                },
            ],
            [
                'by tag absence without hash case insensitive and substring',
                {
                    filters: ['tags do not include TopLevelItem'],
                    tasks: defaultTasksWithTags,
                    expectedResult: [
                        '- [ ] #task something to do #later #work',
                        '- [ ] #task something to do #later #work/meeting',
                        '- [ ] #task something to do #later #home',
                        '- [ ] #task something to do #later #home/kitchen',
                        '- [ ] #task get the milk',
                    ],
                },
            ],
        ];

        test.concurrent.each<[string, FilteringCase]>(TagFilteringCases)(
            'should filter tag with globalFilter %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                // Arrange
                updateSettings({ globalFilter: '#task' });

                // Run on the plural version of the filter first.
                shouldSupportFiltering(filters, allTaskLines, expectedResult);

                // Run a remap of filter to use alternative grammar for single and plural tag/tags.
                // tags include #home vs tag includes #home. The first is preferred as it is a collection.
                //  tags -> tag
                //  include -> includes
                //  does not include -> do not include
                filters.map((filter) => {
                    return filter
                        .replace('tags', 'tag')
                        .replace('include', 'includes')
                        .replace('does not include', 'do not include');
                });

                shouldSupportFiltering(filters, allTaskLines, expectedResult);

                // Cleanup
                resetSettings();
            },
        );

        test.concurrent.each<[string, FilteringCase]>(TagFilteringCases)(
            'should filter tags without globalFilter %s',
            (_, { tasks: allTaskLines, filters, expectedResult }) => {
                // Arrange

                // Run on the plural version of the filter first.
                shouldSupportFiltering(filters, allTaskLines, expectedResult);

                // Run a remap of filter to use alternative grammar for single and plural tag/tags.
                // tags include #home vs tag includes #home. The first is preferred as it is a collection.
                //  tags -> tag
                //  include -> includes
                //  does not include -> do not include
                filters.map((filter) => {
                    return filter
                        .replace('tags', 'tag')
                        .replace('include', 'includes')
                        .replace('does not include', 'do not include');
                });

                shouldSupportFiltering(filters, allTaskLines, expectedResult);
            },
        );

        it('should filter tags without globalFilter by tag presence when there is no global filter', () => {
            // Act, Assert
            shouldSupportFiltering(['tags include task'], defaultTasksWithTags, defaultTasksWithTags);
        });

        it('should ignore the tag which is the global filter', () => {
            // Arrange
            updateSettings({ globalFilter: '#task' });
            const filters: Array<string> = ['tags include task'];

            // Act, Assert
            shouldSupportFiltering(filters, defaultTasksWithTags, []);

            // Cleanup
            resetSettings();
        });
    });

    it('tag/tags - regex matches short tag', () => {
        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage(
            String.raw`tag regex matches /#t$/i`, // case-INsensitive
        );

        // Act, Assert
        expect(filter).toMatchTaskFromLine('- [ ] #t Do stuff');
        expect(filter).toMatchTaskFromLine('- [ ] Do #t stuff');
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff #t');

        // Confirm that tags with sub-tags are not found:
        expect(filter).not.toMatchTaskFromLine('- [ ] #t/b Do stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do #t/b stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #t/b');
    });

    it('tag/tags - regex searching for sub-tags', () => {
        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage(
            String.raw`tags regex matches /#tag\/subtag[0-9]\/subsubtag[0-9]/i`, // case-INsensitive
        );

        // Act, Assert
        expect(filter).toMatchTaskFromLine('- [ ] a #tag/subtag3/subsubtag5');
        expect(filter).toMatchTaskFromLine('- [ ] b #tag/subtag3/Subsubtag9');
    });

    it('tag/tags - regex does not match', () => {
        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage(
            String.raw`tags regex does not match /#HOME/`, // case-sensitive
        );

        // Act, Assert
        expect(filter).toMatchTaskFromLine('- [ ] stuff #work');
        expect(filter).toMatchTaskFromLine('- [ ] stuff #home');
        expect(filter).not.toMatchTaskFromLine('- [ ] stuff #HOME');
        expect(filter).not.toMatchTaskFromLine('- [ ] stuff #work #HOME'); // searches multiple tags
    });
});

/*
 * All the test cases below have tasks with 0 or more tags against them. This is to
 * ensure that the sorting can handle the ordering correctly when there are no tags or
 * if one of th tasks has less tags than the other.
 *
 * There is also a task with additional characters in the name to ensure it is seen
 * as bigger that one with the same initial characters.
 */
// TODO Replace this with something simpler but equivalent.
describe('Sort by tags', () => {
    it('should sort correctly by tag defaulting to first with no global filter', () => {
        // Arrange
        const t1 = fromLine({ line: '- [ ] a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] a #bbb #iii' });
        const t3 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] a #ddd #ggg' });
        const t5 = fromLine({ line: '- [ ] a #eee #fff' });
        const t6 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t7 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t8 = fromLine({ line: '- [ ] a #hhh #eee' });
        const t9 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t10 = fromLine({ line: '- [ ] a #jjj #hhh' });
        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10];

        // Act / Assert
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 1, 'tag')],
                },
                [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly reversed by tag defaulting to first with no global filter', () => {
        // Arrange
        const t1 = fromLine({ line: '- [ ] a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] a #bbb #iii' });
        const t3 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] a #ddd #ggg' });
        const t5 = fromLine({ line: '- [ ] a #eee #fff' });
        const t6 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t7 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t8 = fromLine({ line: '- [ ] a #hhh #eee' });
        const t9 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t10 = fromLine({ line: '- [ ] a #jjj #hhh' });
        const expectedOrder = [t10, t9, t8, t7, t6, t5, t4, t3, t2, t1];

        // Act / Assert
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 1, 'tag')],
                },
                [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t1, t2, t3, t4, t5];
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 2, 'tag')],
                },
                [t4, t3, t2, t1, t5],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly reversed by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t5, t4, t3, t2, t1];
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 2, 'tag')],
                },
                [t4, t3, t2, t1, t5],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly by tag defaulting to first with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t4 = fromLine({ line: '- [ ] #task a #bbbb ' });
        const t5 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t6 = fromLine({ line: '- [ ] #task a #ddd #ggg' });
        const t7 = fromLine({ line: '- [ ] #task a #eee #fff' });
        const t8 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t9 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t10 = fromLine({ line: '- [ ] #task a #hhh #eee' });
        const t11 = fromLine({ line: '- [ ] #task a #iii #ddd' });
        const t12 = fromLine({ line: '- [ ] #task a #jjj #hhh' });
        const t13 = fromLine({ line: '- [ ] #task a' });

        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13];

        // Act
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 1, 'tag')],
                },
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly reversed by tag defaulting to first with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t4 = fromLine({ line: '- [ ] #task a #bbbb ' });
        const t5 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t6 = fromLine({ line: '- [ ] #task a #ddd #ggg' });
        const t7 = fromLine({ line: '- [ ] #task a #eee #fff' });
        const t8 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t9 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t10 = fromLine({ line: '- [ ] #task a #hhh #eee' });
        const t11 = fromLine({ line: '- [ ] #task a #iii #ddd' });
        const t12 = fromLine({ line: '- [ ] #task a #jjj #hhh' });
        const t13 = fromLine({ line: '- [ ] #task a' });

        const expectedOrder = [t13, t12, t11, t10, t9, t8, t7, t6, t5, t4, t3, t2, t1];

        // Act
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 1, 'tag')],
                },
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly by second tag with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t5 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t6 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t7 = fromLine({ line: '- [ ] #task a #bbbb' });
        const t8 = fromLine({ line: '- [ ] #task a' });
        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8];

        // Act
        const result = Sort.by(
            {
                sorting: [Sort.makeLegacySorting(false, 2, 'tag')],
            },
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly reversed by second tag with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t5 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t6 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t7 = fromLine({ line: '- [ ] #task a #bbbb' });
        const t8 = fromLine({ line: '- [ ] #task a' });
        const expectedOrder = [t8, t7, t6, t5, t4, t3, t2, t1];

        // Act
        const result = Sort.by(
            {
                sorting: [Sort.makeLegacySorting(true, 2, 'tag')],
            },
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });
});
