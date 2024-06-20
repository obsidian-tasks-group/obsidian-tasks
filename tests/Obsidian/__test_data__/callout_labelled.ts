export const callout_labelled = {
    filePath: 'Test Data/callout_labelled.md',
    fileContents:
        '# callout_labelled\n' +
        '\n' +
        '> [!todo] callout_labelled\n' +
        "> - [ ] #task Task in 'callout_labelled'\n" +
        ">     - [ ] #task Task indented in 'callout_labelled'\n" +
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
                        line: 3,
                        col: 8,
                        offset: 55,
                    },
                    end: {
                        line: 3,
                        col: 13,
                        offset: 60,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 12,
                        offset: 100,
                    },
                    end: {
                        line: 4,
                        col: 17,
                        offset: 105,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
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
                heading: 'callout_labelled',
                level: 1,
            },
        ],
        sections: [
            {
                type: 'heading',
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
            },
            {
                type: 'callout',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 20,
                    },
                    end: {
                        line: 4,
                        col: 53,
                        offset: 141,
                    },
                },
            },
            {
                type: 'code',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 143,
                    },
                    end: {
                        line: 9,
                        col: 3,
                        offset: 198,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 3,
                        col: 2,
                        offset: 49,
                    },
                    end: {
                        line: 3,
                        col: 40,
                        offset: 87,
                    },
                },
                parent: -3,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 4,
                        offset: 92,
                    },
                    end: {
                        line: 4,
                        col: 53,
                        offset: 141,
                    },
                },
                parent: 3,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.6.4',
};
