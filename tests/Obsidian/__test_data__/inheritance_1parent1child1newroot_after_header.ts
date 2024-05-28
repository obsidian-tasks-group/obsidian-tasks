export const inheritance_1parent1child1newroot_after_header = {
    filePath: 'Test Data/inheritance_1parent1child1newroot_after_header.md',
    fileContents:
        '# first header\n' +
        '\n' +
        '- [ ] #task parent task\n' +
        '    - [ ] #task child task 1\n' +
        '\n' +
        '## second header\n' +
        '\n' +
        '- [ ] #task root task\n',
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 22,
                    },
                    end: {
                        line: 2,
                        col: 11,
                        offset: 27,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 10,
                        offset: 50,
                    },
                    end: {
                        line: 3,
                        col: 15,
                        offset: 55,
                    },
                },
                tag: '#task',
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 6,
                        offset: 94,
                    },
                    end: {
                        line: 7,
                        col: 11,
                        offset: 99,
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
                        col: 14,
                        offset: 14,
                    },
                },
                heading: 'first header',
                level: 1,
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 70,
                    },
                    end: {
                        line: 5,
                        col: 16,
                        offset: 86,
                    },
                },
                heading: 'second header',
                level: 2,
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
                        col: 14,
                        offset: 14,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 16,
                    },
                    end: {
                        line: 3,
                        col: 28,
                        offset: 68,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 70,
                    },
                    end: {
                        line: 5,
                        col: 16,
                        offset: 86,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 88,
                    },
                    end: {
                        line: 7,
                        col: 21,
                        offset: 109,
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
                        offset: 16,
                    },
                    end: {
                        line: 2,
                        col: 23,
                        offset: 39,
                    },
                },
                parent: -2,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 2,
                        offset: 42,
                    },
                    end: {
                        line: 3,
                        col: 28,
                        offset: 68,
                    },
                },
                parent: 2,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 88,
                    },
                    end: {
                        line: 7,
                        col: 21,
                        offset: 109,
                    },
                },
                parent: -7,
                task: ' ',
            },
        ],
    },
};
