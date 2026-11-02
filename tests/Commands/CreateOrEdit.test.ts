import moment from 'moment';
import { type App, MarkdownView } from 'obsidian';
import { createOrEdit } from '../../src/Commands/CreateOrEdit';
import { TaskModal } from '../../src/Obsidian/TaskModal';
import { Status } from '../../src/Statuses/Status';
import { FakeEditor } from '../TestingTools/FakeEditor';
import { FakeVault } from '../TestingTools/FakeVault';

vi.mock('../../src/Obsidian/TaskModal', () => ({
    TaskModal: vi.fn(function () {
        return { open: vi.fn() };
    }),
}));

window.moment = moment;

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-31'));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('createOrEdit', () => {
    it('should move a to_file task completed in the modal out of the editor', async () => {
        const vault = new FakeVault();
        const editor = new FakeEditor('# Plants\n- [ ] Water the plants 🏁 to_file\n- [ ] Repot the fern', {
            line: 1,
            ch: 0,
        });
        const view = Object.assign(Object.create(MarkdownView.prototype), {
            file: { path: 'Plants.md' },
        }) as MarkdownView;
        const app = { vault: vault.asVault() } as unknown as App;

        createOrEdit(false, editor.asEditor(), view, app, [], async () => {});
        const { task, onSubmit } = vi.mocked(TaskModal).mock.calls[0][0];
        onSubmit(task.handleNewStatusWithRecurrenceInUsersOrder(Status.DONE));

        await vi.waitFor(() => expect(editor.getValue()).toEqual('# Plants\n- [ ] Repot the fern'));
        expect(vault.files.get('Completed Tasks.md')).toEqual('- [x] Water the plants 🏁 to_file ✅ 2024-12-31\n');
    });
});
