export const callouts_nested_issue_2890_unlabelled = {
    filePath: 'Test Data/callouts_nested_issue_2890_unlabelled.md',
    fileContents:
        ' > [!Calendar]+\n' +
        ' >> [!Check]+\n' +
        ' >>> [!Attention]+\n' +
        ' >>> Some stuff goes here\n' +
        ' >>> - [ ] #task Correction1\n' +
        ' >>> - [ ] #task Correction2\n' +
        ' >>> - [ ] #task Correction3\n' +
        ' >>> - [ ] #task Correction4\n' +
        '\n' +
        '```tasks\n' +
        'not done\n' +
        'path includes {{query.file.path}}\n' +
        '```\n',
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 11,
                        offset: 86,
                    },
                    end: {
                        line: 4,
                        col: 16,
                        offset: 91,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 11,
                        offset: 115,
                    },
                    end: {
                        line: 5,
                        col: 16,
                        offset: 120,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 6,
                        col: 11,
                        offset: 144,
                    },
                    end: {
                        line: 6,
                        col: 16,
                        offset: 149,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 11,
                        offset: 173,
                    },
                    end: {
                        line: 7,
                        col: 16,
                        offset: 178,
                    },
                },
                tag: '#task',
            },
        ],
        sections: [
            {
                type: 'callout',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 7,
                        col: 28,
                        offset: 190,
                    },
                },
            },
            {
                type: 'code',
                position: {
                    start: {
                        line: 9,
                        col: 0,
                        offset: 192,
                    },
                    end: {
                        line: 12,
                        col: 3,
                        offset: 247,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 5,
                        offset: 80,
                    },
                    end: {
                        line: 4,
                        col: 28,
                        offset: 103,
                    },
                },
                parent: -4,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 5,
                        offset: 109,
                    },
                    end: {
                        line: 5,
                        col: 28,
                        offset: 132,
                    },
                },
                parent: -4,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 6,
                        col: 5,
                        offset: 138,
                    },
                    end: {
                        line: 6,
                        col: 28,
                        offset: 161,
                    },
                },
                parent: -4,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 5,
                        offset: 167,
                    },
                    end: {
                        line: 7,
                        col: 28,
                        offset: 190,
                    },
                },
                parent: -4,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task', '#task', '#task', '#task'],
    parseFrontMatterTags: null,
};
