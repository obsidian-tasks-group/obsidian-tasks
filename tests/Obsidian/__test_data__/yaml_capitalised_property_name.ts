export const yaml_capitalised_property_name = {
    filePath: 'Test Data/yaml_capitalised_property_name.md',
    fileContents:
        '---\n' +
        'CAPITAL_property: some value\n' +
        '---\n' +
        '\n' +
        '# yaml_capitalised_property_name\n' +
        '\n' +
        "- [ ] #task Task in 'yaml_capitalised_property_name'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 6,
                        offset: 78,
                    },
                    end: {
                        line: 6,
                        col: 11,
                        offset: 83,
                    },
                },
                tag: '#task',
            },
        ],
        headings: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 38,
                    },
                    end: {
                        line: 4,
                        col: 32,
                        offset: 70,
                    },
                },
                heading: 'yaml_capitalised_property_name',
                level: 1,
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
                        line: 2,
                        col: 3,
                        offset: 36,
                    },
                },
            },
            {
                type: 'heading',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 38,
                    },
                    end: {
                        line: 4,
                        col: 32,
                        offset: 70,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 72,
                    },
                    end: {
                        line: 6,
                        col: 52,
                        offset: 124,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 6,
                        col: 0,
                        offset: 72,
                    },
                    end: {
                        line: 6,
                        col: 52,
                        offset: 124,
                    },
                },
                parent: -6,
                task: ' ',
            },
        ],
        frontmatter: {
            CAPITAL_property: 'some value',
        },
        frontmatterPosition: {
            start: {
                line: 0,
                col: 0,
                offset: 0,
            },
            end: {
                line: 2,
                col: 3,
                offset: 36,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.6.7',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
