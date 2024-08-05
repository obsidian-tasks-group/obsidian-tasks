export const inheritance_2roots_listitem_listitem_task = {
    filePath: 'Test Data/inheritance_2roots_listitem_listitem_task.md',
    fileContents:
        '- parent list item 1\n' +
        '    - child list item 1\n' +
        '        - [ ] grandchild task 1\n' +
        '\n' +
        '- parent list item 2\n' +
        '    - child list item 2\n' +
        '        - [ ] grandchild task 2\n',
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
                        line: 6,
                        col: 31,
                        offset: 154,
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
                        col: 20,
                        offset: 20,
                    },
                },
                parent: -1,
            },
            {
                position: {
                    start: {
                        line: 1,
                        col: 2,
                        offset: 23,
                    },
                    end: {
                        line: 1,
                        col: 23,
                        offset: 44,
                    },
                },
                parent: 0,
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 51,
                    },
                    end: {
                        line: 2,
                        col: 31,
                        offset: 76,
                    },
                },
                parent: 1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 78,
                    },
                    end: {
                        line: 4,
                        col: 20,
                        offset: 98,
                    },
                },
                parent: -1,
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 2,
                        offset: 101,
                    },
                    end: {
                        line: 5,
                        col: 23,
                        offset: 122,
                    },
                },
                parent: 4,
            },
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 129,
                    },
                    end: {
                        line: 6,
                        col: 31,
                        offset: 154,
                    },
                },
                parent: 5,
                task: ' ',
            },
        ],
    },
};
