import moment from 'moment';
import { Notice } from 'obsidian';
import { createTFile } from '../__mocks__/obsidian';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import {
    appendToArchiveFile,
    editorLineDeleter,
    fileLineDeleter,
    moveToArchiveFile,
} from '../../src/Obsidian/ArchiveFile';
import { fromLine } from '../TestingTools/TestHelpers';
import { FakeEditor } from '../TestingTools/FakeEditor';
import { FakeVault } from '../TestingTools/FakeVault';

vi.mock('obsidian', async () => ({
    ...(await vi.importActual('../__mocks__/obsidian')),
    Notice: vi.fn(),
}));

window.moment = moment;

const MockedNotice = vi.mocked(Notice);

function completedTask(line = '- [x] Completed task ✅ 2024-02-11') {
    return fromLine({ line })!;
}

beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    MockedNotice.mockClear();
    resetSettings();
});

describe('appendToArchiveFile', () => {
    it('should create the archive file and its missing folders', async () => {
        const vault = new FakeVault();

        const appended = await appendToArchiveFile(vault.asVault(), 'Archive/2024/Done.md', completedTask());

        expect(appended).toEqual(true);
        expect([...vault.folders]).toEqual(['Archive', 'Archive/2024']);
        expect(vault.files.get('Archive/2024/Done.md')).toEqual('- [x] Completed task ✅ 2024-02-11\n');
    });

    it.each([
        ['', '- [x] Completed task ✅ 2024-02-11\n'],
        ['- [x] Earlier task\n', '- [x] Earlier task\n- [x] Completed task ✅ 2024-02-11\n'],
        ['- [x] Earlier task', '- [x] Earlier task\n- [x] Completed task ✅ 2024-02-11\n'],
    ])('should append to the end of an existing file holding %j', async (content: string, expected: string) => {
        const vault = new FakeVault();
        vault.files.set('Completed Tasks.md', content);

        const appended = await appendToArchiveFile(vault.asVault(), 'Completed Tasks.md', completedTask());

        expect(appended).toEqual(true);
        expect(vault.files.get('Completed Tasks.md')).toEqual(expected);
    });

    it.each(['    - [x] Indented task', '\t- [x] Indented task', '> - [x] Indented task', '>     - [x] Indented task'])(
        'should append the task without its indentation, from %j',
        async (line: string) => {
            const vault = new FakeVault();

            await appendToArchiveFile(vault.asVault(), 'Completed Tasks.md', completedTask(line));

            expect(vault.files.get('Completed Tasks.md')).toEqual('- [x] Indented task\n');
        },
    );

    it('should report a failed write in a notice', async () => {
        const vault = new FakeVault();
        vault.files.set('Completed Tasks.md', '- [x] Earlier task\n');
        vault.processError = new Error('Permission denied');

        const appended = await appendToArchiveFile(vault.asVault(), 'Completed Tasks.md', completedTask());

        expect(appended).toEqual(false);
        expect(MockedNotice).toHaveBeenCalledWith(
            'Tasks: Can\'t move "Completed task" to the archive file "Completed Tasks.md":\n\nPermission denied',
            10000,
        );
    });

    it.each(['', 'Completed Tasks.txt', 'Archive/', '.md', '.archive/Done.md', 'Archive/.Done.md'])(
        "should write nothing for an archive file path %j that doesn't end in .md, or that Obsidian hides",
        async (archiveFilePath: string) => {
            const vault = new FakeVault();

            const appended = await appendToArchiveFile(vault.asVault(), archiveFilePath, completedTask());

            expect(appended).toEqual(false);
            expect(vault.files.size + vault.folders.size).toEqual(0);
            expect(MockedNotice).toHaveBeenCalledTimes(1);
        },
    );
});

describe('moveToArchiveFile', () => {
    it('should append the task to the archive file, and then delete its line', async () => {
        const vault = new FakeVault();
        const deleteLine = vi.fn(() => true);

        await moveToArchiveFile(vault.asVault(), 'Note.md', completedTask(), deleteLine);

        expect(vault.files.get('Completed Tasks.md')).toEqual('- [x] Completed task ✅ 2024-02-11\n');
        expect(deleteLine).toHaveBeenCalledWith('- [x] Completed task ✅ 2024-02-11');
        expect(MockedNotice).not.toHaveBeenCalled();
    });

    it('should leave a task completed in the archive file where it is', async () => {
        updateSettings({ archiveFilePath: '/Archive//Done.md' });
        const vault = new FakeVault();
        const deleteLine = vi.fn(() => true);

        await moveToArchiveFile(vault.asVault(), 'Archive/Done.md', completedTask(), deleteLine);

        expect(vault.files.size).toEqual(0);
        expect(deleteLine).not.toHaveBeenCalled();
    });

    it('should not delete the line if the append failed', async () => {
        updateSettings({ archiveFilePath: 'Completed Tasks.txt' });
        const vault = new FakeVault();
        const deleteLine = vi.fn(() => true);

        await moveToArchiveFile(vault.asVault(), 'Note.md', completedTask(), deleteLine);

        expect(deleteLine).not.toHaveBeenCalled();
    });

    it("should report a line it couldn't delete in a notice", async () => {
        const vault = new FakeVault();

        await moveToArchiveFile(vault.asVault(), 'Note.md', completedTask(), () => false);

        expect(vault.files.get('Completed Tasks.md')).toEqual('- [x] Completed task ✅ 2024-02-11\n');
        expect(MockedNotice).toHaveBeenCalledWith(
            'Tasks: Moved "Completed task" to the archive file "Completed Tasks.md", but couldn\'t remove it from "Note.md", so it\'s now in both files.',
            10000,
        );
    });
});

describe('editorLineDeleter', () => {
    it.each([
        ['- [ ] Before\n- [x] Done\n- [ ] After', 1, '- [ ] Before\n- [ ] After'],
        ['- [ ] Before\n- [x] Done', 1, '- [ ] Before\n'],
    ])('should delete the line from %j', (content: string, lineNumber: number, expected: string) => {
        const editor = new FakeEditor(content);

        const deleted = editorLineDeleter(editor.asEditor(), lineNumber)('- [x] Done');

        expect(deleted).toEqual(true);
        expect(editor.getValue()).toEqual(expected);
    });

    it.each([
        ['- [ ] Before\n- [x] Edited\n- [ ] After', 1],
        ['- [ ] Before', 1],
    ])("should leave %j as it is when line %i doesn't hold the task", (content: string, lineNumber: number) => {
        const editor = new FakeEditor(content);

        const deleted = editorLineDeleter(editor.asEditor(), lineNumber)('- [x] Done');

        expect(deleted).toEqual(false);
        expect(editor.getValue()).toEqual(content);
    });
});

describe('fileLineDeleter', () => {
    const file = createTFile('Note.md');

    it('should delete the line from the file', async () => {
        const vault = new FakeVault();
        vault.files.set('Note.md', '- [ ] Before\n- [x] Done\n- [ ] After\n');

        const deleted = await fileLineDeleter(vault.asVault(), file, 1)('- [x] Done');

        expect(deleted).toEqual(true);
        expect(vault.files.get('Note.md')).toEqual('- [ ] Before\n- [ ] After\n');
    });

    it("should leave the file as it is when the line doesn't hold the task", async () => {
        const vault = new FakeVault();
        vault.files.set('Note.md', '- [ ] Before\n- [x] Edited\n');

        const deleted = await fileLineDeleter(vault.asVault(), file, 1)('- [x] Done');

        expect(deleted).toEqual(false);
        expect(vault.files.get('Note.md')).toEqual('- [ ] Before\n- [x] Edited\n');
    });

    it('should report a failed write as not deleted', async () => {
        const vault = new FakeVault();
        vault.files.set('Note.md', '- [x] Done\n');
        vault.processError = new Error('Permission denied');

        const deleted = await fileLineDeleter(vault.asVault(), file, 0)('- [x] Done');

        expect(deleted).toEqual(false);
    });
});
