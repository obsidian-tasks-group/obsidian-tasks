export const yaml_tags_is_empty = {
    filePath: 'Test Data/yaml_tags_is_empty.md',
    fileContents:
        '---\n' +
        'tags:\n' +
        '---\n' +
        '\n' +
        '# yaml_tags_is_empty\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_is_empty'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 43,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 48,
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
                        offset: 15,
                    },
                    end: {
                        line: 4,
                        col: 20,
                        offset: 35,
                    },
                },
                heading: 'yaml_tags_is_empty',
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
                        offset: 13,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 15,
                    },
                    end: {
                        line: 4,
                        col: 20,
                        offset: 35,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 37,
                    },
                    end: {
                        line: 6,
                        col: 40,
                        offset: 77,
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
                        offset: 37,
                    },
                    end: {
                        line: 6,
                        col: 40,
                        offset: 77,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
        frontmatter: {
            tags: null,
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
                offset: 13,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.7.1',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
