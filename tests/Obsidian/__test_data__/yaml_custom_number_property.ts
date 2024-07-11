export const yaml_custom_number_property = {
    filePath: 'Test Data/yaml_custom_number_property.md',
    fileContents:
        '---\n' + 'custom_number_prop: 42\n' + '---\n' + '\n' + "- [ ] #task Task in 'yaml_custom_number_property'\n",
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 6,
                        offset: 38,
                    },
                    end: {
                        line: 4,
                        col: 11,
                        offset: 43,
                    },
                },
                tag: '#task',
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
                        offset: 30,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 32,
                    },
                    end: {
                        line: 4,
                        col: 49,
                        offset: 81,
                    },
                },
            },
        ],
        listItems: [
            {
                position: {
                    start: {
                        line: 4,
                        col: 0,
                        offset: 32,
                    },
                    end: {
                        line: 4,
                        col: 49,
                        offset: 81,
                    },
                },
                parent: -4,
                task: ' ',
            },
        ],
        frontmatter: {
            custom_number_prop: 42,
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
                offset: 30,
            },
        },
        frontmatterLinks: [],
    },
    obsidianApiVersion: '1.6.5',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
