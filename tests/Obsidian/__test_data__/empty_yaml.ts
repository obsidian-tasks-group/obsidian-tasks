export const empty_yaml = {
    filePath: 'Test Data/empty_yaml.md',
    fileContents: "---\n---\n\n# empty_yaml\n\n- [ ] #task Task in 'empty_yaml'\n",
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 5,
                        col: 6,
                        offset: 29,
                    },
                    end: {
                        line: 5,
                        col: 11,
                        offset: 34,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'empty_yaml',
                level: 1,
                position: {
                    start: {
                        line: 3,
                        col: 0,
                        offset: 9,
                    },
                    end: {
                        line: 3,
                        col: 12,
                        offset: 21,
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
                        line: 1,
                        col: 3,
                        offset: 7,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 3,
                        col: 0,
                        offset: 9,
                    },
                    end: {
                        line: 3,
                        col: 12,
                        offset: 21,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 23,
                    },
                    end: {
                        line: 5,
                        col: 32,
                        offset: 55,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -5,
                task: ' ',
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 23,
                    },
                    end: {
                        line: 5,
                        col: 32,
                        offset: 55,
                    },
                },
            },
        ],
    },
};
