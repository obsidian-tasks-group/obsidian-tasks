export const callout = {
    filePath: 'Test Data/callout.md',
    fileContents:
        '# callout\n' +
        '\n' +
        '> [!todo]\n' +
        "> - [ ] #task Task in 'callout'\n" +
        ">     - [ ] #task Task indented in 'callout'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 3,
                        col: 8,
                        offset: 29,
                    },
                    end: {
                        line: 3,
                        col: 13,
                        offset: 34,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 12,
                        offset: 65,
                    },
                    end: {
                        line: 4,
                        col: 17,
                        offset: 70,
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
                        col: 9,
                        offset: 9,
                    },
                },
                heading: 'callout',
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
                        col: 9,
                        offset: 9,
                    },
                },
            },
            {
                type: 'callout',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 11,
                    },
                    end: {
                        line: 4,
                        col: 44,
                        offset: 97,
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
                        offset: 23,
                    },
                    end: {
                        line: 3,
                        col: 31,
                        offset: 52,
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
                        offset: 57,
                    },
                    end: {
                        line: 4,
                        col: 44,
                        offset: 97,
                    },
                },
                parent: 3,
                task: ' ',
            },
        ],
    },
};
