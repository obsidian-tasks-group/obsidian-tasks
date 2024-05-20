import type { CachedMetadata } from 'obsidian';
import { logging } from '../../src/lib/logging';
import { getTasksFromFileContent2 } from '../../src/Obsidian/Cache';
import { one_task } from './__test_data__/one_task';

function errorReporter() {
    return;
}

/* Test creation sequence:

- Create a sample markdown file in Tasks demo vault (root/Test Data/) with the simplest content
to represent your test case. Choose a meaningful file name in snake case. See example in 'Test Data/one_task.md'.

- Copy-paste the function below in the Obsidian developer console:

async function getData(filePath) {
    const tFile = app.vault.getAbstractFileByPath(filePath);

    const fileContents = await app.vault.read(tFile);
    const cachedMetadata = app.metadataCache.getFileCache(tFile);
    console.log({ filePath, fileContents, cachedMetadata });
}

- Call it with your file path in the console:

await getData('Test Data/one_task.md')

- Right-click on the object in the console and select 'Copy object'.

- Paste that data in a .ts file for your test as a constant with
a meaningful name (See example in test/Obsidian/__test_data__/one_task.ts). Set file name same as
the markdown file in the demo vault. The data will be in JSON format, so reformat the data as a destructured object
with your IDE.

- Use the data in the test with `readTasksFromSimulatedFile()`, the argument is the constant you
created in the previous step.

- Remember to commit the markdown file in the demo vault and the file with the simulated data.

 */

interface SimulatedFile {
    cachedMetadata: CachedMetadata;
    filePath: string;
    fileContents: string;
}

function readTasksFromSimulatedFile(testData: SimulatedFile) {
    const logger = logging.getLogger('testCache');
    return getTasksFromFileContent2(
        testData.filePath,
        testData.fileContents,
        testData.cachedMetadata.listItems!,
        logger,
        testData.cachedMetadata,
        errorReporter,
    );
}

describe('cache', () => {
    it('should read one task', () => {
        const tasks = readTasksFromSimulatedFile(one_task);
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual('#task the only task here');
    });
});
