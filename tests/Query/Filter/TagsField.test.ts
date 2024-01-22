import { GlobalFilter } from '../../../src/Config/GlobalFilter';
import type { FilteringCase } from '../../TestingTools/FilterTestHelpers';
import { shouldSupportFiltering } from '../../TestingTools/FilterTestHelpers';
import { TagsField } from '../../../src/Query/Filter/TagsField';
import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { fromLine } from '../../TestingTools/TestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { expectTaskComparesAfter, expectTaskComparesBefore } from '../../CustomMatchers/CustomMatchersForSorting';
import type { Grouper } from '../../../src/Query/Group/Grouper';
import { TaskGroups } from '../../../src/Query/Group/TaskGroups';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import { sortBy } from '../../TestingTools/SortingTestHelpers';

describe('tag presence & absence', () => {
    it.each(['has tag', 'has tags'])('should have "%s" filtering', (filterLine: string) => {
        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage(filterLine);

        // Act, Assert
        expect(filter.filterFunction).toBeDefined();
        expect(filter.error).toBeUndefined();

        expect(filter).toMatchTaskFromLine('- [ ] stuff #one');
        expect(filter).toMatchTaskFromLine('- [ ] stuff #one #two');
        expect(filter).not.toMatchTaskFromLine('- [ ] no tag here');
    });

    it.each(['no tag', 'no tags'])('should have "%s" filtering', (filterLine: string) => {
        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage(filterLine);

        // Act, Assert
        expect(filter.filterFunction).toBeDefined();
        expect(filter.error).toBeUndefined();

        expect(filter).not.toMatchTaskFromLine('- [ ] stuff #one');
        expect(filter).not.toMatchTaskFromLine('- [ ] stuff #one #two');
        expect(filter).toMatchTaskFromLine('- [ ] no tag here');
    });

    it('should filter together with the global filter ("has tags")', () => {
        GlobalFilter.getInstance().set('#task');

        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage('has tags');

        // Act, Assert
        expect(filter.filterFunction).toBeDefined();
        expect(filter.error).toBeUndefined();

        expect(filter).toMatchTaskFromLine('- [ ] #task stuff #one ');
        expect(filter).toMatchTaskFromLine('- [ ] #task stuff #one #two ');
        expect(filter).not.toMatchTaskFromLine('- [ ] #task global filter is not a tag');

        GlobalFilter.getInstance().reset();
    });

    it('should filter together with the global filter ("no tags")', () => {
        GlobalFilter.getInstance().set('#task');

        // Arrange
        const filter = new TagsField().createFilterOrErrorMessage('no tags');

        // Act, Assert
        expect(filter.filterFunction).toBeDefined();
        expect(filter.error).toBeUndefined();

        expect(filter).not.toMatchTaskFromLine('- [ ] #task stuff #one ');
        expect(filter).not.toMatchTaskFromLine('- [ ] #task stuff #one #two ');
        expect(filter).toMatchTaskFromLine('- [ ] #task global filter is not a tag');

        GlobalFilter.getInstance().reset();
    });

    it('should honour original case, when explaining simple filters', () => {
        const filter = new TagsField().createFilterOrErrorMessage('HAS TAGS');
        expect(filter).toHaveExplanation('HAS TAGS');
    });
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
                GlobalFilter.getInstance().set('#task');

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
                GlobalFilter.getInstance().reset();
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
            GlobalFilter.getInstance().set('#task');
            const filters: Array<string> = ['tags include task'];

            // Act, Assert
            shouldSupportFiltering(filters, defaultTasksWithTags, []);

            // Cleanup
            GlobalFilter.getInstance().reset();
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
describe('Sort by tags', () => {
    describe('field supports sorting', () => {
        const tagsField = new TagsField();

        it('should support sorting', () => {
            expect(tagsField.supportsSorting()).toEqual(true);
        });

        const tag_a = new TaskBuilder().tags(['#a']).build();
        const tag_b = new TaskBuilder().tags(['#b']).build();
        const tags_a_b = new TaskBuilder().tags(['#a', '#b']).build();
        const tags_a_c = new TaskBuilder().tags(['#b', '#c']).build();
        const tags_a_d = new TaskBuilder().tags(['#a', '#d']).build();

        // Helper function to create a task with a given path
        function with_tags(tags: string[]) {
            return new TaskBuilder().tags(tags).build();
        }

        it('should create a default comparator, sorting by first tag', () => {
            const comparator = tagsField.comparator();
            expect(comparator(tags_a_d, tags_a_c, SearchInfo.fromAllTasks([tags_a_d, tags_a_c]))).toBeLessThan(0);
        });

        it('should parse a valid line with default tag number', () => {
            const sorter = tagsField.createSorterFromLine('sort by tag');
            expect(sorter?.property).toEqual('tag');
            expect(sorter?.comparator(tag_a, tag_b, SearchInfo.fromAllTasks([tag_a, tag_b]))).toBeLessThan(0);
            expectTaskComparesBefore(sorter!, tag_a, tag_b);
        });

        it('should parse a valid line with a non-default tag number', () => {
            const sorter = tagsField.createSorterFromLine('sort by tag 2');
            expect(sorter?.property).toEqual('tag');
            expectTaskComparesBefore(sorter!, tags_a_b, tags_a_c);
        });

        it('should parse a valid line with reverse and a non-default tag number', () => {
            const sorter = tagsField.createSorterFromLine('sort by tag reverse 2');
            expect(sorter?.property).toEqual('tag');
            expectTaskComparesAfter(sorter!, tags_a_b, tags_a_c);
        });

        it('should sort by tags case-insensitively', () => {
            const sorter = tagsField.createNormalSorter();
            expectTaskComparesBefore(sorter, with_tags(['#AAAA']), with_tags(['#bbbb']));
            expectTaskComparesBefore(sorter, with_tags(['#aaaa']), with_tags(['#BBBB']));
            expectTaskComparesBefore(sorter, with_tags(['#aaaa']), with_tags(['#AAAA']));
        });

        it('should sort by tags with numbers correctly', () => {
            const sorter = tagsField.createNormalSorter();
            expectTaskComparesBefore(sorter, with_tags(['#a-0']), with_tags(['#a-9']));
            expectTaskComparesBefore(sorter, with_tags(['#a-9']), with_tags(['#a-11']));
        });

        it('should fail to parse a invalid line', () => {
            const line = 'sort by jsdajhasdfa';
            const sorting = tagsField.createSorterFromLine(line);
            expect(sorting).toBeNull();
        });
    });

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
            sortBy([new TagsField().createSorterFromLine('sort by tag 1')!], [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10]),
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
            sortBy(
                [new TagsField().createSorterFromLine('sort by tag reverse 1')!],
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
        expect(sortBy([new TagsField().createSorterFromLine('sort by tag 2')!], [t4, t3, t2, t1, t5])).toEqual(
            expectedOrder,
        );
    });

    it('should sort correctly reversed by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t5, t4, t3, t2, t1];
        expect(sortBy([new TagsField().createSorterFromLine('sort by tag reverse 2')!], [t4, t3, t2, t1, t5])).toEqual(
            expectedOrder,
        );
    });

    it('should sort correctly by tag defaulting to first with global filter', () => {
        // Arrange
        GlobalFilter.getInstance().set('#task');

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
            sortBy(
                [new TagsField().createSorterFromLine('sort by tag 1')!],
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    it('should sort correctly reversed by tag defaulting to first with global filter', () => {
        // Arrange
        GlobalFilter.getInstance().set('#task');

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
            sortBy(
                [new TagsField().createSorterFromLine('sort by tag reverse 1')!],
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    it('should sort correctly by second tag with global filter', () => {
        // Arrange
        GlobalFilter.getInstance().set('#task');

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
        const result = sortBy(
            [new TagsField().createSorterFromLine('sort by tag 2')!],
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    it('should sort correctly reversed by second tag with global filter', () => {
        // Arrange
        GlobalFilter.getInstance().set('#task');

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
        const result = sortBy(
            [new TagsField().createSorterFromLine('sort by tag reverse 2')!],
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    // Issue #1407 - Multiple 'sort by tag' lines ignored all but last one
    it('should sort correctly with two sort by tag lines', () => {
        const input = [
            fromLine({ line: '- [ ] random 2 #a #a 0' }),
            fromLine({ line: '- [ ] random 9 #a #b 1' }),
            fromLine({ line: '- [ ] random 4 #a #c 2' }),
            fromLine({ line: '- [ ] random 7 #b #a 3' }),
            fromLine({ line: '- [ ] random 1 #b #b 4' }),
            fromLine({ line: '- [ ] random 5 #b #c 5' }),
            fromLine({ line: '- [ ] random 3 #c #a 6' }),
            fromLine({ line: '- [ ] random 8 #c #b 7' }),
            fromLine({ line: '- [ ] random 6 #c #c 8' }),
        ];
        const correctExpectedOrder = [
            input[0], // 3 values with tag 2 = '#a' - then sorted by tag 1
            input[3],
            input[6],
            input[1], // 3 values with tag 2 = '#b' - then sorted by tag 1
            input[4],
            input[7],
            input[2], // 3 values with tag 2 = '#c' - then sorted by tag 1
            input[5],
            input[8],
        ];
        expect(
            sortBy(
                [
                    new TagsField().createSorterFromLine('sort by tag 2')!, // tag 2 - ascending
                    new TagsField().createSorterFromLine('sort by tag 1')!, // tag 1 - ascending
                    new DescriptionField().createNormalSorter(), // then description - ascending
                ],
                input,
            ),
        ).toEqual(correctExpectedOrder);
    });
});

describe('grouping by tag', () => {
    it('supports grouping methods correctly', () => {
        expect(new TagsField()).toSupportGroupingWithProperty('tags');
    });

    it.each([
        ['- [ ] a #tag1', ['#tag1']],
        ['- [ ] a #tag1 #tag2', ['#tag1', '#tag2']],
        ['- [x] a', ['(No tags)']],
        ['- [ ] be sure to count the # of tomatoes #gardening', ['#gardening']], // See #1969
    ])('task "%s" should have groups: %s', (taskLine: string, groups: string[]) => {
        // Arrange
        const grouper = new TagsField().createNormalGrouper();

        // Assert
        const tasks = [fromLine({ line: taskLine })];
        expect({ grouper, tasks }).groupHeadingsToBe(groups);
    });

    it('sorts headings in reverse', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a #tag1' });
        const b = fromLine({ line: '- [ ] b #tag2' });
        const inputs = [a, b];

        // Act
        const grouping: Grouper[] = [new TagsField().createGrouperFromLine('group by tags reverse')!];
        const groups = new TaskGroups(grouping, inputs, SearchInfo.fromAllTasks(inputs));

        // Assert
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - tags reverse

            Group names: [#tag2]
            #### [tags] #tag2
            - [ ] b #tag2

            ---

            Group names: [#tag1]
            #### [tags] #tag1
            - [ ] a #tag1

            ---

            2 tasks
            "
        `);
    });

    it('should sort groups for TagsField', () => {
        const grouper = new TagsField().createNormalGrouper();
        const taskLines = [
            '- [ ] a #tag1',
            '- [ ] a #tag1/tag3',
            '- [ ] a #tag2',
            '- [ ] a #tag2/tag4',
            '- [ ] a #tag1 #tag2',
            '- [ ] a #tag1/tag3 #tag2/tag4',
            '- [ ] a',
        ];
        const tasks = taskLines.map((taskLine) => fromLine({ line: taskLine }));

        expect({ grouper, tasks }).groupHeadingsToBe(['(No tags)', '#tag1', '#tag1/tag3', '#tag2', '#tag2/tag4']);
    });
});
