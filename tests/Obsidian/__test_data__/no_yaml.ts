export const no_yaml = {
    filePath: 'Test Data/no_yaml.md',
    fileContents: "# no_yaml\n\n- [ ] #task Task in 'no_yaml'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 17,
                    },
                    end: {
                        line: 2,
                        col: 11,
                        offset: 22,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 9,
                        offset: 9,
                    },
                },
                heading: 'no_yaml',
                level: 1,
            },
        ],
        sections: [
            {
                type: 'heading',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 9,
                        offset: 9,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 11,
                    },
                    end: {
                        line: 2,
                        col: 29,
                        offset: 40,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 11,
                    },
                    end: {
                        line: 2,
                        col: 29,
                        offset: 40,
                    },
                },
                parent: -2,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.7.1',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
