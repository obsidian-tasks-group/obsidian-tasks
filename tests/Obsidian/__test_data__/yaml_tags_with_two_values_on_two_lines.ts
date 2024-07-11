export const yaml_tags_with_two_values_on_two_lines = {
    filePath: 'Test Data/yaml_tags_with_two_values_on_two_lines.md',
    fileContents:
        '---\n' +
        'tags:\n' +
        '  - value-1-of-2-on-two-lines\n' +
        '  - value-2-of-2-on-two-lines\n' +
        '---\n' +
        '\n' +
        '# yaml_tags_with_two_values_on_two_lines\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_with_two_values_on_two_lines'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 123,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 128,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 75,
                    },
                    end: {
                        line: 6,
                        col: 40,
                        offset: 115,
                    },
                },
                heading: 'yaml_tags_with_two_values_on_two_lines',
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
                        line: 4,
                        col: 3,
                        offset: 73,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 75,
                    },
                    end: {
                        line: 6,
                        col: 40,
                        offset: 115,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 117,
                    },
                    end: {
                        line: 8,
                        col: 60,
                        offset: 177,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 117,
                    },
                    end: {
                        line: 8,
                        col: 60,
                        offset: 177,
                    },
                },
                parent: -8,
                task: ' ',
            },
        ],
        frontmatter: {
            tags: ['value-1-of-2-on-two-lines', 'value-2-of-2-on-two-lines'],
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 4,
                col: 3,
                offset: 73,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#value-1-of-2-on-two-lines', '#value-2-of-2-on-two-lines', '#task'],
    parseFrontMatterTags: ['#value-1-of-2-on-two-lines', '#value-2-of-2-on-two-lines'],
};
