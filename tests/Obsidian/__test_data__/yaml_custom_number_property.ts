export const yaml_custom_number_property = {
    filePath: 'Test Data/yaml_custom_number_property.md',
    fileContents:
        '---\n' + 'custom_number_prop: 42\n' + '---\n' + '\n' + "- [ ] #task Task in 'yaml_custom_number_property'\n",
    cachedMetadata: {
        tags: [
            {
                tag: '#task',
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
                parent: -4,
                task: ' ',
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
        frontmatter: {
            custom_number_prop: 42,
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
                line: 2,
                col: 3,
                offset: 30,
            },
        },
    },
    obsidianApiVersion: '1.7.7',
    getAllTags: ['#task'],
    parseFrontMatterTags: null,
};
