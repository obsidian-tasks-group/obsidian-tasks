export const inheritance_1parent2children2grandchildren = {
    filePath: 'Test Data/inheritance_1parent2children2grandchildren.md',
    fileContents:
        '- [ ] #task parent task\n' +
        '    - [ ] #task child task 1\n' +
        '        - [ ] #task grandchild 1\n' +
        '    - [ ] #task child task 2\n' +
        '        - [ ] #task grandchild 2\n',
    cachedMetadata: {
        tags: [
            {
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
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 1,
                        col: 10,
                        offset: 34,
                    },
                    end: {
                        line: 1,
                        col: 15,
                        offset: 39,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 14,
                        offset: 67,
                    },
                    end: {
                        line: 2,
                        col: 19,
                        offset: 72,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 10,
                        offset: 96,
                    },
                    end: {
                        line: 3,
                        col: 15,
                        offset: 101,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 14,
                        offset: 129,
                    },
                    end: {
                        line: 4,
                        col: 19,
                        offset: 134,
                    },
                },
                tag: '#task',
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
                        line: 4,
                        col: 32,
                        offset: 147,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 23,
                        offset: 23,
                    },
                },
                parent: -1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 1,
                        col: 2,
                        offset: 26,
                    },
                    end: {
                        line: 1,
                        col: 28,
                        offset: 52,
                    },
                },
                parent: 0,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 59,
                    },
                    end: {
                        line: 2,
                        col: 32,
                        offset: 85,
                    },
                },
                parent: 1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 2,
                        offset: 88,
                    },
                    end: {
                        line: 3,
                        col: 28,
                        offset: 114,
                    },
                },
                parent: 0,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 121,
                    },
                    end: {
                        line: 4,
                        col: 32,
                        offset: 147,
                    },
                },
                parent: 3,
                task: ' ',
            },
        ],
    },
};
