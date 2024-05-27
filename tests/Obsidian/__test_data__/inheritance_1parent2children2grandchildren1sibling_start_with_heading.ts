export const inheritance_1parent2children2grandchildren1sibling_start_with_heading = {
    filePath: 'Test Data/inheritance_1parent2children2grandchildren1sibling_start_with_heading.md',
    fileContents:
        '# Test heading\n' +
        '\n' +
        '- [ ] #task parent task\n' +
        '    - [ ] #task child task 1\n' +
        '        - [ ] #task grandchild 1\n' +
        '    - [ ] #task child task 2\n' +
        '        - [ ] #task grandchild 2\n' +
        '- [ ] #task sibling\n',
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
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
            },
            {
                tag: '#task',
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
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 4,
                        col: 14,
                        offset: 83,
                    },
                    end: {
                        line: 4,
                        col: 19,
                        offset: 88,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 5,
                        col: 10,
                        offset: 112,
                    },
                    end: {
                        line: 5,
                        col: 15,
                        offset: 117,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 6,
                        col: 14,
                        offset: 145,
                    },
                    end: {
                        line: 6,
                        col: 19,
                        offset: 150,
                    },
                },
            },
            {
                tag: '#task',
                position: {
                    start: {
                        line: 7,
                        col: 6,
                        offset: 170,
                    },
                    end: {
                        line: 7,
                        col: 11,
                        offset: 175,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'Test heading',
                level: 1,
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
                        line: 7,
                        col: 19,
                        offset: 183,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -2,
                task: ' ',
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
            },
            {
                parent: 2,
                task: ' ',
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
            },
            {
                parent: 3,
                task: ' ',
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 75,
                    },
                    end: {
                        line: 4,
                        col: 32,
                        offset: 101,
                    },
                },
            },
            {
                parent: 2,
                task: ' ',
                position: {
                    start: {
                        line: 5,
                        col: 2,
                        offset: 104,
                    },
                    end: {
                        line: 5,
                        col: 28,
                        offset: 130,
                    },
                },
            },
            {
                parent: 5,
                task: ' ',
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 137,
                    },
                    end: {
                        line: 6,
                        col: 32,
                        offset: 163,
                    },
                },
            },
            {
                parent: -2,
                task: ' ',
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 164,
                    },
                    end: {
                        line: 7,
                        col: 19,
                        offset: 183,
                    },
                },
            },
        ],
    },
};
