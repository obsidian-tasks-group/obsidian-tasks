export const inheritance_task_mixed_children = {
    filePath: 'Test Data/inheritance_task_mixed_children.md',
    fileContents:
        '- [ ] parent task\n' + '    - [ ] child task 1\n' + '    - child list item 1\n' + '    - [ ] child task 2\n',
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
                        line: 3,
                        col: 22,
                        offset: 87,
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
                        col: 22,
                        offset: 40,
                    },
                },
                parent: 0,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 2,
                        offset: 43,
                    },
                    end: {
                        line: 2,
                        col: 23,
                        offset: 64,
                    },
                },
                parent: 0,
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 2,
                        offset: 67,
                    },
                    end: {
                        line: 3,
                        col: 22,
                        offset: 87,
                    },
                },
                parent: 0,
                task: ' ',
            },
        ],
    },
};
