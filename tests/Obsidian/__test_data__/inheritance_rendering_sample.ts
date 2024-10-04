export const inheritance_rendering_sample = {
    filePath: 'Test Data/inheritance_rendering_sample.md',
    fileContents:
        '-  grandparent list item\n' +
        '    - [ ] parent 1\n' +
        '        - [ ] child 1\n' +
        '            - [ ] grandchild 1\n' +
        '                - list item grand grand child\n' +
        '        - [ ] child 2\n' +
        '            - non task grandchild\n' +
        '                - [ ] grand grand child\n' +
        '    - [ ] parent 2\n',
    cachedMetadata: {
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
                        line: 8,
                        col: 18,
                        offset: 257,
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
                        col: 24,
                        offset: 24,
                    },
                },
                parent: -1,
            },
            {
                position: {
                    start: {
                        line: 1,
                        col: 3,
                        offset: 28,
                    },
                    end: {
                        line: 1,
                        col: 18,
                        offset: 43,
                    },
                },
                parent: 0,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 50,
                    },
                    end: {
                        line: 2,
                        col: 21,
                        offset: 65,
                    },
                },
                parent: 1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 3,
                        col: 10,
                        offset: 76,
                    },
                    end: {
                        line: 3,
                        col: 30,
                        offset: 96,
                    },
                },
                parent: 2,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 4,
                        col: 14,
                        offset: 111,
                    },
                    end: {
                        line: 4,
                        col: 45,
                        offset: 142,
                    },
                },
                parent: 3,
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 6,
                        offset: 149,
                    },
                    end: {
                        line: 5,
                        col: 21,
                        offset: 164,
                    },
                },
                parent: 1,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 6,
                        col: 10,
                        offset: 175,
                    },
                    end: {
                        line: 6,
                        col: 33,
                        offset: 198,
                    },
                },
                parent: 5,
            },
            {
                position: {
                    start: {
                        line: 7,
                        col: 14,
                        offset: 213,
                    },
                    end: {
                        line: 7,
                        col: 39,
                        offset: 238,
                    },
                },
                parent: 6,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 8,
                        col: 3,
                        offset: 242,
                    },
                    end: {
                        line: 8,
                        col: 18,
                        offset: 257,
                    },
                },
                parent: 0,
                task: ' ',
            },
        ],
    },
    obsidianApiVersion: '1.7.3',
    getAllTags: [],
    parseFrontMatterTags: null,
};
