import { resetSettings, updateSettings } from '../../../src/config/Settings';
import type { FilteringCase } from '../../TestingTools/FilterTestHelpers';
import { shouldSupportFiltering } from '../../TestingTools/FilterTestHelpers';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';
import { TagsField } from '../../../src/Query/Filter/TagsField';

expect.extend({
    toMatchTaskFromLine,
});

describe('tag/tags', () => {
    it('should honour any # in query', () => {
        const filter = new TagsField().createFilterOrErrorMessage(
            'tags include #home',
        );
        expect(filter).toMatchTaskFromLine('- [ ] stuff #home');
        expect(filter).not.toMatchTaskFromLine('- [ ] stuff #location/home');
    });

    it('should match any position if no # in query', () => {
        const filter = new TagsField().createFilterOrErrorMessage(
            'tags include home',
        );
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
                    expectedResult: [
                        '- [ ] #task something to do #later #work #TopLevelItem/sub',
                    ],
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
            shouldSupportFiltering(
                ['tags include task'],
                defaultTasksWithTags,
                defaultTasksWithTags,
            );
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
