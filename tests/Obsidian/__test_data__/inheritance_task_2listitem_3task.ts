export const inheritance_task_2listitem_3task = {
    filePath: 'Test Data/inheritance_task_2listitem_3task.md',
    fileContents:
        '- [ ] parent task\n' +
        '    - child list item 1\n' +
        '        - [ ] grandchild task 1\n' +
        '        - [ ] grandchild task 2\n' +
        '    - child list item 2\n' +
        '        - [ ] grandchild task 3\n',
    cachedMetadata: {
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
                        line: 5,
                        col: 31,
                        offset: 161,
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
                        col: 17,
                        offset: 17,
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
                        offset: 20,
                    },
                    end: {
                        line: 1,
                        col: 23,
                        offset: 41,
                    },
                },
                parent: 0,
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 48,
                    },
                    end: {
                        line: 2,
                        col: 31,
                        offset: 73,
                    },
                },
                parent: 1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 6,
                        offset: 80,
                    },
                    end: {
                        line: 3,
                        col: 31,
                        offset: 105,
                    },
                },
                parent: 1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 2,
                        offset: 108,
                    },
                    end: {
                        line: 4,
                        col: 23,
                        offset: 129,
                    },
                },
                parent: 0,
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 6,
                        offset: 136,
                    },
                    end: {
                        line: 5,
                        col: 31,
                        offset: 161,
                    },
                },
                parent: 4,
                task: ' ',
            },
        ],
    },
};
