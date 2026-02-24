import { execSync } from 'child_process';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { AllMockDataNames, type MockDataName } from '../Obsidian/AllCacheSampleData';

const DOM_SELECTOR = '.markdown-reading-view :not(.metadata-container)';

function executeCommand(command: string): string {
    try {
        return execSync(command, { timeout: 5000 }).toString();
    } catch (e) {
        throw new Error(`Timed out running '${command}'. Is Obsidian open with the Demo Vault active?`);
    }
}

describe.skip('DOM snapshots', () => {
    /*
     This test uses the Obsidian CLI to open and render a file, then save the DOM.
     This will allow us to detect regressions and test improvements over time.
     See https://help.obsidian.md/cli

     Always commit with this test skipped, as it depends on:
      - the Obsidian CLI being available (Obsidian 1.12 onwards, Installer 1.11.7 onwards)
      - the Obsidian CLI enabled
      - the user having open in Obsidian the demo vault in 'resources/sample_vaults/Tasks-Demo/'
    */

    // TODO Ensure the correct vault is open and active in Obsidian
    it.each(AllMockDataNames)('%s', (filename: string) => {
        // Requirements:
        // 1. The Demo Vault must be the active Obsidian vault
        const data = MockDataLoader.get(<MockDataName>filename);
        const path = data.filePath;

        // Load the file
        const command = `obsidian open path="${path}"`;
        executeCommand(command);

        // TODO Ensure we are in reading mode

        // Save the HTML
        const html = executeCommand(`obsidian dev:dom selector='${DOM_SELECTOR}'`).toString();
        const prettyHTML = prettifyHTML(html);

        verifyWithFileExtension(prettyHTML, 'html');
    });
});
