export const yaml_tags_with_two_values_on_one_line = {
    filePath: 'Test Data/yaml_tags_with_two_values_on_one_line.md',
    fileContents:
        '---\n' +
        'tags: value-1-of-2-on-one-line, value-2-of-2-on-one-line\n' +
        '---\n' +
        '\n' +
        '# yaml_tags_with_two_values_on_one_line\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_with_two_values_on_one_line'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 113,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 118,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 66,
                    },
                    end: {
                        line: 4,
                        col: 39,
                        offset: 105,
                    },
                },
                heading: 'yaml_tags_with_two_values_on_one_line',
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
                        line: 2,
                        col: 3,
                        offset: 64,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 66,
                    },
                    end: {
                        line: 4,
                        col: 39,
                        offset: 105,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 107,
                    },
                    end: {
                        line: 6,
                        col: 59,
                        offset: 166,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 107,
                    },
                    end: {
                        line: 6,
                        col: 59,
                        offset: 166,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
        frontmatter: {
            tags: 'value-1-of-2-on-one-line, value-2-of-2-on-one-line',
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 2,
                col: 3,
                offset: 64,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#value-1-of-2-on-one-line', '#value-2-of-2-on-one-line', '#task'],
    parseFrontMatterTags: ['#value-1-of-2-on-one-line', '#value-2-of-2-on-one-line'],
};
