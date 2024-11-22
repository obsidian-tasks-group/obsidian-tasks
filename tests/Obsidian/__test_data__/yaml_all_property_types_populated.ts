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
        'creation date: 2024-05-25T15:17:00\n' +
        '---\n' +
        '\n' +
        '# yaml_all_property_types_populated\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_all_property_types_populated'\n",
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 23,
                        col: 6,
                        offset: 569,
                    },
                    end: {
                        line: 23,
                        col: 11,
                        offset: 574,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'yaml_all_property_types_populated',
                level: 1,
                position: {
                    start: {
                        line: 21,
                        col: 0,
                        offset: 526,
                    },
                    end: {
                        line: 21,
                        col: 35,
                        offset: 561,
                    },
                },
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
                        line: 19,
                        col: 3,
                        offset: 524,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 21,
                        col: 0,
                        offset: 526,
                    },
                    end: {
                        line: 21,
                        col: 35,
                        offset: 561,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 23,
                        col: 0,
                        offset: 563,
                    },
                    end: {
                        line: 23,
                        col: 55,
                        offset: 618,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -23,
                task: ' ',
                position: {
                    start: {
                        line: 23,
                        col: 0,
                        offset: 563,
                    },
                    end: {
                        line: 23,
                        col: 55,
                        offset: 618,
                    },
                },
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
            'creation date': '2024-05-25T15:17:00',
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
        v: 1,
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 19,
                col: 3,
                offset: 524,
            },
        },
    },
    obsidianApiVersion: '1.7.7',
    getAllTags: ['#sample/tag/value', '#task'],
    parseFrontMatterTags: ['#sample/tag/value'],
};
