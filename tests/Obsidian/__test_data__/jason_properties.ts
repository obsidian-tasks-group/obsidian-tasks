export const jason_properties = {
    filePath: 'Test Data/jason_properties.md',
    fileContents:
        '---\n' +
        '{\n' +
        '  "tags": "journal",\n' +
        '  "publish": false\n' +
        '}\n' +
        '---\n' +
        '\n' +
        '# jason_properties\n' +
        '\n' +
        "- [ ] #task Task in 'jason_properties'\n",
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
                position: {
                    start: {
                        line: 9,
                        col: 6,
                        offset: 79,
                    },
                    end: {
                        line: 9,
                        col: 11,
                        offset: 84,
                    },
                },
            },
        ],
        headings: [
            {
                heading: 'jason_properties',
                level: 1,
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 53,
                    },
                    end: {
                        line: 7,
                        col: 18,
                        offset: 71,
                    },
                },
            },
        ],
        sections: [
            {
                type: 'yaml',
                position: {
                    start: {
                        line: 0,
                        col: 0,
                        offset: 0,
                    },
                    end: {
                        line: 5,
                        col: 3,
                        offset: 51,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 7,
                        col: 0,
                        offset: 53,
                    },
                    end: {
                        line: 7,
                        col: 18,
                        offset: 71,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 9,
                        col: 0,
                        offset: 73,
                    },
                    end: {
                        line: 9,
                        col: 38,
                        offset: 111,
                    },
                },
            },
        ],
        listItems: [
            {
                parent: -9,
                task: ' ',
                position: {
                    start: {
                        line: 9,
                        col: 0,
                        offset: 73,
                    },
                    end: {
                        line: 9,
                        col: 38,
                        offset: 111,
                    },
                },
            },
        ],
        frontmatter: {
            tags: 'journal',
            publish: false,
        },
        frontmatterLinks: [],
        v: 1,
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 5,
                col: 3,
                offset: 51,
            },
        },
    },
    obsidianApiVersion: '1.7.7',
    getAllTags: ['#journal', '#task'],
    parseFrontMatterTags: ['#journal'],
};
