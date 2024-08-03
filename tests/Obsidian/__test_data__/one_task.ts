export const one_task = {
    filePath: 'Test Data/one_task.md',
    fileContents: '- [ ] #task the only task here\n\n',
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
                        line: 0,
                        col: 30,
                        offset: 30,
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
                        col: 30,
                        offset: 30,
                    },
                },
                parent: -1,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
