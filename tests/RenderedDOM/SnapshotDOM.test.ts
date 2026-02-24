import { execSync } from 'child_process';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';

const DOM_SELECTOR = '.markdown-reading-view :not(.metadata-container)';

// Always commit with this test skipped, as it depends on:
// - the Obsidian CLI being available (Obsidian 1.12 onwards)
//  - the Obsidian CLI enabled
//  - the user having open in Obsidian the demo vault in 'resources/sample_vaults/Tasks-Demo/'
describe.skip('DOM snapshots', () => {
    // TODO Ensure the correct vault is open and active in Obsidian
    // TODO Iterate over all values in AllMockDataNames
    it('all_link_types', () => {
        // Requirements:
        // 1. The Demo Vault must be the active Obsidian vault
        const filename = 'all_link_types';
        const data = MockDataLoader.get(filename);
        const path = data.filePath;
        expect(path).toEqual('Test Data/all_link_types.md');

        // Load the file
        const command = `obsidian open path="${path}"`;
        expect(command).toEqual('obsidian open path="Test Data/all_link_types.md"');
        execSync(command);

        // TODO Ensure we are in reading mode

        // Save the HTML
        const html = execSync(`obsidian dev:dom selector='${DOM_SELECTOR}'`).toString();
        const prettyHTML = prettifyHTML(html);

        verifyWithFileExtension(prettyHTML, 'html');
    });
});
