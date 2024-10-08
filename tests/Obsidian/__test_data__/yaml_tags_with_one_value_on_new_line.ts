export const yaml_tags_with_one_value_on_new_line = {
    filePath: 'Test Data/yaml_tags_with_one_value_on_new_line.md',
    fileContents:
        '---\n' +
        'tags:\n' +
        '  - single-value-new-line\n' +
        '---\n' +
        '\n' +
        '\n' +
        '# yaml_tags_with_one_value_on_new_line\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_with_one_value_on_new_line'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 88,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 93,
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
                        offset: 42,
                    },
                    end: {
                        line: 6,
                        col: 38,
                        offset: 80,
                    },
                },
                heading: 'yaml_tags_with_one_value_on_new_line',
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
                        line: 3,
                        col: 3,
                        offset: 39,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 42,
                    },
                    end: {
                        line: 6,
                        col: 38,
                        offset: 80,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 82,
                    },
                    end: {
                        line: 8,
                        col: 58,
                        offset: 140,
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
                        offset: 82,
                    },
                    end: {
                        line: 8,
                        col: 58,
                        offset: 140,
                    },
                },
                parent: -8,
                task: ' ',
            },
        ],
        frontmatter: {
            tags: ['single-value-new-line'],
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 3,
                col: 3,
                offset: 39,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.7.1',
    getAllTags: ['#single-value-new-line', '#task'],
    parseFrontMatterTags: ['#single-value-new-line'],
};
