export const inheritance_task_listitem_task = {
    filePath: 'Test Data/inheritance_task_listitem_task.md',
    fileContents: '- [ ] parent task\n    - child list item\n        - [ ] grandchild task\n',
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
                        line: 2,
                        col: 29,
                        offset: 69,
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
                task: ' ',
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 46,
                    },
                    end: {
                        line: 2,
                        col: 29,
                        offset: 69,
                    },
                },
            },
        ],
    },
};
