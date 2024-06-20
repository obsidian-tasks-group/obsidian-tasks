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
                        line: 4,
                        col: 8,
                        offset: 96,
                    },
                    end: {
                        line: 4,
                        col: 13,
                        offset: 101,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 10,
                        offset: 152,
                    },
                    end: {
                        line: 5,
                        col: 15,
                        offset: 157,
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
                        line: 4,
                        col: 2,
                        offset: 90,
                    },
                    end: {
                        line: 4,
                        col: 40,
                        offset: 128,
                    },
                },
                parent: -4,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 2,
                        offset: 144,
                    },
                    end: {
                        line: 5,
                        col: 51,
                        offset: 193,
                    },
                },
                parent: 4,
                task: ' ',
            },
        ],
    },
};
