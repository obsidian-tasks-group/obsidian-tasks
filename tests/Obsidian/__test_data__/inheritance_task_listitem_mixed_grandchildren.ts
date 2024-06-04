export const inheritance_task_listitem_mixed_grandchildren = {
    filePath: 'Test Data/inheritance_task_listitem_mixed_grandchildren.md',
    fileContents:
        '- [ ] parent task\n' +
        '    - child list item\n' +
        '        - grandchild list item 1\n' +
        '        - [ ] grandchild task\n' +
        '        - grandchild list item 2\n',
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
                        line: 4,
                        col: 32,
                        offset: 135,
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
                        col: 17,
                        offset: 17,
                    },
                },
            },
            {
                parent: 0,
                position: {
                    start: {
                        line: 1,
                        col: 2,
                        offset: 20,
                    },
                    end: {
                        line: 1,
                        col: 21,
                        offset: 39,
                    },
                },
            },
            {
                parent: 1,
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 46,
                    },
                    end: {
                        line: 2,
                        col: 32,
                        offset: 72,
                    },
                },
            },
            {
                parent: 1,
                task: ' ',
                position: {
                    start: {
                        line: 3,
                        col: 6,
                        offset: 79,
                    },
                    end: {
                        line: 3,
                        col: 29,
                        offset: 102,
                    },
                },
            },
            {
                parent: 1,
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 109,
                    },
                    end: {
                        line: 4,
                        col: 32,
                        offset: 135,
                    },
                },
            },
        ],
    },
};
