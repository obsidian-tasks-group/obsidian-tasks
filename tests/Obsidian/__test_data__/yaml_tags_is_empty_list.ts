export const yaml_tags_is_empty_list = {
    filePath: 'Test Data/yaml_tags_is_empty_list.md',
    fileContents:
        '---\n' +
        'tags: []\n' +
        '---\n' +
        '\n' +
        '# tags is empty list\n' +
        '\n' +
        "- [ ] #task Task in 'tags_is_empty_list'\n",
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 46,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 51,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'tags is empty list',
                level: 1,
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 18,
                    },
                    end: {
                        line: 4,
                        col: 20,
                        offset: 38,
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
                        col: 20,
                        offset: 38,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 40,
                    },
                    end: {
                        line: 6,
                        col: 40,
                        offset: 80,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -6,
                task: ' ',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 40,
                    },
                    end: {
                        line: 6,
                        col: 40,
                        offset: 80,
                    },
                },
            },
        ],
        frontmatter: {
            tags: [],
        },
        frontmatterLinks: [],
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
    },
};
