export const yaml_tags_with_one_value_on_single_line = {
    filePath: 'Test Data/yaml_tags_with_one_value_on_single_line.md',
    fileContents:
        '---\n' +
        'tags: single-value-single-line\n' +
        '---\n' +
        '\n' +
        '# yaml_tags_with_one_value_on_single_line\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_with_one_value_on_single_line'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 89,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 94,
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
                        offset: 40,
                    },
                    end: {
                        line: 4,
                        col: 41,
                        offset: 81,
                    },
                },
                heading: 'yaml_tags_with_one_value_on_single_line',
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
                        offset: 38,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 40,
                    },
                    end: {
                        line: 4,
                        col: 41,
                        offset: 81,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 83,
                    },
                    end: {
                        line: 6,
                        col: 61,
                        offset: 144,
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
                        offset: 83,
                    },
                    end: {
                        line: 6,
                        col: 61,
                        offset: 144,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
        frontmatter: {
            tags: 'single-value-single-line',
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
                offset: 38,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#single-value-single-line', '#task'],
    parseFrontMatterTags: ['#single-value-single-line'],
};
