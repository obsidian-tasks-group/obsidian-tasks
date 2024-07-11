export const yaml_1_alias = {
    filePath: 'Test Data/yaml_1_alias.md',
    fileContents:
        '---\n' +
        'aliases:\n' +
        '  - YAML Alias 1\n' +
        '---\n' +
        '\n' +
        '# yaml_1_alias\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_1_alias'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 7,
                        col: 6,
                        offset: 57,
                    },
                    end: {
                        line: 7,
                        col: 11,
                        offset: 62,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 35,
                    },
                    end: {
                        line: 5,
                        col: 14,
                        offset: 49,
                    },
                },
                heading: 'yaml_1_alias',
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
                        offset: 33,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 35,
                    },
                    end: {
                        line: 5,
                        col: 14,
                        offset: 49,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 51,
                    },
                    end: {
                        line: 7,
                        col: 34,
                        offset: 85,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 51,
                    },
                    end: {
                        line: 7,
                        col: 34,
                        offset: 85,
                    },
                },
                parent: -7,
                task: ' ',
            },
        ],
        frontmatter: {
            aliases: ['YAML Alias 1'],
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
                offset: 33,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
