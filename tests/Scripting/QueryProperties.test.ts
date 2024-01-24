import { makeQueryContextWithTasks } from '../../src/Scripting/QueryContext';

import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdown';
import { MarkdownTable } from '../../src/lib/MarkdownTable';
import { parseAndEvaluateExpression } from '../../src/Scripting/TaskExpression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { addBackticks, determineExpressionType, formatToRepresentType } from './ScriptingTestHelpers';

describe('query', () => {
    function verifyFieldDataForReferenceDocs(fields: string[]) {
        const markdownTable = new MarkdownTable(['Field', 'Type', 'Example']);
        const path = 'root/sub-folder/file containing query.md';
        const task = new TaskBuilder()
            .description('... an array with all the Tasks-tracked tasks in the vault ...')
            .build();
        const queryContext = makeQueryContextWithTasks(path, [task]);
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
        ]);
    });

    it('search properties', () => {
        verifyFieldDataForReferenceDocs(['query.allTasks']);
    });
});
