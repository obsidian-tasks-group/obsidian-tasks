import { getSettings, updateSettings } from '../../../src/config/Settings';
import type { FilteringCase } from '../../TestingTools/FilterTestHelpers';
import { shouldSupportFiltering } from '../../TestingTools/FilterTestHelpers';

describe('tag/tags', () => {
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
                const originalSettings = getSettings();
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
                updateSettings(originalSettings);
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

        it('should filter tags without globalFilter by tag presence when it is the global tag', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '' });

            // Act, Assert
            shouldSupportFiltering(
                ['tags include task'],
                defaultTasksWithTags,
                defaultTasksWithTags,
            );

            // Cleanup
            updateSettings(originalSettings);
        });

        it('should filter tag with globalFilter by tag presence when it is the global tag', () => {
            // Arrange
            const originalSettings = getSettings();
            updateSettings({ globalFilter: '#task' });
            const filters: Array<string> = ['tags include task'];

            // Act, Assert
            shouldSupportFiltering(filters, defaultTasksWithTags, []);

            // Cleanup
            updateSettings(originalSettings);
        });
    });
});
