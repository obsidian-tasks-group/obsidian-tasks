import type { Reference } from 'obsidian';
import { makeQueryContextWithTasks } from '../../src/Scripting/QueryContext';

import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { MarkdownTable } from '../../src/lib/MarkdownTable';
import { parseAndEvaluateExpression } from '../../src/Scripting/TaskExpression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import query_using_properties from '../Obsidian/__test_data__/query_using_properties.json';
import { LinkResolver } from '../../src/Task/LinkResolver';
import { getFirstLinkpathDestFromData } from '../__mocks__/obsidian';
import { addBackticks, determineExpressionType, formatToRepresentType } from './ScriptingTestHelpers';

beforeEach(() => {});

afterEach(() => {
    LinkResolver.getInstance().resetGetFirstLinkpathDestFn();
});

describe('query', () => {
    function verifyFieldDataForReferenceDocs(fields: string[]) {
        const markdownTable = new MarkdownTable(['Field', 'Type', 'Example']);
        const cachedMetadata = getTasksFileFromMockData(query_using_properties).cachedMetadata;

        // This is getting annoying, having to do this repeatedly.
        LinkResolver.getInstance().setGetFirstLinkpathDestFn((rawLink: Reference, _sourcePath: string) =>
            getFirstLinkpathDestFromData(query_using_properties, rawLink),
        );

        const tasksFile = new TasksFile('root/sub-folder/file containing query.md', cachedMetadata);
        const task = new TaskBuilder()
            .description('... an array with all the Tasks-tracked tasks in the vault ...')
            .build();
        const queryContext = makeQueryContextWithTasks(tasksFile, [task]);
        for (const field of fields) {
            const value1 = parseAndEvaluateExpression(task, field, queryContext);
            const cells = [
                addBackticks(field),
                addBackticks(determineExpressionType(value1)),
                addBackticks(formatToRepresentType(value1)),
            ];
            markdownTable.addRow(cells);
        }
        verifyMarkdownForDocs(markdownTable.markdown);
    }

    it('file properties', () => {
        verifyFieldDataForReferenceDocs([
            'query.file.path',
            'query.file.pathWithoutExtension',
            'query.file.root',
            'query.file.folder',
            'query.file.filename',
            'query.file.filenameWithoutExtension',
            "query.file.hasProperty('task_instruction')",
            "query.file.hasProperty('non_existent_property')",
            "query.file.property('task_instruction')",
            "query.file.property('non_existent_property')",
            'query.file.outlinksInProperties',
            'query.file.outlinksInBody',
            'query.file.outlinks',
        ]);
    });

    it('search properties', () => {
        verifyFieldDataForReferenceDocs(['query.allTasks']);
    });
});
