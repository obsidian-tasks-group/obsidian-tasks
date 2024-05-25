export const yaml_tags_has_multiple_values = {
    filePath: 'Test Data/yaml_tags_has_multiple_values.md',
    fileContents:
        '---\n' +
        'tags:\n' +
        '  - multiple1\n' +
        '  - multiple2\n' +
        '---\n' +
        '\n' +
        '# yaml_tags_has_multiple_values\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_has_multiple_values'\n",
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 8,
                        col: 6,
                        offset: 82,
                    },
                    end: {
                        line: 8,
                        col: 11,
                        offset: 87,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'yaml_tags_has_multiple_values',
                level: 1,
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 43,
                    },
                    end: {
                        line: 6,
                        col: 31,
                        offset: 74,
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
                        line: 4,
                        col: 3,
                        offset: 41,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 43,
                    },
                    end: {
                        line: 6,
                        col: 31,
                        offset: 74,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 76,
                    },
                    end: {
                        line: 8,
                        col: 51,
                        offset: 127,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -8,
                task: ' ',
                position: {
                    start: {
                        line: 8,
                        col: 0,
                        offset: 76,
                    },
                    end: {
                        line: 8,
                        col: 51,
                        offset: 127,
                    },
                },
            },
        ],
        frontmatter: {
            tags: ['multiple1', 'multiple2'],
        },
        frontmatterLinks: [],
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 4,
                col: 3,
                offset: 41,
            },
        },
    },
};
