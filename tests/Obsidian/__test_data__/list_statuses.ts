export const list_statuses = {
    filePath: 'Test Data/list_statuses.md',
    fileContents:
        '`cachedMetadata.listItems` have a `task` field which is the single-character "status symbol".\n' +
        '\n' +
        '- [ ] #task Todo\n' +
        '- [/] #task In Progress\n' +
        '- [x] #task Done ✅ 2024-05-26\n' +
        '- [-] #task Cancelled ❌ 2024-05-26\n',
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 101,
                    },
                    end: {
                        line: 2,
                        col: 11,
                        offset: 106,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 6,
                        offset: 118,
                    },
                    end: {
                        line: 3,
                        col: 11,
                        offset: 123,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 142,
                    },
                    end: {
                        line: 4,
                        col: 11,
                        offset: 147,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 6,
                        offset: 172,
                    },
                    end: {
                        line: 5,
                        col: 11,
                        offset: 177,
                    },
                },
                tag: '#task',
            },
        ],
        sections: [
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 0,
                        col: 93,
                        offset: 93,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 95,
                    },
                    end: {
                        line: 5,
                        col: 34,
                        offset: 200,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 95,
                    },
                    end: {
                        line: 2,
                        col: 16,
                        offset: 111,
                    },
                },
                parent: -2,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 0,
                        offset: 112,
                    },
                    end: {
                        line: 3,
                        col: 23,
                        offset: 135,
                    },
                },
                parent: -2,
                task: '/',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 136,
                    },
                    end: {
                        line: 4,
                        col: 29,
                        offset: 165,
                    },
                },
                parent: -2,
                task: 'x',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 166,
                    },
                    end: {
                        line: 5,
                        col: 34,
                        offset: 200,
                    },
                },
                parent: -2,
                task: '-',
            },
        ],
    },
};
