export const inheritance_1parent2children1grandchild = {
    filePath: 'Test Data/inheritance_1parent2children1grandchild.md',
    fileContents:
        '- [ ] #task parent task\n' +
        '    - [ ] #task child task 1\n' +
        '    - [ ] #task child task 2\n' +
        '        - [ ] #task grandchild 1\n',
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
                        offset: 34,
                    },
                    end: {
                        line: 1,
                        col: 15,
                        offset: 39,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 2,
                        col: 10,
                        offset: 63,
                    },
                    end: {
                        line: 2,
                        col: 15,
                        offset: 68,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 3,
                        col: 14,
                        offset: 96,
                    },
                    end: {
                        line: 3,
                        col: 19,
                        offset: 101,
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
                        line: 3,
                        col: 32,
                        offset: 114,
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
                        col: 23,
                        offset: 23,
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
                        offset: 26,
                    },
                    end: {
                        line: 1,
                        col: 28,
                        offset: 52,
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
                        offset: 55,
                    },
                    end: {
                        line: 2,
                        col: 28,
                        offset: 81,
                    },
                },
            },
            {
                parent: 2,
                task: ' ',
                position: {
                    start: {
                        line: 3,
                        col: 6,
                        offset: 88,
                    },
                    end: {
                        line: 3,
                        col: 32,
                        offset: 114,
                    },
                },
            },
        ],
    },
};
