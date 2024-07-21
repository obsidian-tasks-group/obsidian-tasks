export const yaml_all_property_types_populated = {
    filePath: 'Test Data/yaml_all_property_types_populated.md',
    fileContents:
        '---\n' +
        'sample_checkbox_property: true\n' +
        'sample_date_property: 2024-07-21\n' +
        'sample_date_and_time_property: 2024-07-21T12:37:00\n' +
        'sample_list_property:\n' +
        '  - Sample\n' +
        '  - List\n' +
        '  - Value\n' +
        'sample_number_property: 246\n' +
        'sample_text_property: Sample Text Value\n' +
        'sample_link_property: "[[yaml_all_property_types_populated]]"\n' +
        'sample_link_list_property:\n' +
        '  - "[[yaml_all_property_types_populated]]"\n' +
        '  - "[[yaml_all_property_types_empty]]"\n' +
        'aliases:\n' +
        '  - YAML All Property Types Populated\n' +
        'tags:\n' +
        '  - sample/tag/value\n' +
        '---\n' +
        '\n' +
        '# yaml_all_property_types_populated\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_all_property_types_populated'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 22,
                        col: 6,
                        offset: 534,
                    },
                    end: {
                        line: 22,
                        col: 11,
                        offset: 539,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 20,
                        col: 0,
                        offset: 491,
                    },
                    end: {
                        line: 20,
                        col: 35,
                        offset: 526,
                    },
                },
                heading: 'yaml_all_property_types_populated',
                level: 1,
            },
        ],
        sections: [
            {
                type: 'yaml',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 18,
                        col: 3,
                        offset: 489,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 20,
                        col: 0,
                        offset: 491,
                    },
                    end: {
                        line: 20,
                        col: 35,
                        offset: 526,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 22,
                        col: 0,
                        offset: 528,
                    },
                    end: {
                        line: 22,
                        col: 55,
                        offset: 583,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 22,
                        col: 0,
                        offset: 528,
                    },
                    end: {
                        line: 22,
                        col: 55,
                        offset: 583,
                    },
                },
                parent: -22,
                task: ' ',
            },
        ],
        frontmatter: {
            sample_checkbox_property: true,
            sample_date_property: '2024-07-21',
            sample_date_and_time_property: '2024-07-21T12:37:00',
            sample_list_property: ['Sample', 'List', 'Value'],
            sample_number_property: 246,
            sample_text_property: 'Sample Text Value',
            sample_link_property: '[[yaml_all_property_types_populated]]',
            sample_link_list_property: ['[[yaml_all_property_types_populated]]', '[[yaml_all_property_types_empty]]'],
            aliases: ['YAML All Property Types Populated'],
            tags: ['sample/tag/value'],
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 18,
                col: 3,
                offset: 489,
            },
        },
        frontmatterLinks: [
            {
                key: 'sample_link_property',
                link: 'yaml_all_property_types_populated',
                original: '[[yaml_all_property_types_populated]]',
                displayText: 'yaml_all_property_types_populated',
            },
            {
                key: 'sample_link_list_property.0',
                link: 'yaml_all_property_types_populated',
                original: '[[yaml_all_property_types_populated]]',
                displayText: 'yaml_all_property_types_populated',
            },
            {
                key: 'sample_link_list_property.1',
                link: 'yaml_all_property_types_empty',
                original: '[[yaml_all_property_types_empty]]',
                displayText: 'yaml_all_property_types_empty',
            },
        ],
    },
    obsidianApiVersion: '1.6.7',
    getAllTags: ['#sample/tag/value', '#task'],
    parseFrontMatterTags: ['#sample/tag/value'],
};
