export const inheritance_listitem_task = {
    filePath: 'Test Data/inheritance_listitem_task.md',
    fileContents: '- parent list item\n    - [ ] child task\n',
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
                        line: 1,
                        col: 20,
                        offset: 39,
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
                        col: 20,
                        offset: 39,
                    },
                },
                parent: 0,
                task: ' ',
            },
        ],
    },
};
