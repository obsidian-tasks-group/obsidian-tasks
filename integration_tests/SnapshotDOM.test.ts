import { execSync } from 'child_process';
import { MockDataLoader } from '../tests/TestingTools/MockDataLoader';
import { prettifyHTML } from '../tests/TestingTools/HTMLHelpers';
import { verifyHtml } from '../tests/TestingTools/ApprovalTestHelpers';
import type { MockDataName } from '../tests/Obsidian/AllCacheSampleData';

const DOM_SELECTOR = '.markdown-reading-view :not(.metadata-container)';

function executeCommand(command: string): string {
    try {
        return execSync(command, { timeout: 5000 }).toString();
    } catch (e) {
        throw new Error(`Timed out running '${command}'. Is Obsidian open with the Demo Vault active?`);
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function executeAndCheckCLICommand(message: string, instruction: string, expected: string): void {
    const actual = executeCommand(instruction);
    if (actual !== expected) {
        throw new Error(message + ' - expected:\n' + expected + '  but got:\n' + actual);
    }
}

describe('DOM snapshots', () => {
    /*
     This test uses the Obsidian CLI to open and render a file, then save the DOM.
     This will allow us to detect regressions and test improvements over time.
     See:
        - https://help.obsidian.md/cli
        - https://publish.obsidian.md/tasks-contributing/Testing/Integration+Tests
    */

    const mockDataNames: MockDataName[] = ['code_block_in_task'];
    it.each(mockDataNames)('%s', async (filename: string) => {
        // Ensure the correct vault is open and active in Obsidian
        executeAndCheckCLICommand('The wrong vault is open', 'obsidian vault info=name', 'Tasks-Demo\n');

        const data = MockDataLoader.get(<MockDataName>filename);
        const path = data.filePath;

        // Load the file
        const command = `obsidian open path="${path}"`;
        executeCommand(command);

        // Wait a bit, to allow time for rendering
        await sleep(500);

        // Ensure we are in Reading mode
        // (Source or Live Preview would be '=> source\n')
        executeAndCheckCLICommand(
            'The active note should be in Reading Mode',
            'obsidian eval code="app.workspace.activeLeaf.view.getState().mode"',
            '=> preview\n',
        );

        // Save the HTML
        const html = executeCommand(`obsidian dev:dom selector='${DOM_SELECTOR}'`).toString();
        const prettyHTML = await prettifyHTML(html);

        // The following output is dependent on Obsidian window size
        //  <div class="markdown-preview-sizer markdown-preview-section" style="padding-bottom: 355px; min-height: 362px">
        const normalizedHTML = prettyHTML.replace(
            /(<div class="markdown-preview-sizer markdown-preview-section" style="padding-bottom: )\d+px(; min-height: )\d+px(")/g,
            '$1444px$2555px$3',
        );
        verifyHtml(normalizedHTML);
    });
});
