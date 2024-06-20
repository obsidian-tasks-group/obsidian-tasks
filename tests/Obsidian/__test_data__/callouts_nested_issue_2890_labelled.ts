export const callouts_nested_issue_2890_labelled = {
    filePath: 'Test Data/callouts_nested_issue_2890_labelled.md',
    fileContents:
        ' > [!Calendar]+ MONTH\n' +
        ' >> [!Check]+ GROUP\n' +
        ' >>> [!Attention]+ Correction TITLE\n' +
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
                        line: 7,
                        col: 11,
                        offset: 202,
                    },
                    end: {
                        line: 7,
                        col: 16,
                        offset: 207,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 8,
                        col: 9,
                        offset: 229,
                    },
                    end: {
                        line: 8,
                        col: 14,
                        offset: 234,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 9,
                        col: 8,
                        offset: 229,
                    },
                    end: {
                        line: 9,
                        col: 13,
                        offset: 234,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 10,
                        col: 6,
                        offset: 236,
                    },
                    end: {
                        line: 10,
                        col: 11,
                        offset: 241,
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
                        offset: 219,
                    },
                },
            },
            {
                type: 'code',
                position: {
                    start: {
                        line: 9,
                        col: 8,
                        offset: 229,
                    },
                    end: {
                        line: 12,
                        col: 3,
                        offset: 276,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 7,
                        col: 5,
                        offset: 196,
                    },
                    end: {
                        line: 7,
                        col: 28,
                        offset: 219,
                    },
                },
                parent: -7,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 8,
                        col: 3,
                        offset: 223,
                    },
                    end: {
                        line: 8,
                        col: 26,
                        offset: 246,
                    },
                },
                parent: -7,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 9,
                        col: 2,
                        offset: 223,
                    },
                    end: {
                        line: 9,
                        col: 25,
                        offset: 246,
                    },
                },
                parent: -7,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 10,
                        col: 0,
                        offset: 230,
                    },
                    end: {
                        line: 10,
                        col: 23,
                        offset: 253,
                    },
                },
                parent: -7,
                task: ' ',
            },
        ],
    },
};
