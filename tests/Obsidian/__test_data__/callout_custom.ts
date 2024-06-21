export const callout_custom = {
    filePath: 'Test Data/callout_custom.md',
    fileContents:
        '# callout_custom\n' +
        '\n' +
        '> [!callout_custom]\n' +
        "> - [ ] #task Task in 'callout_custom'\n" +
        ">     - [ ] #task Task indented in 'callout_custom'\n" +
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
                        offset: 46,
                    },
                    end: {
                        line: 3,
                        col: 13,
                        offset: 51,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 12,
                        offset: 89,
                    },
                    end: {
                        line: 4,
                        col: 17,
                        offset: 94,
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
                        col: 16,
                        offset: 16,
                    },
                },
                heading: 'callout_custom',
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
                        col: 16,
                        offset: 16,
                    },
                },
            },
            {
                type: 'callout',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 18,
                    },
                    end: {
                        line: 4,
                        col: 51,
                        offset: 128,
                    },
                },
            },
            {
                type: 'code',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 130,
                    },
                    end: {
                        line: 9,
                        col: 3,
                        offset: 185,
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
                        offset: 40,
                    },
                    end: {
                        line: 3,
                        col: 38,
                        offset: 76,
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
                        offset: 81,
                    },
                    end: {
                        line: 4,
                        col: 51,
                        offset: 128,
                    },
                },
                parent: 3,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.6.4',
};
