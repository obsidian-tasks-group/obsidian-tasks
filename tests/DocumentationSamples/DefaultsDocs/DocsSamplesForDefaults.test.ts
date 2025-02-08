import type { Pos } from 'obsidian';

import { getTasksFileFromMockData } from '../../TestingTools/MockDataHelpers';
import query_file_defaults_all_options_null from '../../Obsidian/__test_data__/query_file_defaults_all_options_null.json';
import query_file_defaults_all_options_true from '../../Obsidian/__test_data__/query_file_defaults_all_options_true.json';
import { verifyWithFileExtension } from '../../TestingTools/ApprovalTestHelpers';
import { verifyMarkdown, verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';
import { QueryFileDefaults } from '../../../src/Query/QueryFileDefaults';

function extractFrontmatter(data: any) {
    const queryFile = getTasksFileFromMockData(data);
    const pos: Pos | undefined = queryFile.cachedMetadata.frontmatterPosition;
    return data.fileContents.slice(pos?.start.offset ?? 0, pos?.end.offset ?? 0);
}

describe('DocsSamplesForDefaults', () => {
    it('supported-properties-empty', () => {
        const frontmatter = extractFrontmatter(query_file_defaults_all_options_null);

        // Make sure that any trailing spaces have been removed from the
        // properties in query_file_defaults_all_options_null.md, to avoid
        // fighting with spaces at end of line when the approved file from this
        // test is embedded in the user docs.
        expect(frontmatter).not.toContain(': ');

        verifyWithFileExtension(frontmatter, '.yaml');
    });

    it('supported-properties-full', () => {
        verifyWithFileExtension(extractFrontmatter(query_file_defaults_all_options_true), '.yaml');
    });

    it('meta-bind-widgets-include', () => {
        verifyMarkdownForDocs(new QueryFileDefaults().metaBindPluginWidgets());
    });

    it('meta-bind-widgets-snippet', () => {
        verifyMarkdown(new QueryFileDefaults().metaBindPluginWidgets());
    });
});
