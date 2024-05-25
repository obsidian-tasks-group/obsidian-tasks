export const multi_line_task_and_list_item = {
    filePath: 'Test Data/multi_line_task_and_list_item.md',
    fileContents:
        '# multi_line_task_and_list_item\n' +
        '\n' +
        "- [ ] #task Task in 'multi_line_task_and_list_item'\n" +
        '    task line 1\n' +
        '    task line 2\n' +
        "- muli-line list item in 'multi_line_task_and_list_item'\n" +
        '    list item line 1\n' +
        '    list item line 2\n' +
        '\n' +
        'See: https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2061:\n' +
        'Multi-line tasks (indented lines below a task items) are not shown in Reading mode and Tasks query results\n',
    cachedMetadata: {
        tags: [
            {
                position: {
                    start: {
                        line: 2,
                        col: 6,
                        offset: 39,
                    },
                    end: {
                        line: 2,
                        col: 11,
                        offset: 44,
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
                        col: 31,
                        offset: 31,
                    },
                },
                heading: 'multi_line_task_and_list_item',
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
                        col: 31,
                        offset: 31,
                    },
                },
            },
            {
                type: 'list',
                position: {
                    start: {
                        line: 2,
                        col: 0,
                        offset: 33,
                    },
                    end: {
                        line: 7,
                        col: 20,
                        offset: 215,
                    },
                },
            },
            {
                type: 'paragraph',
                position: {
                    start: {
                        line: 9,
                        col: 0,
                        offset: 217,
                    },
                    end: {
                        line: 10,
                        col: 106,
                        offset: 396,
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
                        offset: 33,
                    },
                    end: {
                        line: 4,
                        col: 15,
                        offset: 116,
                    },
                },
                parent: -2,
                task: ' ',
            },
            {
                position: {
                    start: {
                        line: 5,
                        col: 0,
                        offset: 117,
                    },
                    end: {
                        line: 7,
                        col: 20,
                        offset: 215,
                    },
                },
                parent: -2,
            },
        ],
    },
};
