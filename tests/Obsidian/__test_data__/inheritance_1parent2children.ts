export const inheritance_1parent2children = {
    filePath: 'Test Data/inheritance_1parent2children.md',
    fileContents: '- [ ] #task parent\n    - [ ] #task child 1\n    - [ ] #task child 2\n',
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 0,
                        col: 6,
                        offset: 6,
                    },
                    end: {
                        line: 0,
                        col: 11,
                        offset: 11,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 1,
                        col: 10,
                        offset: 29,
                    },
                    end: {
                        line: 1,
                        col: 15,
                        offset: 34,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 2,
                        col: 10,
                        offset: 53,
                    },
                    end: {
                        line: 2,
                        col: 15,
                        offset: 58,
                    },
                },
            },
        ],
        sections: [
            {
                type: 'list',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 2,
                        col: 23,
                        offset: 66,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -1,
                task: ' ',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 18,
                        offset: 18,
                    },
                },
            },
            {
                parent: 0,
                task: ' ',
                position: {
                    start: {
                        line: 1,
                        col: 2,
                        offset: 21,
                    },
                    end: {
                        line: 1,
                        col: 23,
                        offset: 42,
                    },
                },
            },
            {
                parent: 0,
                task: ' ',
                position: {
                    start: {
                        line: 2,
                        col: 2,
                        offset: 45,
                    },
                    end: {
                        line: 2,
                        col: 23,
                        offset: 66,
                    },
                },
            },
        ],
        v: 1,
    },
    obsidianApiVersion: '1.7.7',
    getAllTags: ['#task', '#task', '#task'],
    parseFrontMatterTags: null,
};
