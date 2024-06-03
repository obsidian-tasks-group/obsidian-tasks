export const inheritance_listitem_listitem_task = {
    filePath: 'Test Data/inheritance_listitem_listitem_task.md',
    fileContents: '- parent list item\n    - child list item\n        - [ ] grandchild task\n',
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
                        offset: 70,
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
                        col: 18,
                        offset: 18,
                    },
                },
                parent: -1,
            },
            {
                position: {
                    start: {
                        line: 1,
                        col: 2,
                        offset: 21,
                    },
                    end: {
                        line: 1,
                        col: 21,
                        offset: 40,
                    },
                },
                parent: 0,
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 47,
                    },
                    end: {
                        line: 2,
                        col: 29,
                        offset: 70,
                    },
                },
                parent: 1,
                task: ' ',
            },
        ],
    },
};
