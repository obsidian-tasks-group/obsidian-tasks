export const yaml_tags_is_empty_list = {
    filePath: 'Test Data/yaml_tags_is_empty_list.md',
    fileContents:
        '---\n' +
        'tags: []\n' +
        '---\n' +
        '\n' +
        '# yaml_tags_is_empty_list\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_tags_is_empty_list'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 51,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 56,
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
                        offset: 18,
                    },
                    end: {
                        line: 4,
                        col: 25,
                        offset: 43,
                    },
                },
                heading: 'yaml_tags_is_empty_list',
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
                        offset: 16,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 18,
                    },
                    end: {
                        line: 4,
                        col: 25,
                        offset: 43,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 45,
                    },
                    end: {
                        line: 6,
                        col: 45,
                        offset: 90,
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
                        offset: 45,
                    },
                    end: {
                        line: 6,
                        col: 45,
                        offset: 90,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
        frontmatter: {
            tags: [],
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
                offset: 16,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.7.1',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
